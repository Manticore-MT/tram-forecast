package ru.tramforecast.api.application;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;

/**
 * Resolves and validates the anchor date of a request. "Today" comes from an injectable clock so
 * the demo can emulate the current moment on historical data.
 */
public class ForecastDates {

    private final Clock clock;
    private final ZoneId zone;
    private final int maxYearsAhead;

    /**
     * Creates the resolver.
     *
     * @param clock         source of the current moment
     * @param zone          zone that defines the calendar day
     * @param maxYearsAhead how far into the future a forecast may be requested
     */
    public ForecastDates(Clock clock, ZoneId zone, int maxYearsAhead) {
        this.clock = clock;
        this.zone = zone;
        this.maxYearsAhead = maxYearsAhead;
    }

    /**
     * Returns the current calendar day.
     *
     * @return today in the configured zone
     */
    public LocalDate today() {
        return LocalDate.now(clock.withZone(zone));
    }

    /**
     * Returns the latest date a forecast can be requested for.
     *
     * @return today plus the allowed number of years
     */
    public LocalDate latest() {
        return today().plusYears(maxYearsAhead);
    }

    /**
     * Applies the default and checks the allowed range.
     *
     * @param requested the requested date, {@code null} for today
     * @return the date to use
     * @throws InvalidRequestException when the date is too far ahead
     */
    public LocalDate resolve(LocalDate requested) {
        LocalDate today = today();
        LocalDate date = requested == null ? today : requested;
        if (date.isAfter(today.plusYears(maxYearsAhead))) {
            throw new InvalidRequestException(
                    "Forecasts are available at most " + maxYearsAhead + " year(s) ahead, latest date is "
                            + today.plusYears(maxYearsAhead));
        }
        return date;
    }
}
