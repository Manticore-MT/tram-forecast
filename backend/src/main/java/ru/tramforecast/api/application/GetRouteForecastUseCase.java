package ru.tramforecast.api.application;

import ru.tramforecast.api.domain.model.RouteId;

/**
 * Use case: the forecast of one route with its deviation, status, peak, recommendation, facts a year
 * earlier and the factors behind it, for the route detail and the time slider.
 */
public interface GetRouteForecastUseCase {

    /**
     * Returns the route forecast.
     *
     * @param routeId the route
     * @param query   horizon, date and other read parameters
     * @return the route forecast
     * @throws NotFoundException when the route has no forecast
     */
    RouteForecastResult get(RouteId routeId, ForecastQuery query);
}
