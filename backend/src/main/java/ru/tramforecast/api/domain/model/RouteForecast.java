package ru.tramforecast.api.domain.model;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * Forecast of a whole route: the stop forecasts summed per period.
 *
 * @param routeId     the route
 * @param horizon     planning horizon
 * @param date        anchor date of the horizon
 * @param generatedAt oldest generation time among the summed stop snapshots, so freshness is never
 *                    overstated
 * @param points      ordered points, step given by the horizon
 */
public record RouteForecast(
        RouteId routeId, Horizon horizon, LocalDate date, Instant generatedAt, List<ForecastPoint> points) {

    /**
     * Makes the points immutable.
     */
    public RouteForecast {
        points = List.copyOf(points);
    }
}
