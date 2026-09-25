package ru.tramforecast.api.domain.service;

import ru.tramforecast.api.domain.model.Recommendation;
import ru.tramforecast.api.domain.model.RecommendationAction;

/**
 * Turns a percent deviation into a dispatcher recommendation: a load above the baseline by the
 * threshold means one more vehicle on the line, a load below it means one fewer. The scaling of
 * the vehicle count is provisional and to be confirmed.
 *
 * @param thresholdPct absolute deviation from which an action is recommended
 */
public record RecommendationPolicy(double thresholdPct) {

    /**
     * Validates the threshold.
     */
    public RecommendationPolicy {
        if (thresholdPct <= 0) {
            throw new IllegalArgumentException("Threshold must be positive");
        }
    }

    /**
     * Recommends an action for a deviation.
     *
     * @param deviationPct percent deviation, may be {@code null} when there is no baseline
     * @return the recommendation, never {@code null}
     */
    public Recommendation recommend(Double deviationPct) {
        if (deviationPct == null || Math.abs(deviationPct) < thresholdPct) {
            return Recommendation.NONE;
        }
        RecommendationAction action =
                deviationPct > 0 ? RecommendationAction.ADD_VEHICLE : RecommendationAction.REMOVE_VEHICLE;
        return new Recommendation(action, 1);
    }
}
