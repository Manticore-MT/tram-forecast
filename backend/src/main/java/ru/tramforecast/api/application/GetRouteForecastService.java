package ru.tramforecast.api.application;

import java.util.List;
import ru.tramforecast.api.domain.model.RouteForecast;
import ru.tramforecast.api.domain.model.RouteId;
import ru.tramforecast.api.domain.model.StopForecast;
import ru.tramforecast.api.domain.service.ForecastAggregator;

/**
 * Implements {@link GetRouteForecastUseCase}.
 */
public class GetRouteForecastService implements GetRouteForecastUseCase {

    private final ForecastPreparer preparer;
    private final HistoryAligner history;

    /**
     * Creates the service.
     *
     * @param preparer prepares forecasts for a query
     * @param history  builds the year-ago facts
     */
    public GetRouteForecastService(ForecastPreparer preparer, HistoryAligner history) {
        this.preparer = preparer;
        this.history = history;
    }

    @Override
    public RouteForecastResult get(RouteId routeId, ForecastQuery query) {
        PreparedForecast prepared = preparer.prepare(query);
        List<StopForecast> stops = prepared.stops().stream()
                .filter(stop -> stop.routeId().equals(routeId))
                .toList();
        if (stops.isEmpty()) {
            throw NotFoundException.route(routeId, prepared.knownRoutes());
        }
        RouteForecast route = ForecastAggregator.byRoute(stops).get(0);
        return new RouteForecastResult(
                route, stops, history.forRoute(query.horizon(), prepared.date(), routeId));
    }
}
