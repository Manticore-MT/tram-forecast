package ru.tramforecast.api.domain.model;

import java.time.Instant;

/**
 * An observed value for one route and period, aggregated to the granularity of the requested
 * horizon.
 *
 * @param routeId     the route
 * @param periodStart start of the period
 * @param value       observed value
 */
public record ActualValue(RouteId routeId, Instant periodStart, double value) {
}
