package ru.tramforecast.api.application;

import ru.tramforecast.api.domain.model.AttentionLevel;
import ru.tramforecast.api.domain.model.ForecastPoint;
import ru.tramforecast.api.domain.model.Recommendation;
import ru.tramforecast.api.domain.model.RouteForecast;
import ru.tramforecast.api.domain.model.RouteId;
import ru.tramforecast.api.domain.service.AttentionPolicy;
import ru.tramforecast.api.domain.service.RecommendationPolicy;
import ru.tramforecast.api.domain.service.SeriesAnalytics;

/**
 * Implements {@link GetRouteForecastUseCase}: reads the route forecast (asking ML when storage has
 * none), and adds the peak, the maximum deviation, the status and the recommendation.
 */
public class GetRouteForecastService implements GetRouteForecastUseCase {

    private final ForecastPreparer preparer;
    private final HistoryAligner history;
    private final AttentionPolicy attentionPolicy;
    private final RecommendationPolicy recommendationPolicy;

    /**
     * Creates the service.
     *
     * @param preparer             prepares forecasts for a query
     * @param history              aligns last year's facts to the current periods
     * @param attentionPolicy      classifies the deviation
     * @param recommendationPolicy suggests an action for the deviation
     */
    public GetRouteForecastService(
            ForecastPreparer preparer,
            HistoryAligner history,
            AttentionPolicy attentionPolicy,
            RecommendationPolicy recommendationPolicy) {
        this.preparer = preparer;
        this.history = history;
        this.attentionPolicy = attentionPolicy;
        this.recommendationPolicy = recommendationPolicy;
    }

    @Override
    public RouteForecastResult get(RouteId routeId, ForecastQuery query) {
        PreparedForecast prepared = preparer.prepare(query);
        RouteForecast route = prepared.routes().stream()
                .filter(r -> r.routeId().equals(routeId))
                .findFirst()
                .orElseThrow(() -> NotFoundException.route(routeId, prepared.knownRoutes()));
        ForecastPoint peak = SeriesAnalytics.peak(route.points()).orElse(null);
        ForecastPoint maxDeviation =
                SeriesAnalytics.maxDeviation(route.points(), attentionPolicy.minBaselineSharePct()).orElse(null);
        Double pct = maxDeviation == null ? null : maxDeviation.deviationPct();
        AttentionLevel level = attentionPolicy.classify(pct);
        Recommendation recommendation = recommendationPolicy.recommend(pct);
        return new RouteForecastResult(
                route,
                prepared.date(),
                history.forRoute(query.horizon(), prepared.date(), routeId),
                peak,
                maxDeviation,
                level,
                recommendation);
    }
}
