package ru.tramforecast.api.domain.service;

import ru.tramforecast.api.domain.model.AttentionLevel;

/**
 * Classifies a percent deviation from the baseline. Owned by the backend: ML supplies the
 * aggregates, the backend decides what counts as unusual.
 *
 * @param warningPct          absolute deviation from which a point is a warning
 * @param criticalPct         absolute deviation from which a point is critical
 * @param minBaselineSharePct a point is only considered for the maximum deviation when its baseline is
 *                            at least this percent of the series' highest baseline; below that, a
 *                            deviation is noise (a stray boarding or two against an almost-zero
 *                            baseline reads as hundreds of percent) rather than something unusual
 */
public record AttentionPolicy(double warningPct, double criticalPct, double minBaselineSharePct) {

    /**
     * Validates that the thresholds are ordered.
     */
    public AttentionPolicy {
        if (warningPct <= 0 || criticalPct < warningPct) {
            throw new IllegalArgumentException("Thresholds must satisfy 0 < warning <= critical");
        }
        if (minBaselineSharePct < 0 || minBaselineSharePct >= 100) {
            throw new IllegalArgumentException("minBaselineSharePct must satisfy 0 <= share < 100");
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
