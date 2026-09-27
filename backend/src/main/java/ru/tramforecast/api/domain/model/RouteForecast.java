package ru.tramforecast.api.domain.model;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * Forecast of a whole route for one horizon and anchor date. The route is the smallest unit the
 * model measures: there are no stop-level values.
 *
 * @param routeId      the route
 * @param horizon      planning horizon
 * @param date         anchor date of the horizon
 * @param generatedAt  when the snapshot was generated
 * @param modelVersion version of the model that produced it
 * @param points       ordered points, step given by the horizon
 * @param factors      short human-readable explanations of what shaped the forecast
 */
public record RouteForecast(
        RouteId routeId,
        Horizon horizon,
        LocalDate date,
        Instant generatedAt,
        String modelVersion,
        List<ForecastPoint> points,
        List<String> factors) {

    /**
     * Makes the lists immutable.
     */
    public RouteForecast {
        points = List.copyOf(points);
        factors = List.copyOf(factors);
    }

    /**
     * Copies the forecast with other points.
     *
     * @param newPoints the replacement points
     * @return the copy
     */
    public RouteForecast withPoints(List<ForecastPoint> newPoints) {
        return new RouteForecast(routeId, horizon, date, generatedAt, modelVersion, newPoints, factors);
    }
}
