package ru.tramforecast.api.infrastructure.config;

import java.time.Clock;
import java.time.ZoneId;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import ru.tramforecast.api.application.ExportForecastService;
import ru.tramforecast.api.application.ExportForecastUseCase;
import ru.tramforecast.api.application.ForecastDates;
import ru.tramforecast.api.application.ForecastLoader;
import ru.tramforecast.api.application.ForecastPreparer;
import ru.tramforecast.api.application.GetAttentionZonesService;
import ru.tramforecast.api.application.GetAttentionZonesUseCase;
import ru.tramforecast.api.application.GetLoadMatrixService;
import ru.tramforecast.api.application.GetLoadMatrixUseCase;
import ru.tramforecast.api.application.GetMetaService;
import ru.tramforecast.api.application.GetMetaUseCase;
import ru.tramforecast.api.application.GetModelStatsService;
import ru.tramforecast.api.application.GetModelStatsUseCase;
import ru.tramforecast.api.application.GetNetworkOverviewService;
import ru.tramforecast.api.application.GetNetworkOverviewUseCase;
import ru.tramforecast.api.application.GetRouteForecastService;
import ru.tramforecast.api.application.GetRouteForecastUseCase;
import ru.tramforecast.api.application.GetStopForecastService;
import ru.tramforecast.api.application.GetStopForecastUseCase;
import ru.tramforecast.api.application.HistoryAligner;
import ru.tramforecast.api.application.RefreshForecastService;
import ru.tramforecast.api.application.RefreshForecastUseCase;
import ru.tramforecast.api.domain.port.ActualRepository;
import ru.tramforecast.api.domain.port.ForecastRepository;
import ru.tramforecast.api.domain.port.MlForecastClient;
import ru.tramforecast.api.domain.port.MlMetricsClient;
import ru.tramforecast.api.domain.service.AttentionPolicy;
import ru.tramforecast.api.domain.service.AttentionZoneCalculator;
import ru.tramforecast.api.domain.service.RecommendationPolicy;

/**
 * Wires the framework-free application and domain classes into Spring beans. Keeping the wiring
 * here (instead of annotating the classes) keeps the inner layers independent of Spring.
 */
@Configuration
public class UseCaseConfig {

    /**
     * Attention thresholds.
     *
     * @param properties application settings
     * @return the policy
     */
    @Bean
    public AttentionPolicy attentionPolicy(TramProperties properties) {
        return new AttentionPolicy(properties.attention().warningPct(), properties.attention().criticalPct());
    }

    /**
     * Recommendation rule: an action starts at the warning threshold.
     *
     * @param properties application settings
     * @return the policy
     */
    @Bean
    public RecommendationPolicy recommendationPolicy(TramProperties properties) {
        return new RecommendationPolicy(properties.attention().warningPct());
    }

    /**
     * Zone calculator.
     *
     * @param attention      attention policy
     * @param recommendation recommendation policy
     * @return the calculator
     */
    @Bean
    public AttentionZoneCalculator attentionZoneCalculator(
            AttentionPolicy attention, RecommendationPolicy recommendation) {
        return new AttentionZoneCalculator(attention, recommendation);
    }

    /**
     * Date resolution and validation.
     *
     * @param clock      source of "now"
     * @param zone       API zone
     * @param properties application settings
     * @return the resolver
     */
    @Bean
    public ForecastDates forecastDates(Clock clock, ZoneId zone, TramProperties properties) {
        return new ForecastDates(
                clock, zone, properties.forecast().maxYearsAhead(), properties.forecast().from(),
                properties.forecast().to());
    }

    /**
     * Read-through loader of forecasts.
     *
     * @param repository stored snapshots
     * @param ml         the ML service
     * @return the loader
     */
    @Bean
    public ForecastLoader forecastLoader(ForecastRepository repository, MlForecastClient ml) {
        return new ForecastLoader(repository, ml);
    }

    /**
     * Common preparation of forecast reads.
     *
     * @param loader  forecast loader
     * @param actuals observed values
     * @param dates   date resolution
     * @return the preparer
     */
    @Bean
    public ForecastPreparer forecastPreparer(ForecastLoader loader, ActualRepository actuals, ForecastDates dates) {
        return new ForecastPreparer(loader, actuals, dates);
    }

    /**
     * Year-ago facts aligner.
     *
     * @param actuals observed values
     * @param zone    API zone
     * @return the aligner
     */
    @Bean
    public HistoryAligner historyAligner(ActualRepository actuals, ZoneId zone) {
        return new HistoryAligner(actuals, zone);
    }

    /**
     * Network overview use case.
     *
     * @param preparer forecast preparer
     * @return the use case
     */
    @Bean
    public GetNetworkOverviewUseCase getNetworkOverviewUseCase(ForecastPreparer preparer) {
        return new GetNetworkOverviewService(preparer);
    }

    /**
     * Route forecast use case.
     *
     * @param preparer forecast preparer
     * @param history  year-ago facts
     * @return the use case
     */
    @Bean
    public GetRouteForecastUseCase getRouteForecastUseCase(ForecastPreparer preparer, HistoryAligner history) {
        return new GetRouteForecastService(preparer, history);
    }

    /**
     * Stop forecast use case.
     *
     * @param preparer       forecast preparer
     * @param history        year-ago facts
     * @param attention      attention policy
     * @param recommendation recommendation policy
     * @return the use case
     */
    @Bean
    public GetStopForecastUseCase getStopForecastUseCase(
            ForecastPreparer preparer,
            HistoryAligner history,
            AttentionPolicy attention,
            RecommendationPolicy recommendation) {
        return new GetStopForecastService(preparer, history, attention, recommendation);
    }

    /**
     * Attention zones use case.
     *
     * @param preparer   forecast preparer
     * @param calculator zone calculator
     * @return the use case
     */
    @Bean
    public GetAttentionZonesUseCase getAttentionZonesUseCase(
            ForecastPreparer preparer, AttentionZoneCalculator calculator) {
        return new GetAttentionZonesService(preparer, calculator);
    }

    /**
     * Load matrix use case.
     *
     * @param actuals observed values
     * @return the use case
     */
    @Bean
    public GetLoadMatrixUseCase getLoadMatrixUseCase(ActualRepository actuals) {
        return new GetLoadMatrixService(actuals);
    }

    /**
     * Export use case.
     *
     * @param preparer forecast preparer
     * @return the use case
     */
    @Bean
    public ExportForecastUseCase exportForecastUseCase(ForecastPreparer preparer) {
        return new ExportForecastService(preparer);
    }

    /**
     * Model statistics use case. With the ML service connected its own quality measurements are used;
     * without it (the stub) the backend measures from its stored forecasts and the facts.
     *
     * @param forecasts stored snapshots
     * @param actuals   observed values
     * @param ml        the ML service's quality measurements, present only in {@code http} mode
     * @param dates     what "today" is
     * @return the use case
     */
    @Bean
    public GetModelStatsUseCase getModelStatsUseCase(
            ForecastRepository forecasts,
            ActualRepository actuals,
            ObjectProvider<MlMetricsClient> ml,
            ForecastDates dates) {
        return new GetModelStatsService(forecasts, actuals, ml.getIfAvailable(), dates);
    }

    /**
     * Service metadata use case.
     *
     * @param clock      source of "now"
     * @param dates      date resolution and limits
     * @param zone       API zone
     * @param properties application settings
     * @return the use case
     */
    @Bean
    public GetMetaUseCase getMetaUseCase(Clock clock, ForecastDates dates, ZoneId zone, TramProperties properties) {
        String dataSource = "http".equalsIgnoreCase(properties.ml().mode()) ? "model" : "stub";
        return new GetMetaService(clock, dates, zone, dataSource);
    }

    /**
     * Scheduled refresh use case.
     *
     * @param repository stored snapshots
     * @param ml         the ML service
     * @return the use case
     */
    @Bean
    public RefreshForecastUseCase refreshForecastUseCase(ForecastRepository repository, MlForecastClient ml) {
        return new RefreshForecastService(repository, ml);
    }
}
