package ru.tramforecast.api.domain.model;

import java.util.List;

/**
 * The quality of the model measured by the ML side on a historical block of days (a backtest): the
 * forecast it would have made against what was observed.
 *
 * @param origin the first day of the backtest block as the ML service names it
 * @param note   a sentence for the user about what the numbers are and are not
 * @param days   the quality per day
 * @param platformScore the score the platform gave the submitted contest file on its hidden check, as the
 *                      team reports it; {@code null} when the ML service does not report one. It is a
 *                      different measurement from the backtest and must not be mixed with it
 */
public record BacktestMetrics(String origin, String note, List<BacktestDay> days, Double platformScore) {

    /**
     * A backtest with no platform score.
     *
     * @param origin the first day of the backtest block
     * @param note   a sentence for the user
     * @param days   the quality per day
     */
    public BacktestMetrics(String origin, String note, List<BacktestDay> days) {
        this(origin, note, days, null);
    }

    /**
     * Makes the days immutable.
     */
    public BacktestMetrics {
        days = List.copyOf(days);
    }
}
