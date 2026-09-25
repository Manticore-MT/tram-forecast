package ru.tramforecast.api.domain.model;

/**
 * Action suggested to the dispatcher.
 */
public enum RecommendationAction {
    /** Add rolling stock to the line. */
    ADD_VEHICLE,
    /** Take rolling stock off the line. */
    REMOVE_VEHICLE,
    /** No action needed. */
    NONE
}
