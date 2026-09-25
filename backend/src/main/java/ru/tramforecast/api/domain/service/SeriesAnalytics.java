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
     * Points without a usable baseline are ignored.
     *
     * @param points the series
     * @return the point of maximum deviation, empty when no point has a baseline
     */
    public static Optional<ForecastPoint> maxDeviation(List<ForecastPoint> points) {
        return points.stream()
                .filter(p -> p.deviationPct() != null)
                .max(Comparator.comparingDouble(p -> Math.abs(p.deviationPct())));
    }
}
