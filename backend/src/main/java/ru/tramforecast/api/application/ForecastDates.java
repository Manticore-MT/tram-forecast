package ru.tramforecast.api.application;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import ru.tramforecast.api.domain.model.Horizon;
import ru.tramforecast.api.domain.service.ForecastPeriod;

/**
 * Resolves and validates the anchor date of a request. "Today" comes from an injectable clock so
 * the demo can emulate the current moment on historical data. When the model covers only a fixed
 * range of dates, that range replaces the generic "at most N years ahead" limit and a period that
 * is not entirely inside it is refused with an explanation, instead of being sent to the model.
 */
public class ForecastDates {

    private final Clock clock;
    private final ZoneId zone;
    private final int maxYearsAhead;
    private final LocalDate from;
    private final LocalDate to;

    /**
     * Creates the resolver.
     *
     * @param clock         source of the current moment
     * @param zone          zone that defines the calendar day
     * @param maxYearsAhead how far into the future a forecast may be requested
     */
    public ForecastDates(Clock clock, ZoneId zone, int maxYearsAhead) {
        this(clock, zone, maxYearsAhead, null, null);
    }

    /**
     * Creates the resolver for a model that covers a fixed range of dates.
     *
     * @param clock         source of the current moment
     * @param zone          zone that defines the calendar day
     * @param maxYearsAhead how far ahead a forecast may be requested when there is no fixed range
     * @param from          first date the model covers, {@code null} for no lower limit
     * @param to            last date the model covers, {@code null} for "today plus the allowed years"
     */
    public ForecastDates(Clock clock, ZoneId zone, int maxYearsAhead, LocalDate from, LocalDate to) {
        this.clock = clock;
        this.zone = zone;
        this.maxYearsAhead = maxYearsAhead;
        this.from = from;
        this.to = to;
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
     * @return the end of the model's range when there is one, otherwise today plus the allowed years
     */
    public LocalDate latest() {
        return to != null ? to : today().plusYears(maxYearsAhead);
    }

    /**
     * Returns the first date the model covers.
     *
     * @return the start of the model's range, {@code null} when there is no lower limit
     */
    public LocalDate earliest() {
        return from;
    }

    /**
     * Returns the last date the model covers.
     *
     * @return the end of the model's range, {@code null} when it is not fixed
     */
    public LocalDate forecastTo() {
        return to;
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
        if (to == null && date.isAfter(today.plusYears(maxYearsAhead))) {
            throw new InvalidRequestException(
                    "Forecasts are available at most " + maxYearsAhead + " year(s) ahead, latest date is "
                            + today.plusYears(maxYearsAhead));
        }
        return date;
    }

    /**
     * Checks that the whole period a horizon covers for a date lies inside the model's range. A day
     * is one date, a week is seven dates starting at it, a month and a year are the calendar month and
     * year that contain it.
     *
     * @param horizon the planning horizon
     * @param date    the anchor date
     * @throws PeriodNotSupportedException when any part of the period is outside the range
     */
    public void ensureSupported(Horizon horizon, LocalDate date) {
        if (from == null && to == null) {
            return;
        }
        ForecastPeriod period = ForecastPeriod.of(horizon, date, zone);
        LocalDate first = period.start().atZone(zone).toLocalDate();
        LocalDate last = period.end().atZone(zone).toLocalDate().minusDays(1);
        if ((from != null && first.isBefore(from)) || (to != null && last.isAfter(to))) {
            throw new PeriodNotSupportedException("The forecast covers only periods that lie entirely within "
                    + (from == null ? "…" : from) + " .. " + (to == null ? "…" : to) + "; the requested "
                    + horizon.name().toLowerCase(java.util.Locale.ROOT) + " covers " + first + " .. " + last + ".");
        }
    }
}
