package ru.tramforecast.api.domain.service;

import java.util.List;
import java.util.OptionalDouble;

/**
 * Weighted absolute percentage error, the metric the challenge is judged on:
 * {@code WAPE = sum|y - y_hat| / sum y}, and {@code score = max(0, 1 - WAPE)} (higher is better).
 */
public final class Wape {

    private Wape() {
    }

    /**
     * Computes WAPE.
     *
     * @param actual    observed values
     * @param predicted forecast values, same length and order as {@code actual}
     * @return WAPE, empty when the observed values sum to zero or there is nothing to compare
     */
    public static OptionalDouble wape(List<Double> actual, List<Double> predicted) {
        if (actual.size() != predicted.size()) {
            throw new IllegalArgumentException("Actual and predicted must have the same length");
        }
        double absoluteError = 0;
        double total = 0;
        for (int i = 0; i < actual.size(); i++) {
            absoluteError += Math.abs(actual.get(i) - predicted.get(i));
            total += actual.get(i);
        }
        if (total <= 0) {
            return OptionalDouble.empty();
        }
        return OptionalDouble.of(absoluteError / total);
    }

    /**
     * Converts WAPE to the judging score.
     *
     * @param wape a WAPE value
     * @return {@code max(0, 1 - wape)}
     */
    public static double score(double wape) {
        return Math.max(0.0, 1.0 - wape);
    }
}
