package ru.tramforecast.api.domain.model;

/**
 * Dispatcher-adjustable multipliers applied on top of the stored forecast (weather, event,
 * season). They let the user see immediately how the forecast changes without recomputing it.
 *
 * @param weather multiplier for weather conditions
 * @param event   multiplier for an event
 * @param season  multiplier for seasonality
 */
public record CorrectionCoefficients(double weather, double event, double season) {

    /** Lower bound accepted for any coefficient. */
    public static final double MIN = 0.1;
    /** Upper bound accepted for any coefficient. */
    public static final double MAX = 3.0;
    /** Coefficients that leave the forecast unchanged. */
    public static final CorrectionCoefficients NONE = new CorrectionCoefficients(1.0, 1.0, 1.0);

    /**
     * Validates that every coefficient is within the accepted range.
     */
    public CorrectionCoefficients {
        check("weather", weather);
        check("event", event);
        check("season", season);
    }

    /**
     * Combined multiplier.
     *
     * @return the product of all coefficients
     */
    public double factor() {
        return weather * event * season;
    }

    /**
     * Tells whether the coefficients change the forecast at all.
     *
     * @return {@code true} when the combined factor differs from 1
     */
    public boolean isIdentity() {
        return Math.abs(factor() - 1.0) < 1e-9;
    }

    private static void check(String name, double value) {
        if (Double.isNaN(value) || value < MIN || value > MAX) {
            throw new IllegalArgumentException(
                    "Coefficient '" + name + "' must be between " + MIN + " and " + MAX);
        }
    }
}
