package ru.tramforecast.api.domain.port;

import java.time.LocalDate;
import java.util.List;
import ru.tramforecast.api.domain.model.Horizon;
import ru.tramforecast.api.domain.model.StopForecast;

/**
 * Outbound port for stored forecast snapshots. Snapshots are append-only: a recompute inserts
 * new rows, it never overwrites earlier ones.
 */
public interface ForecastRepository {

    /**
     * Reads the most recent snapshot of every stop for a horizon and date.
     *
     * @param horizon planning horizon
     * @param date    anchor date
     * @return the latest forecasts, empty when nothing is stored
     */
    List<StopForecast> findLatest(Horizon horizon, LocalDate date);

    /**
     * Reads the earliest snapshot of every stop for a horizon and date.
     *
     * @param horizon planning horizon
     * @param date    anchor date
     * @return the initial forecasts, empty when nothing is stored
     */
    List<StopForecast> findInitial(Horizon horizon, LocalDate date);

    /**
     * Appends new snapshots.
     *
     * @param forecasts snapshots to store
     */
    void saveAll(List<StopForecast> forecasts);

    /**
     * Lists the most recent anchor dates that have snapshots for a horizon.
     *
     * @param horizon planning horizon
     * @param limit   maximum number of dates
     * @return dates, newest first
     */
    List<LocalDate> recentDates(Horizon horizon, int limit);
}
