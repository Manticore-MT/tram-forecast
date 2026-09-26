package ru.tramforecast.api.application;

import java.util.List;
import ru.tramforecast.api.domain.model.RouteForecast;
import ru.tramforecast.api.domain.model.RouteId;

/**
 * Use case: the forecast as tabular rows for export (CSV).
 */
public interface ExportForecastUseCase {

    /**
     * Returns the route forecasts matching the filter. The same correction and interval
     * parameters as the interactive views apply, so an export matches what is on screen.
     *
     * @param query   horizon, date, interval and correction
     * @param routeId optional route filter, {@code null} for all routes
     * @return the matching forecasts
     * @throws NotFoundException when the filter matches nothing
     */
    List<RouteForecast> export(ForecastQuery query, RouteId routeId);
}
