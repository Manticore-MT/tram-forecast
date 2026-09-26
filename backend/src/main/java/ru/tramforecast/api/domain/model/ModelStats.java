package ru.tramforecast.api.domain.model;

import java.util.List;

/**
 * Forecast quality over recent days, measured on the initial snapshot of each day against the
 * facts (a fair comparison: the forecast as it stood at the start of the day, not a moving target).
 *
 * @param wape        overall WAPE across all compared days, or {@code null} when nothing to compare
 * @param wapeScore   overall WAPE-score, or {@code null} when nothing to compare
 * @param history     accuracy per day, oldest first
 * @param source      {@code ml-backtest} when the ML side measured it on a historical block,
 *                    {@code facts} when the backend compared its own stored forecasts with facts
 * @param note        a sentence for the user about what the numbers are, {@code null} when there is none
 */
public record ModelStats(
        Double wape, Double wapeScore, List<DailyAccuracy> history, String source, String note) {

    /**
     * Statistics measured by the backend itself, from its stored forecasts and the facts.
     *
     * @param wape      overall WAPE, or {@code null}
     * @param wapeScore overall WAPE-score, or {@code null}
     * @param history   accuracy per day, oldest first
     */
    public ModelStats(Double wape, Double wapeScore, List<DailyAccuracy> history) {
        this(wape, wapeScore, history, "facts", null);
    }


    /**
     * Makes the history immutable.
     */
    public ModelStats {
        history = List.copyOf(history);
    }
}
