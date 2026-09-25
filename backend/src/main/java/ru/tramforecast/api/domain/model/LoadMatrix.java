package ru.tramforecast.api.domain.model;

import java.util.List;

/**
 * The "typical week" of a route: average load per day of week and hour.
 *
 * @param routeId the route
 * @param cells   up to 7 x 24 cells
 */
public record LoadMatrix(RouteId routeId, List<LoadMatrixCell> cells) {

    /**
     * Makes the cells immutable.
     */
    public LoadMatrix {
        cells = List.copyOf(cells);
    }
}
