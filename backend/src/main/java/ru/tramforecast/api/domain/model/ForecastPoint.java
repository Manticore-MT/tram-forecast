package ru.tramforecast.api.domain.model;

import java.time.Instant;

/**
 * One point of a forecast series: the forecast next to the baseline ("usual level") of the same
 * period, and the actual value once the period is known.
 *
 * <p>The unit of the values (passengers or load ratio) is still being agreed with the ML side.
 *
 * @param periodStart start of the period this point describes
 * @param baseline    usual level for the period
 * @param forecast    forecast value for the period
 * @param actual      observed value, or {@code null} while the period is still in the future
 */
public record ForecastPoint(Instant periodStart, double baseline, double forecast, Double actual) {

    /**
     * Absolute deviation of the forecast from the baseline.
     *
     * @return {@code forecast - baseline}
     */
    public double deviationAbs() {
        return forecast - baseline;
    }

    /**
     * Deviation of the forecast from the baseline in percent of the baseline.
     *
     * @return the percent deviation, or {@code null} when the baseline is not positive
     */
    public Double deviationPct() {
        if (baseline <= 0) {
            return null;
        }
        return deviationAbs() / baseline * 100.0;
    }

    /**
     * Returns a copy with the forecast replaced (used to apply correction coefficients).
     *
     * @param newForecast the new forecast value
     * @return the adjusted point
     */
    public ForecastPoint withForecast(double newForecast) {
        return new ForecastPoint(periodStart, baseline, newForecast, actual);
    }

    /**
     * Returns a copy with the actual value replaced.
     *
     * @param newActual the observed value, may be {@code null}
     * @return the enriched point
     */
    public ForecastPoint withActual(Double newActual) {
        return new ForecastPoint(periodStart, baseline, forecast, newActual);
    }
}
