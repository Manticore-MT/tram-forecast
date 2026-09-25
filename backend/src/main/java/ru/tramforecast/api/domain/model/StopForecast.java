package ru.tramforecast.api.domain.model;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * Forecast for one stop of one route over one horizon. This is the unit ML produces and the
 * backend stores (append-only, one snapshot per recompute).
 *
 * @param routeId      the route
 * @param stopId       the stop on that route
 * @param horizon      planning horizon
 * @param date         anchor date of the horizon (the day, or a day of the month or year)
 * @param generatedAt  when this snapshot was produced
 * @param modelVersion version of the model that produced it
 * @param points       ordered points, step given by the horizon
 * @param factors      human-readable factors the model took into account
 */
public record StopForecast(
        RouteId routeId,
        StopId stopId,
        Horizon horizon,
        LocalDate date,
        Instant generatedAt,
        String modelVersion,
        List<ForecastPoint> points,
        List<String> factors) {

    /**
     * Makes the collections immutable.
     */
    public StopForecast {
        points = List.copyOf(points);
        factors = List.copyOf(factors);
    }

    /**
     * Returns a copy with the points replaced.
     *
     * @param newPoints replacement points
     * @return the adjusted forecast
     */
    public StopForecast withPoints(List<ForecastPoint> newPoints) {
        return new StopForecast(routeId, stopId, horizon, date, generatedAt, modelVersion, newPoints, factors);
    }
}
