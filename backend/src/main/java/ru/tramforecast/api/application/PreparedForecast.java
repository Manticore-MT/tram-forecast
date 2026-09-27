package ru.tramforecast.api.application;

import java.time.LocalDate;
import java.util.List;
import ru.tramforecast.api.domain.model.RouteForecast;
import ru.tramforecast.api.domain.model.RouteId;

/**
 * The forecasts a query resolved to: the anchor date the request meant and the route forecasts with
 * the corrections and facts applied.
 *
 * @param date   resolved anchor date
 * @param routes route forecasts of that horizon and date, already restricted to the query interval
 */
public record PreparedForecast(LocalDate date, List<RouteForecast> routes) {

    /**
     * Makes the routes immutable.
     */
    public PreparedForecast {
        routes = List.copyOf(routes);
    }

    /**
     * Lists the routes the forecast covers.
     *
     * @return route ids
     */
    public List<RouteId> knownRoutes() {
        return routes.stream().map(RouteForecast::routeId).distinct().toList();
    }
}
