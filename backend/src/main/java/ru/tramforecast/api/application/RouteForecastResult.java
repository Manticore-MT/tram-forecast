package ru.tramforecast.api.application;

import java.time.LocalDate;
import java.util.List;
import ru.tramforecast.api.domain.model.AttentionLevel;
import ru.tramforecast.api.domain.model.ForecastPoint;
import ru.tramforecast.api.domain.model.Recommendation;
import ru.tramforecast.api.domain.model.RouteForecast;

/**
 * Forecast of one route with what the dispatcher needs to judge it.
 *
 * @param forecast       the route forecast, corrections and facts applied
 * @param date           resolved anchor date
 * @param lastYear       the route observed one year earlier, aligned to the current periods
 * @param peak           the point with the highest forecast, null for an empty series
 * @param maxDeviation   the point that deviates most from the baseline, null when none has a baseline
 * @param level          status derived from the maximum deviation
 * @param recommendation suggested dispatcher action
 */
public record RouteForecastResult(
        RouteForecast forecast,
        LocalDate date,
        List<HistoryPoint> lastYear,
        ForecastPoint peak,
        ForecastPoint maxDeviation,
        AttentionLevel level,
        Recommendation recommendation) {

    /**
     * Makes the history immutable.
     */
    public RouteForecastResult {
        lastYear = List.copyOf(lastYear);
    }
}
