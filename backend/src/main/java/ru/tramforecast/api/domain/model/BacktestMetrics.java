package ru.tramforecast.api.domain.model;

import java.util.List;

/**
 * The quality of the model measured by the ML side on a historical block of days (a backtest): the
 * forecast it would have made against what was observed.
 *
 * @param origin the first day of the backtest block as the ML service names it
 * @param note   a sentence for the user about what the numbers are and are not
 * @param days   the quality per day
 */
public record BacktestMetrics(String origin, String note, List<BacktestDay> days) {

    /**
     * Makes the days immutable.
     */
    public BacktestMetrics {
        days = List.copyOf(days);
    }
}
