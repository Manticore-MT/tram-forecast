package ru.tramforecast.api.application;

import java.time.LocalDate;
import java.util.List;

import ru.tramforecast.api.domain.model.StopForecast;

/**
 * Stop forecasts ready to be analysed: date resolved, facts filled in, correction applied,
 * interval filter applied.
 *
 * @param date  the resolved anchor date
 * @param stops forecasts for every stop
 */
public record PreparedForecast(LocalDate date, List<StopForecast> stops) {

    /**
     * Makes the stops immutable.
     */
    public PreparedForecast {
        stops = List.copyOf(stops);
    }
}
