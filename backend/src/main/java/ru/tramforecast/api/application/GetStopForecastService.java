package ru.tramforecast.api.application;

import ru.tramforecast.api.domain.model.AttentionLevel;
import ru.tramforecast.api.domain.model.ForecastPoint;
import ru.tramforecast.api.domain.model.Recommendation;
import ru.tramforecast.api.domain.model.RouteId;
import ru.tramforecast.api.domain.model.StopForecast;
import ru.tramforecast.api.domain.model.StopId;
import ru.tramforecast.api.domain.service.AttentionPolicy;
import ru.tramforecast.api.domain.service.RecommendationPolicy;
import ru.tramforecast.api.domain.service.SeriesAnalytics;

/**
 * Implements {@link GetStopForecastUseCase}. The deviation, the verdict and the recommendation are
 * computed here, in the backend, from the baseline and forecast that ML supplies.
 */
public class GetStopForecastService implements GetStopForecastUseCase {

    private final ForecastPreparer preparer;
    private final HistoryAligner history;
    private final AttentionPolicy attentionPolicy;
    private final RecommendationPolicy recommendationPolicy;

    /**
     * Creates the service.
     *
     * @param preparer             prepares forecasts for a query
     * @param history              builds the year-ago facts
     * @param attentionPolicy      classifies deviations
     * @param recommendationPolicy maps deviations to actions
     */
    public GetStopForecastService(
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
    public StopForecastResult get(RouteId routeId, StopId stopId, ForecastQuery query) {
        PreparedForecast prepared = preparer.prepare(query);
        StopForecast stop = prepared.stops().stream()
                .filter(s -> s.routeId().equals(routeId) && s.stopId().equals(stopId))
                .findFirst()
                .orElseThrow(() -> prepared.missing(routeId, stopId));
        ForecastPoint peak = SeriesAnalytics.peak(stop.points()).orElse(null);
        ForecastPoint maxDeviation = SeriesAnalytics.maxDeviation(stop.points()).orElse(null);
        Double pct = maxDeviation == null ? null : maxDeviation.deviationPct();
        AttentionLevel level = attentionPolicy.classify(pct);
        Recommendation recommendation = recommendationPolicy.recommend(pct);
        return new StopForecastResult(
                stop,
                prepared.date(),
                history.forStop(query.horizon(), prepared.date(), routeId, stopId),
                peak,
                maxDeviation,
                level,
                recommendation);
    }
}
