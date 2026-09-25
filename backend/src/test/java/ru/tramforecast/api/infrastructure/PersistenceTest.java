package ru.tramforecast.api.infrastructure;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import ru.tramforecast.api.domain.model.ActualValue;
import ru.tramforecast.api.domain.model.ForecastPoint;
import ru.tramforecast.api.domain.model.Horizon;
import ru.tramforecast.api.domain.model.LoadMatrixCell;
import ru.tramforecast.api.domain.model.RouteId;
import ru.tramforecast.api.domain.model.StopForecast;
import ru.tramforecast.api.domain.model.StopId;
import ru.tramforecast.api.infrastructure.persistence.JdbcActualRepository;
import ru.tramforecast.api.infrastructure.persistence.JdbcForecastRepository;

/**
 * Runs the real SQL of the storage adapters against Postgres in a container, migrated by the same
 * Flyway scripts as production. Skipped automatically when Docker is not available.
 */
@Testcontainers(disabledWithoutDocker = true)
class PersistenceTest {

    private static final ZoneId MOSCOW = ZoneId.of("Europe/Moscow");
    private static final LocalDate DATE = LocalDate.of(2026, 9, 21);

    @Container
    private static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:17-alpine");

    private static JdbcTemplate jdbc;
    private JdbcForecastRepository forecasts;
    private JdbcActualRepository actuals;

    /**
     * Migrates the schema once.
     */
    @BeforeAll
    static void migrate() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource(
                POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
        Flyway.configure().dataSource(dataSource).load().migrate();
        jdbc = new JdbcTemplate(dataSource);
    }

    /**
     * Empties the tables and creates fresh adapters.
     */
    @BeforeEach
    void clean() {
        jdbc.execute("TRUNCATE forecast_snapshot, actual_value");
        forecasts = new JdbcForecastRepository(jdbc);
        actuals = new JdbcActualRepository(jdbc, MOSCOW);
    }

    /**
     * Snapshots are append-only; latest and initial pick the newest and the oldest, and factors
     * survive the round trip.
     */
    @Test
    void snapshotsAreAppendOnlyWithLatestAndInitial() {
        Instant first = Instant.parse("2026-09-21T06:00:00Z");
        Instant second = first.plusSeconds(900);
        forecasts.saveAll(List.of(stop("S1", first, 130, List.of("weekend", "rain")), stop("S2", first, 100, List.of())));
        forecasts.saveAll(List.of(stop("S1", second, 160, List.of()), stop("S2", second, 90, List.of())));

        List<StopForecast> latest = forecasts.findLatest(Horizon.DAY, DATE);
        List<StopForecast> initial = forecasts.findInitial(Horizon.DAY, DATE);

        assertThat(latest).hasSize(2);
        assertThat(latest.get(0).points().get(0).forecast()).isEqualTo(160);
        assertThat(initial.get(0).points().get(0).forecast()).isEqualTo(130);
        assertThat(initial.get(0).factors()).containsExactly("weekend", "rain");
        assertThat(initial.get(0).generatedAt()).isEqualTo(first);
        assertThat(forecasts.recentDates(Horizon.DAY, 5)).containsExactly(DATE);
        assertThat(forecasts.findLatest(Horizon.MONTH, DATE)).isEmpty();
    }

    /**
     * Facts are aggregated to the horizon granularity with days cut in the API zone.
     */
    @Test
    void factsAreAggregatedToTheHorizonGranularity() {
        insertFact("R1", "S1", "2026-09-21T09:00:00+03:00", 100);
        insertFact("R1", "S2", "2026-09-21T09:00:00+03:00", 50);
        insertFact("R1", "S1", "2026-09-21T10:00:00+03:00", 10);
        insertFact("R1", "S1", "2026-09-14T09:00:00+03:00", 70);
        // 00:30 Moscow time on the 22nd is still the 21st in UTC: it must land on the 22nd.
        insertFact("R1", "S1", "2026-09-22T00:30:00+03:00", 5);

        List<ActualValue> hourly = actuals.find(Horizon.DAY, DATE);
        assertThat(hourly).hasSize(3);
        assertThat(hourly).extracting(ActualValue::value).containsExactlyInAnyOrder(100.0, 50.0, 10.0);

        List<ActualValue> daily = actuals.find(Horizon.MONTH, DATE);
        assertThat(daily).filteredOn(v -> v.stopId().equals(new StopId("S1"))).extracting(ActualValue::value)
                .containsExactly(70.0, 110.0, 5.0);
        assertThat(daily.get(0).periodStart()).isEqualTo(Instant.parse("2026-09-13T21:00:00Z"));
    }

    /**
     * The load matrix averages the route total per day of week and hour.
     */
    @Test
    void loadMatrixAveragesRouteTotalPerDayOfWeekAndHour() {
        insertFact("R1", "S1", "2026-09-14T09:00:00+03:00", 100);
        insertFact("R1", "S2", "2026-09-14T09:00:00+03:00", 50);
        insertFact("R1", "S1", "2026-09-21T09:00:00+03:00", 90);
        insertFact("R1", "S2", "2026-09-21T09:00:00+03:00", 30);

        List<LoadMatrixCell> cells = actuals.loadMatrix(new RouteId("R1")).cells();

        assertThat(cells).hasSize(1);
        assertThat(cells.get(0).dayOfWeek()).isEqualTo(1);
        assertThat(cells.get(0).hour()).isEqualTo(9);
        assertThat(cells.get(0).value()).isEqualTo(135.0);
        assertThat(actuals.loadMatrix(new RouteId("none")).cells()).isEmpty();
    }

    private static void insertFact(String route, String stop, String at, double value) {
        jdbc.update(
                "INSERT INTO actual_value (route_id, stop_id, period_start, value) VALUES (?, ?, ?, ?)",
                route, stop, OffsetDateTime.parse(at), value);
    }

    private static StopForecast stop(String stop, Instant generatedAt, double forecast, List<String> factors) {
        return new StopForecast(
                new RouteId("R1"), new StopId(stop), Horizon.DAY, DATE, generatedAt, "test",
                List.of(new ForecastPoint(Instant.parse("2026-09-20T21:00:00Z"), 100, forecast, null)), factors);
    }
}
