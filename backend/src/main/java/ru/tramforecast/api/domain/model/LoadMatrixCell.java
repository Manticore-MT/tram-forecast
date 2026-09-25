package ru.tramforecast.api.domain.model;

/**
 * One cell of the "day of week x hour" load matrix.
 *
 * @param dayOfWeek ISO day of week, 1 = Monday ... 7 = Sunday
 * @param hour      hour of day, 0-23
 * @param value     typical load for that day of week and hour
 */
public record LoadMatrixCell(int dayOfWeek, int hour, double value) {
}
