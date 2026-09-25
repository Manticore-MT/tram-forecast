package ru.tramforecast.api.domain.model;

/**
 * Which stored snapshot of a forecast to read.
 */
public enum SnapshotKind {
    /** The most recent snapshot. */
    LATEST,
    /** The first snapshot ever generated for the date ("forecast as it was at the start of the day"). */
    INITIAL
}
