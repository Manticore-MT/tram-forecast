package ru.tramforecast.api.application;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import ru.tramforecast.api.domain.model.RouteForecast;
import ru.tramforecast.api.domain.service.ForecastAggregator;

/**
 * Implements {@link GetNetworkOverviewUseCase}: sums stop forecasts into one series per route.
 */
public class GetNetworkOverviewService implements GetNetworkOverviewUseCase {

    private final ForecastPreparer preparer;

    /**
     * Creates the service.
     *
     * @param preparer prepares forecasts for a query
     */
    public GetNetworkOverviewService(ForecastPreparer preparer) {
        this.preparer = preparer;
    }

    @Override
    public NetworkOverview get(ForecastQuery query) {
        PreparedForecast prepared = preparer.prepare(query);
        List<RouteForecast> routes = ForecastAggregator.byRoute(prepared.stops());
        Instant lastUpdated = routes.stream()
                .map(RouteForecast::generatedAt)
                .min(Comparator.naturalOrder())
                .orElseThrow();
        return new NetworkOverview(query.horizon(), prepared.date(), lastUpdated, routes);
    }
}
