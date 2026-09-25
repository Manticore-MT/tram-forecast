package ru.tramforecast.api.application;

import java.time.LocalDate;
import java.util.List;
import ru.tramforecast.api.domain.model.AttentionLevel;
import ru.tramforecast.api.domain.model.ForecastPoint;
import ru.tramforecast.api.domain.model.Recommendation;
import ru.tramforecast.api.domain.model.StopForecast;

/**
 * Details of one stop: the series with baseline and deviation, the verdict and the year-ago facts.
 *
 * @param forecast       the stop forecast (facts filled in, correction applied)
 * @param date           resolved anchor date
 * @param lastYear       facts of the same period one year earlier, aligned to the current periods
 * @param peak           period with the highest forecast, {@code null} for an empty series
 * @param maxDeviation   period with the largest deviation from the baseline, {@code null} when
 *                       there is no baseline
 * @param level          how unusual the forecast is
 * @param recommendation suggested dispatcher action
 */
public record StopForecastResult(
        StopForecast forecast,
        LocalDate date,
        List<HistoryPoint> lastYear,
        ForecastPoint peak,
        ForecastPoint maxDeviation,
        AttentionLevel level,
        Recommendation recommendation) {

    /**
     * Makes the history immutable.
     */
    public StopForecastResult {
        lastYear = List.copyOf(lastYear);
    }
}
