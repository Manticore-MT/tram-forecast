package ru.tramforecast.api.application;

import ru.tramforecast.api.domain.model.RouteId;
import ru.tramforecast.api.domain.model.StopId;

/**
 * Use case: details of one stop for the details panel.
 */
public interface GetStopForecastUseCase {

    /**
     * Returns the stop series with baseline, deviation, peak, verdict and year-ago facts.
     *
     * @param routeId the route
     * @param stopId  the stop on that route
     * @param query   horizon, date and other read parameters
     * @return the stop details
     * @throws NotFoundException when the stop has no forecast on that route
     */
    StopForecastResult get(RouteId routeId, StopId stopId, ForecastQuery query);
}
