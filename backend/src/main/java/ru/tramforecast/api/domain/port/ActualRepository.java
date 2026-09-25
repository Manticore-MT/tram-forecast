package ru.tramforecast.api.domain.port;

import java.time.LocalDate;
import java.util.List;
import ru.tramforecast.api.domain.model.ActualValue;
import ru.tramforecast.api.domain.model.Horizon;
import ru.tramforecast.api.domain.model.LoadMatrix;
import ru.tramforecast.api.domain.model.RouteId;

/**
 * Outbound port for observed values (facts), loaded from the organizers' dataset.
 */
public interface ActualRepository {

    /**
     * Reads the observed values for the period a horizon covers around a date, aggregated to the
     * horizon's granularity (hours for a day, days for a month, months for a year).
     *
     * @param horizon planning horizon
     * @param date    anchor date
     * @return observed values per stop and period, empty when none are known
     */
    List<ActualValue> find(Horizon horizon, LocalDate date);

    /**
     * Computes the typical week of a route: average load per day of week and hour.
     *
     * @param routeId the route
     * @return the matrix, with no cells when there is no history
     */
    LoadMatrix loadMatrix(RouteId routeId);
}
