package ru.tramforecast.api.application;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import ru.tramforecast.api.domain.model.RouteForecast;
import ru.tramforecast.api.domain.service.AttentionZoneCalculator;
import ru.tramforecast.api.domain.service.ForecastAggregator;

/**
 * Implements {@link GetAttentionZonesUseCase}: reads the forecasts (asking ML when storage has
 * none), sums them per route and lets the domain calculator find the zones. Zones are per route: the
 * values of single stops are not a measurement.
 */
public class GetAttentionZonesService implements GetAttentionZonesUseCase {

    private final ForecastPreparer preparer;
    private final AttentionZoneCalculator calculator;

    /**
     * Creates the service.
     *
     * @param preparer   prepares forecasts for a query
     * @param calculator finds the zones
     */
    public GetAttentionZonesService(ForecastPreparer preparer, AttentionZoneCalculator calculator) {
        this.preparer = preparer;
        this.calculator = calculator;
    }

    @Override
    public AttentionResult get(ForecastQuery query) {
        PreparedForecast prepared = preparer.prepare(query);
        List<RouteForecast> routes = ForecastAggregator.byRoute(prepared.stops());
        Instant lastUpdated = routes.stream()
                .map(RouteForecast::generatedAt)
                .min(Comparator.naturalOrder())
                .orElseThrow();
        return new AttentionResult(query.horizon(), prepared.date(), lastUpdated, calculator.calculate(routes));
    }
}
