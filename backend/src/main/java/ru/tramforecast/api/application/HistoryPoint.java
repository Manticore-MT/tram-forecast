package ru.tramforecast.api.application;

import java.time.Instant;

/**
 * An observed value from the same period one year earlier ("was"), aligned to the current period.
 *
 * @param periodStart start of the <em>current</em> period this value corresponds to (shifted one
 *                    year forward), so it can be drawn on the same axis as the forecast
 * @param value       what was observed a year earlier
 */
public record HistoryPoint(Instant periodStart, double value) {
}
