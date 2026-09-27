package ru.tramforecast.api.domain.model;

import java.time.LocalDate;

/**
 * How well the model forecast one day in a backtest: the sum of the absolute errors and the sum of the
 * observed values over that day's route-hour cells. Keeping the two sums (not just the ratio) lets any
 * set of days be combined into an exact WAPE.
 *
 * @param date          the day
 * @param absoluteError sum of {@code |observed - forecast|} over the day
 * @param actualSum     sum of the observed values over the day
 */
public record BacktestDay(LocalDate date, double absoluteError, double actualSum) {
}
