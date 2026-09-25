package ru.tramforecast.api.domain.model;

/**
 * A suggested dispatcher action.
 *
 * @param action   what to do
 * @param vehicles how many vehicles the action concerns, zero for {@link RecommendationAction#NONE}
 */
public record Recommendation(RecommendationAction action, int vehicles) {

    /** The "nothing to do" recommendation. */
    public static final Recommendation NONE = new Recommendation(RecommendationAction.NONE, 0);
}
