package ru.tramforecast.api.application;

import ru.tramforecast.api.domain.model.RouteId;

/**
 * Use case: the forecast of one route with all of its stops, for the map and the time slider.
 */
public interface GetRouteForecastUseCase {

    /**
     * Returns the route total and the per-stop series.
     *
     * @param routeId the route
     * @param query   horizon, date and other read parameters
     * @return the route forecast
     * @throws NotFoundException when the route has no forecast
     */
    RouteForecastResult get(RouteId routeId, ForecastQuery query);
}
