package ru.tramforecast.api.infrastructure.persistence;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import ru.tramforecast.api.domain.model.ActualValue;
import ru.tramforecast.api.domain.model.Horizon;
import ru.tramforecast.api.domain.model.LoadMatrix;
import ru.tramforecast.api.domain.model.LoadMatrixCell;
import ru.tramforecast.api.domain.model.RouteId;
import ru.tramforecast.api.domain.model.StopId;
import ru.tramforecast.api.domain.port.ActualRepository;
import ru.tramforecast.api.domain.service.ForecastPeriod;

/**
 * Postgres-backed {@link ActualRepository}. Facts are stored hourly and summed into the horizon's
 * granularity on read, with days and months cut in the API zone.
 */
public class JdbcActualRepository implements ActualRepository {

    private final JdbcTemplate jdbc;
    private final ZoneId zone;

    /**
     * Creates the repository.
     *
     * @param jdbc Spring JDBC template bound to the application datasource
     * @param zone zone in which days, months and years begin
     */
    public JdbcActualRepository(JdbcTemplate jdbc, ZoneId zone) {
        this.jdbc = jdbc;
        this.zone = zone;
    }

    @Override
    public List<ActualValue> find(Horizon horizon, LocalDate date) {
        ForecastPeriod period = ForecastPeriod.of(horizon, date, zone);
        String unit = switch (horizon.granularity()) {
            case HOUR -> "hour";
            case DAY -> "day";
            case MONTH -> "month";
        };
        String sql = "SELECT route_id, stop_id, "
                + "(date_trunc('" + unit + "', period_start AT TIME ZONE ?::text) AT TIME ZONE ?::text) AS bucket, "
                + "SUM(value) AS total "
                + "FROM actual_value WHERE period_start >= ? AND period_start < ? "
                + "GROUP BY route_id, stop_id, bucket ORDER BY route_id, stop_id, bucket";
        return jdbc.query(
                sql,
                (rs, n) -> new ActualValue(
                        new RouteId(rs.getString("route_id")),
                        new StopId(rs.getString("stop_id")),
                        rs.getObject("bucket", OffsetDateTime.class).toInstant(),
                        rs.getDouble("total")),
                zone.getId(),
                zone.getId(),
                OffsetDateTime.ofInstant(period.start(), java.time.ZoneOffset.UTC),
                OffsetDateTime.ofInstant(period.end(), java.time.ZoneOffset.UTC));
    }

    @Override
    public LoadMatrix loadMatrix(RouteId routeId) {
        String sql = "SELECT dow, hr, AVG(total) AS load FROM ("
                + "  SELECT EXTRACT(ISODOW FROM period_start AT TIME ZONE ?::text)::int AS dow,"
                + "         EXTRACT(HOUR FROM period_start AT TIME ZONE ?::text)::int AS hr,"
                + "         SUM(value) AS total"
                + "  FROM actual_value WHERE route_id = ? GROUP BY period_start"
                + ") t GROUP BY dow, hr ORDER BY dow, hr";
        List<LoadMatrixCell> cells = jdbc.query(
                sql,
                (rs, n) -> new LoadMatrixCell(rs.getInt("dow"), rs.getInt("hr"), rs.getDouble("load")),
                zone.getId(),
                zone.getId(),
                routeId.value());
        return new LoadMatrix(routeId, cells);
    }
}
