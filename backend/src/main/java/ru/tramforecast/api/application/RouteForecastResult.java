package ru.tramforecast.api.application;

import java.util.List;
import ru.tramforecast.api.domain.model.RouteForecast;
import ru.tramforecast.api.domain.model.StopForecast;

/**
 * Forecast of one route: the route total plus every stop, so a time slider can repaint the whole
 * route from one response.
 *
 * @param route    the route total per period
 * @param stops    forecasts of the route's stops
 * @param lastYear the route total observed one year earlier, aligned to the current periods
 */
public record RouteForecastResult(RouteForecast route, List<StopForecast> stops, List<HistoryPoint> lastYear) {

    /**
     * Makes the collections immutable.
     */
    public RouteForecastResult {
        stops = List.copyOf(stops);
        lastYear = List.copyOf(lastYear);
    }
}
