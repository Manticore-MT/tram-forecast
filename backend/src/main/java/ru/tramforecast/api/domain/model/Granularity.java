package ru.tramforecast.api.domain.model;

/**
 * Step between two consecutive points of a forecast series.
 */
public enum Granularity {
    /** One point per hour. */
    HOUR,
    /** One point per calendar day. */
    DAY,
    /** One point per calendar month. */
    MONTH
}
