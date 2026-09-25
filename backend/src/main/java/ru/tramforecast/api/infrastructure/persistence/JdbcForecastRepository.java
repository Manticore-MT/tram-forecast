package ru.tramforecast.api.infrastructure.persistence;

import java.sql.Array;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import ru.tramforecast.api.domain.model.ForecastPoint;
import ru.tramforecast.api.domain.model.Horizon;
import ru.tramforecast.api.domain.model.RouteId;
import ru.tramforecast.api.domain.model.StopForecast;
import ru.tramforecast.api.domain.model.StopId;
import ru.tramforecast.api.domain.port.ForecastRepository;

/**
 * Postgres-backed {@link ForecastRepository}. A snapshot is the set of rows sharing one
 * {@code generated_at} for a horizon and date, so "latest" is the maximum and "initial" the
 * minimum of that column. Rows are only ever inserted.
 */
public class JdbcForecastRepository implements ForecastRepository {

    private static final String SELECT = """
            SELECT route_id, stop_id, period_start, baseline, forecast, generated_at, model_version, factors
            FROM forecast_snapshot
            WHERE horizon = ? AND anchor_date = ?
              AND generated_at = (SELECT %s(generated_at) FROM forecast_snapshot WHERE horizon = ? AND anchor_date = ?)
            ORDER BY route_id, stop_id, period_start
            """;

    private static final String INSERT = """
            INSERT INTO forecast_snapshot
                (route_id, stop_id, horizon, anchor_date, period_start, baseline, forecast, generated_at,
                 model_version, factors)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """;

    private final JdbcTemplate jdbc;

    /**
     * Creates the repository.
     *
     * @param jdbc Spring JDBC template bound to the application datasource
     */
    public JdbcForecastRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public List<StopForecast> findLatest(Horizon horizon, LocalDate date) {
        return query(String.format(SELECT, "MAX"), horizon, date);
    }

    @Override
    public List<StopForecast> findInitial(Horizon horizon, LocalDate date) {
        return query(String.format(SELECT, "MIN"), horizon, date);
    }

    @Override
    @Transactional
    public void saveAll(List<StopForecast> forecasts) {
        List<Object[]> rows = new ArrayList<>();
        for (StopForecast forecast : forecasts) {
            for (ForecastPoint point : forecast.points()) {
                rows.add(new Object[] {
                    forecast.routeId().value(),
                    forecast.stopId().value(),
                    forecast.horizon().name(),
                    forecast.date(),
                    utc(point.periodStart()),
                    point.baseline(),
                    point.forecast(),
                    utc(forecast.generatedAt()),
                    forecast.modelVersion(),
                    forecast.factors().toArray(new String[0])
                });
            }
        }
        jdbc.batchUpdate(INSERT, rows, 500, (ps, row) -> {
            for (int i = 0; i < 9; i++) {
                ps.setObject(i + 1, row[i]);
            }
            ps.setArray(10, ps.getConnection().createArrayOf("text", (String[]) row[9]));
        });
    }

    @Override
    public List<LocalDate> recentDates(Horizon horizon, int limit) {
        return jdbc.query(
                "SELECT DISTINCT anchor_date FROM forecast_snapshot WHERE horizon = ? ORDER BY anchor_date DESC LIMIT ?",
                (rs, n) -> rs.getObject("anchor_date", LocalDate.class),
                horizon.name(),
                limit);
    }

    private List<StopForecast> query(String sql, Horizon horizon, LocalDate date) {
        Map<String, Builder> grouped = new LinkedHashMap<>();
        jdbc.query(sql, (ResultSet rs) -> {
            String route = rs.getString("route_id");
            String stop = rs.getString("stop_id");
            Builder builder = grouped.computeIfAbsent(route + "|" + stop, k -> new Builder(route, stop, rs));
            builder.points.add(new ForecastPoint(
                    rs.getObject("period_start", OffsetDateTime.class).toInstant(),
                    rs.getDouble("baseline"),
                    rs.getDouble("forecast"),
                    null));
        }, horizon.name(), date, horizon.name(), date);
        return grouped.values().stream().map(b -> b.build(horizon, date)).toList();
    }

    private static OffsetDateTime utc(java.time.Instant instant) {
        return OffsetDateTime.ofInstant(instant, ZoneOffset.UTC);
    }

    /** Accumulates the rows of one stop while a result set is read. */
    private static final class Builder {
        private final String route;
        private final String stop;
        private final java.time.Instant generatedAt;
        private final String modelVersion;
        private final List<String> factors;
        private final List<ForecastPoint> points = new ArrayList<>();

        Builder(String route, String stop, ResultSet rs) {
            try {
                this.route = route;
                this.stop = stop;
                this.generatedAt = rs.getObject("generated_at", OffsetDateTime.class).toInstant();
                this.modelVersion = rs.getString("model_version");
                Array array = rs.getArray("factors");
                this.factors = array == null ? List.of() : List.of((String[]) array.getArray());
            } catch (SQLException e) {
                throw new IllegalStateException("Cannot read forecast row", e);
            }
        }

        StopForecast build(Horizon horizon, LocalDate date) {
            return new StopForecast(
                    new RouteId(route), new StopId(stop), horizon, date, generatedAt, modelVersion, points, factors);
        }
    }
}
