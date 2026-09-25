package ru.tramforecast.api.domain.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import ru.tramforecast.api.domain.model.Horizon;

/**
 * The calendar period a horizon covers for an anchor date: the day itself, the whole month or the
 * whole year that contains it.
 *
 * @param start inclusive start of the period
 * @param end   exclusive end of the period
 */
public record ForecastPeriod(Instant start, Instant end) {

    /**
     * Computes the period of a horizon around an anchor date.
     *
     * @param horizon the planning horizon
     * @param date    the anchor date
     * @param zone    the zone that defines where days, months and years begin
     * @return the covered period
     */
    public static ForecastPeriod of(Horizon horizon, LocalDate date, ZoneId zone) {
        LocalDate first;
        LocalDate next;
        switch (horizon) {
            case DAY -> {
                first = date;
                next = date.plusDays(1);
            }
            case MONTH -> {
                first = date.withDayOfMonth(1);
                next = first.plusMonths(1);
            }
            default -> {
                first = date.withDayOfYear(1);
                next = first.plusYears(1);
            }
        }
        return new ForecastPeriod(first.atStartOfDay(zone).toInstant(), next.atStartOfDay(zone).toInstant());
    }

    /**
     * Tells whether an instant lies inside the period.
     *
     * @param instant the instant to test
     * @return {@code true} when {@code start <= instant < end}
     */
    public boolean contains(Instant instant) {
        return !instant.isBefore(start) && instant.isBefore(end);
    }
}
