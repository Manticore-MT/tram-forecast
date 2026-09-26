package ru.tramforecast.api.application;

import java.time.LocalDate;
import java.util.List;

import ru.tramforecast.api.domain.model.RouteId;
import ru.tramforecast.api.domain.model.StopForecast;
import ru.tramforecast.api.domain.model.StopId;

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

    /**
     * The routes that have a forecast.
     *
     * @return the distinct route ids
     */
    public List<RouteId> knownRoutes() {
        return stops.stream().map(StopForecast::routeId).distinct().toList();
    }

    /**
     * Explains why a route and stop could not be found: the route is unknown, or it exists and
     * the stop does not.
     *
     * @param routeId the route that was asked for
     * @param stopId  the stop that was asked for
     * @return the matching exception
     */
    public NotFoundException missing(RouteId routeId, StopId stopId) {
        List<RouteId> known = knownRoutes();
        return known.contains(routeId) ? NotFoundException.stop(routeId, stopId)
                : NotFoundException.route(routeId, known);
    }
}
