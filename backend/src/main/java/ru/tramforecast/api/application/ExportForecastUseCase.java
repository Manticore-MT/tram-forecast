package ru.tramforecast.api.application;

import java.util.List;
import ru.tramforecast.api.domain.model.RouteId;
import ru.tramforecast.api.domain.model.StopForecast;
import ru.tramforecast.api.domain.model.StopId;

/**
 * Use case: the forecast as tabular rows for export (CSV).
 */
public interface ExportForecastUseCase {

    /**
     * Returns the stop forecasts matching the filters. The same correction and interval
     * parameters as the interactive views apply, so an export matches what is on screen.
     *
     * @param query   horizon, date, interval and correction
     * @param routeId optional route filter, {@code null} for all routes
     * @param stopId  optional stop filter, {@code null} for all stops
     * @return the matching forecasts
     * @throws NotFoundException when the filters match nothing
     */
    List<StopForecast> export(ForecastQuery query, RouteId routeId, StopId stopId);
}
