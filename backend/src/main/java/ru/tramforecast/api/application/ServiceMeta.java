package ru.tramforecast.api.application;

import java.time.Instant;
import java.time.LocalDate;

/**
 * What a client needs to know before asking for forecasts: the current moment the service works
 * with, the selectable date range, and whether the numbers come from a real model.
 *
 * @param now        the current moment (may be an emulated one)
 * @param today      the current calendar day in the service zone
 * @param latestDate the latest date a forecast can be requested for
 * @param forecastFrom first date the model covers, {@code null} when there is no lower limit
 * @param forecastTo   last date the model covers, {@code null} when the range is not fixed
 * @param zone       IANA zone of the calendar days
 * @param dataSource {@code model} for the real ML service, {@code stub} for synthetic demo data
 */
public record ServiceMeta(
        Instant now,
        LocalDate today,
        LocalDate latestDate,
        LocalDate forecastFrom,
        LocalDate forecastTo,
        String zone,
        String dataSource) {
}
