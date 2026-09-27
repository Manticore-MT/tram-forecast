package ru.tramforecast.api.domain.service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import ru.tramforecast.api.domain.model.ForecastPoint;

/**
 * Stateless analysis of a series of forecast points.
 */
public final class SeriesAnalytics {

    private SeriesAnalytics() {
    }

    /**
     * Finds the period with the highest forecast (the ridership peak).
     *
     * @param points the series
     * @return the peak point, empty for an empty series
     */
    public static Optional<ForecastPoint> peak(List<ForecastPoint> points) {
        return points.stream().max(Comparator.comparingDouble(ForecastPoint::forecast));
    }

    /**
     * Finds the period whose forecast deviates most from the baseline, in percent of the baseline.
     * Points without a usable baseline are ignored, and so is a point whose own baseline is a tiny
     * fraction of the series' busiest baseline: a couple of stray boardings against a baseline of one
     * or two can read as "+300 %", which is noise, not an unusual period. {@code minBaselineSharePct}
     * fixes the noise floor as a percentage of the series' highest baseline, not an absolute count, so
     * it works the same for a two-car route and a trunk route.
     *
     * @param points              the series
     * @param minBaselineSharePct a point only counts when its baseline is at least this percent of the
     *                            series' highest baseline (0 disables the filter)
     * @return the point of maximum deviation, empty when no point clears the floor
     */
    public static Optional<ForecastPoint> maxDeviation(List<ForecastPoint> points, double minBaselineSharePct) {
        double busiestBaseline = points.stream().mapToDouble(ForecastPoint::baseline).max().orElse(0);
        double floor = busiestBaseline * minBaselineSharePct / 100.0;
        return points.stream()
                .filter(p -> p.deviationPct() != null && p.baseline() >= floor)
                .max(Comparator.comparingDouble(p -> Math.abs(p.deviationPct())));
    }
}
