package ru.tramforecast.api.domain.model;

import java.time.Instant;

/**
 * A stop where the forecast deviates notably from the baseline.
 *
 * @param routeId         the route
 * @param stopId          the stop
 * @param deviationAbs    absolute deviation at the point of maximum deviation
 * @param deviationPct    percent deviation at the point of maximum deviation
 * @param peakAt          start of the period with the highest forecast
 * @param maxDeviationAt  start of the period with the largest deviation from the baseline
 * @param level           severity
 * @param recommendation  suggested dispatcher action
 */
public record AttentionZone(
        RouteId routeId,
        StopId stopId,
        double deviationAbs,
        double deviationPct,
        Instant peakAt,
        Instant maxDeviationAt,
        AttentionLevel level,
        Recommendation recommendation) {
}
