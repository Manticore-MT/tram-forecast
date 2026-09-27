package ru.tramforecast.api.domain.model;

import java.util.List;

/** Observed history, separate from forecast and scenario multipliers. Null values mean unavailable. */
public record HistoryComparison(String date, List<String> routeIds, String historyThrough,
        ObservedDay lastWeek, ObservedDay lastMonth, TypicalWeek typicalWeek, String note) {
    /** Local Moscow hour and observed value, or null when unavailable. */
    public record Hour(int hour, Double value) {}
    /** A calendar day of observed validations. */
    public record ObservedDay(String date, boolean available, List<Hour> points) {}
    /** Median hourly profile and number of contributing dates, Monday is zero. */
    public record TypicalDay(int weekday, int observations, List<Hour> points) {}
    /** Seven weekday profiles and their observation window. */
    public record TypicalWeek(String start, String end, List<TypicalDay> days) {}
}
