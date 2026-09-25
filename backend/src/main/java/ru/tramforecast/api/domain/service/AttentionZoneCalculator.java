package ru.tramforecast.api.domain.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import ru.tramforecast.api.domain.model.AttentionLevel;
import ru.tramforecast.api.domain.model.AttentionZone;
import ru.tramforecast.api.domain.model.ForecastPoint;
import ru.tramforecast.api.domain.model.StopForecast;

/**
 * Finds attention zones: stops whose forecast deviates from the baseline beyond the policy
 * thresholds, ranked by how large the deviation is.
 */
public final class AttentionZoneCalculator {

    private final AttentionPolicy attentionPolicy;
    private final RecommendationPolicy recommendationPolicy;

    /**
     * Creates a calculator.
     *
     * @param attentionPolicy      decides which deviations are unusual
     * @param recommendationPolicy decides which action a deviation warrants
     */
    public AttentionZoneCalculator(AttentionPolicy attentionPolicy, RecommendationPolicy recommendationPolicy) {
        this.attentionPolicy = attentionPolicy;
        this.recommendationPolicy = recommendationPolicy;
    }

    /**
     * Computes the zones for a set of stop forecasts.
     *
     * @param forecasts stop forecasts of one horizon and date
     * @return zones ordered by descending absolute percent deviation
     */
    public List<AttentionZone> calculate(List<StopForecast> forecasts) {
        List<AttentionZone> zones = new ArrayList<>();
        for (StopForecast forecast : forecasts) {
            Optional<ForecastPoint> maxDeviation = SeriesAnalytics.maxDeviation(forecast.points());
            Optional<ForecastPoint> peak = SeriesAnalytics.peak(forecast.points());
            if (maxDeviation.isEmpty() || peak.isEmpty()) {
                continue;
            }
            ForecastPoint deviating = maxDeviation.get();
            double pct = deviating.deviationPct();
            AttentionLevel level = attentionPolicy.classify(pct);
            if (level == AttentionLevel.NORMAL) {
                continue;
            }
            zones.add(new AttentionZone(
                    forecast.routeId(),
                    forecast.stopId(),
                    deviating.deviationAbs(),
                    pct,
                    peak.get().periodStart(),
                    deviating.periodStart(),
                    level,
                    recommendationPolicy.recommend(pct)));
        }
        zones.sort(Comparator.comparingDouble((AttentionZone z) -> Math.abs(z.deviationPct())).reversed());
        return zones;
    }
}
