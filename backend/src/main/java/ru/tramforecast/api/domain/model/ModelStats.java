package ru.tramforecast.api.domain.model;

import java.util.List;

/**
 * Forecast quality over recent days, measured on the initial snapshot of each day against the
 * facts (a fair comparison: the forecast as it stood at the start of the day, not a moving target).
 *
 * @param wape        overall WAPE across all compared days, or {@code null} when nothing to compare
 * @param wapeScore   overall WAPE-score, or {@code null} when nothing to compare
 * @param history     accuracy per day, oldest first
 */
public record ModelStats(Double wape, Double wapeScore, List<DailyAccuracy> history) {

    /**
     * Makes the history immutable.
     */
    public ModelStats {
        history = List.copyOf(history);
    }
}
