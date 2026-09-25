package ru.tramforecast.api.application;

import java.time.Instant;
import java.util.Comparator;
import ru.tramforecast.api.domain.model.StopForecast;
import ru.tramforecast.api.domain.service.AttentionZoneCalculator;

/**
 * Implements {@link GetAttentionZonesUseCase}: reads the aggregates (asking ML when storage has
 * none) and lets the domain calculator find the zones.
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
        Instant lastUpdated = prepared.stops().stream()
                .map(StopForecast::generatedAt)
                .min(Comparator.naturalOrder())
                .orElseThrow();
        return new AttentionResult(query.horizon(), prepared.date(), lastUpdated, calculator.calculate(prepared.stops()));
    }
}
