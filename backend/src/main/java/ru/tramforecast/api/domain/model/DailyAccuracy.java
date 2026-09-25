package ru.tramforecast.api.domain.model;

import java.time.LocalDate;

/**
 * Forecast accuracy for one day.
 *
 * @param date      the day
 * @param wape      weighted absolute percentage error, lower is better
 * @param wapeScore {@code max(0, 1 - wape)}, the judging score, higher is better
 */
public record DailyAccuracy(LocalDate date, double wape, double wapeScore) {
}
