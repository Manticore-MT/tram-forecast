package ru.tramforecast.api.application;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import ru.tramforecast.api.domain.model.Horizon;
import ru.tramforecast.api.domain.model.RouteForecast;

/**
 * Forecast of every route in the network.
 *
 * @param horizon     planning horizon
 * @param date        resolved anchor date
 * @param lastUpdated oldest generation time among the data shown
 * @param routes      one aggregated forecast per route
 */
public record NetworkOverview(Horizon horizon, LocalDate date, Instant lastUpdated, List<RouteForecast> routes) {
}
