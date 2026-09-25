package ru.tramforecast.api.domain.model;

/**
 * How unusual a forecast is compared to the baseline.
 */
public enum AttentionLevel {
    /** Within the usual range. */
    NORMAL,
    /** Noticeably above or below the baseline. */
    WARNING,
    /** Strongly above or below the baseline. */
    CRITICAL
}
