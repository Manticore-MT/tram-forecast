package ru.tramforecast.api.application;

import ru.tramforecast.api.domain.model.LoadMatrix;
import ru.tramforecast.api.domain.model.RouteId;

/**
 * Use case: the "typical week" load matrix of a route.
 */
public interface GetLoadMatrixUseCase {

    /**
     * Returns average load per day of week and hour, computed from the facts.
     *
     * @param routeId the route
     * @return the matrix
     * @throws NotFoundException when the route has no history
     */
    LoadMatrix get(RouteId routeId);
}
