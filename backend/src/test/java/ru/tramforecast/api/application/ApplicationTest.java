package ru.tramforecast.api.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import ru.tramforecast.api.domain.model.ActualValue;
import ru.tramforecast.api.domain.model.AttentionLevel;
import ru.tramforecast.api.domain.model.CorrectionCoefficients;
import ru.tramforecast.api.domain.model.ForecastPoint;
import ru.tramforecast.api.domain.model.Horizon;
import ru.tramforecast.api.domain.model.ModelStats;
import ru.tramforecast.api.domain.model.RecommendationAction;
import ru.tramforecast.api.domain.model.RouteId;
import ru.tramforecast.api.domain.model.SnapshotKind;
import ru.tramforecast.api.domain.model.StopForecast;
import ru.tramforecast.api.domain.model.StopId;
import ru.tramforecast.api.domain.port.MlForecastClient;
import ru.tramforecast.api.domain.port.MlUnavailableException;
import ru.tramforecast.api.domain.service.AttentionPolicy;
import ru.tramforecast.api.domain.service.AttentionZoneCalculator;
import ru.tramforecast.api.domain.service.RecommendationPolicy;
import ru.tramforecast.api.support.InMemoryActualRepository;
import ru.tramforecast.api.support.InMemoryForecastRepository;

/**
 * Tests of the use cases against in-memory storage and a scripted ML client, including the agreed
 * rule: read aggregates from storage, ask ML only on a miss.
 */
class ApplicationTest {

    private static final ZoneId ZONE = ZoneId.of("Europe/Moscow");
    private static final LocalDate DATE = LocalDate.of(2026, 9, 25);
    private static final Instant NOON = Instant.parse("2026-09-25T09:00:00Z");
    private static final Instant HOUR = Instant.parse("2026-09-24T21:00:00Z");

    private final AtomicInteger mlCalls = new AtomicInteger();
    private final InMemoryForecastRepository forecasts = new InMemoryForecastRepository();
    private final InMemoryActualRepository actuals = new InMemoryActualRepository(ZONE);
    private boolean mlDown;
    private Instant mlTime = NOON;

    private ForecastLoader loader;
    private ForecastPreparer preparer;

    /**
     * Wires the services around the fakes.
     */
    @BeforeEach
    void setUp() {
        MlForecastClient ml = (horizon, date) -> {
            mlCalls.incrementAndGet();
            if (mlDown) {
                throw new MlUnavailableException("down", null);
            }
            return List.of(
                    stop("S1", mlTime, new ForecastPoint(HOUR, 100, 130, null)),
                    stop("S2", mlTime, new ForecastPoint(HOUR, 100, 102, null)));
        };
        loader = new ForecastLoader(forecasts, ml);
        ForecastDates dates = new ForecastDates(Clock.fixed(NOON, ZONE), ZONE, 1);
        preparer = new ForecastPreparer(loader, actuals, dates);
    }

    /**
     * A storage miss asks ML once, stores the answer, and the next read is served from storage.
     */
    @Test
    void storageMissAsksMlOnceThenServesFromStorage() {
        assertThat(loader.load(Horizon.DAY, DATE, SnapshotKind.LATEST)).hasSize(2);
        assertThat(loader.load(Horizon.DAY, DATE, SnapshotKind.LATEST)).hasSize(2);

        assertThat(mlCalls).hasValue(1);
        assertThat(forecasts.size()).isEqualTo(2);
    }

    /**
     * Stored data is served even when ML is down, and a miss with ML down is reported clearly.
     */
    @Test
    void mlOutageOnlyMattersWhenNothingIsStored() {
        mlDown = true;
        assertThatThrownBy(() -> loader.load(Horizon.DAY, DATE, SnapshotKind.LATEST))
                .isInstanceOf(ForecastUnavailableException.class);

        mlDown = false;
        loader.load(Horizon.DAY, DATE, SnapshotKind.LATEST);
        mlDown = true;
        assertThat(loader.load(Horizon.DAY, DATE, SnapshotKind.LATEST)).hasSize(2);
    }

    /**
     * Snapshots are append-only: the initial one survives a later recompute, the latest moves on.
     */
    @Test
    void initialSnapshotSurvivesLaterRecompute() {
        loader.load(Horizon.DAY, DATE, SnapshotKind.LATEST);
        mlTime = NOON.plusSeconds(900);
        new RefreshForecastService(forecasts, (h, d) -> List.of(
                stop("S1", mlTime, new ForecastPoint(HOUR, 100, 160, null)),
                stop("S2", mlTime, new ForecastPoint(HOUR, 100, 101, null)))).refresh(Horizon.DAY, DATE);

        assertThat(loader.load(Horizon.DAY, DATE, SnapshotKind.INITIAL).get(0).points().get(0).forecast())
                .isEqualTo(130);
        assertThat(loader.load(Horizon.DAY, DATE, SnapshotKind.LATEST).get(0).points().get(0).forecast())
                .isEqualTo(160);
    }

    /**
     * Attention zones are computed by the backend from the loaded aggregates.
     */
    @Test
    void attentionZonesComeFromLoadedAggregates() {
        AttentionResult result = new GetAttentionZonesService(preparer, new AttentionZoneCalculator(
                new AttentionPolicy(10, 25), new RecommendationPolicy(10)))
                .get(ForecastQuery.of(Horizon.DAY, DATE));

        assertThat(result.zones()).hasSize(1);
        assertThat(result.zones().get(0).stopId().value()).isEqualTo("S1");
        assertThat(result.zones().get(0).level()).isEqualTo(AttentionLevel.CRITICAL);
    }

    /**
     * Correction coefficients scale the forecast, facts are filled in and the interval is applied.
     */
    @Test
    void preparerAppliesCorrectionFactsAndInterval() {
        actuals.add(new ActualValue(new RouteId("R1"), new StopId("S1"), HOUR, 111));
        ForecastQuery query = new ForecastQuery(
                Horizon.DAY, DATE, SnapshotKind.LATEST, new CorrectionCoefficients(1.0, 1.1, 1.0), null, null);

        StopForecast s1 = preparer.prepare(query).stops().get(0);
        assertThat(s1.points().get(0).forecast()).isCloseTo(143.0, org.assertj.core.data.Offset.offset(1e-9));
        assertThat(s1.points().get(0).actual()).isEqualTo(111.0);

        ForecastQuery outside = new ForecastQuery(
                Horizon.DAY, DATE, SnapshotKind.LATEST, null, HOUR.plusSeconds(3600), null);
        assertThat(preparer.prepare(outside).stops().get(0).points()).isEmpty();
    }

    /**
     * A date more than a year ahead is rejected with a clear message.
     */
    @Test
    void datesTooFarAheadAreRejected() {
        assertThatThrownBy(() -> preparer.prepare(ForecastQuery.of(Horizon.DAY, DATE.plusYears(1).plusDays(1))))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("at most 1 year");
    }

    /**
     * Stop details carry the verdict, the recommendation and the year-ago facts aligned to now.
     */
    @Test
    void stopDetailsCarryVerdictAndYearAgoFacts() {
        actuals.add(new ActualValue(
                new RouteId("R1"), new StopId("S1"), HOUR.atZone(ZONE).minusYears(1).toInstant(), 95));
        GetStopForecastService service = new GetStopForecastService(
                preparer,
                new HistoryAligner(actuals, ZONE),
                new AttentionPolicy(10, 25),
                new RecommendationPolicy(10));

        StopForecastResult result = service.get(new RouteId("R1"), new StopId("S1"), ForecastQuery.of(Horizon.DAY, DATE));

        assertThat(result.level()).isEqualTo(AttentionLevel.CRITICAL);
        assertThat(result.recommendation().action()).isEqualTo(RecommendationAction.ADD_VEHICLE);
        assertThat(result.peak().forecast()).isEqualTo(130);
        assertThat(result.lastYear()).hasSize(1);
        assertThat(result.lastYear().get(0).periodStart()).isEqualTo(HOUR);
        assertThatThrownBy(() -> service.get(new RouteId("R1"), new StopId("nope"), ForecastQuery.of(Horizon.DAY, DATE)))
                .isInstanceOf(NotFoundException.class);
    }

    /**
     * Accuracy is measured on the initial snapshot against the facts and reported as WAPE.
     */
    @Test
    void modelStatsMeasureInitialSnapshotAgainstFacts() {
        loader.load(Horizon.DAY, DATE, SnapshotKind.LATEST);
        actuals.add(new ActualValue(new RouteId("R1"), new StopId("S1"), HOUR, 100));
        actuals.add(new ActualValue(new RouteId("R1"), new StopId("S2"), HOUR, 100));

        ModelStats stats = new GetModelStatsService(forecasts, actuals).get(30);

        assertThat(stats.wape()).isCloseTo(0.16, org.assertj.core.data.Offset.offset(1e-9));
        assertThat(stats.wapeScore()).isCloseTo(0.84, org.assertj.core.data.Offset.offset(1e-9));
        assertThat(stats.history()).hasSize(1);
        assertThatThrownBy(() -> new GetModelStatsService(forecasts, actuals).get(0))
                .isInstanceOf(InvalidRequestException.class);
    }

    private static StopForecast stop(String stop, Instant generatedAt, ForecastPoint point) {
        return new StopForecast(
                new RouteId("R1"), new StopId(stop), Horizon.DAY, DATE, generatedAt, "test", List.of(point), List.of());
    }
}
