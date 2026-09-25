package ru.tramforecast.api.domain.service;

import ru.tramforecast.api.domain.model.AttentionLevel;

/**
 * Classifies a percent deviation from the baseline. Owned by the backend: ML supplies the
 * aggregates, the backend decides what counts as unusual.
 *
 * @param warningPct  absolute deviation from which a point is a warning
 * @param criticalPct absolute deviation from which a point is critical
 */
public record AttentionPolicy(double warningPct, double criticalPct) {

    /**
     * Validates that the thresholds are ordered.
     */
    public AttentionPolicy {
        if (warningPct <= 0 || criticalPct < warningPct) {
            throw new IllegalArgumentException("Thresholds must satisfy 0 < warning <= critical");
        }
    }

    /**
     * Classifies a deviation.
     *
     * @param deviationPct percent deviation, may be {@code null} when there is no baseline
     * @return the attention level
     */
    public AttentionLevel classify(Double deviationPct) {
        if (deviationPct == null) {
            return AttentionLevel.NORMAL;
        }
        double magnitude = Math.abs(deviationPct);
        if (magnitude >= criticalPct) {
            return AttentionLevel.CRITICAL;
        }
        if (magnitude >= warningPct) {
            return AttentionLevel.WARNING;
        }
        return AttentionLevel.NORMAL;
    }
}
