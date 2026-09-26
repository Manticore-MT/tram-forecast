package ru.tramforecast.api.infrastructure.config;

import java.time.Duration;
import java.time.LocalDate;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Typed view of the {@code tram.*} settings in {@code application.yml}.
 *
 * @param zone      IANA zone all API timestamps are rendered in
 * @param clock     optional emulated "now"
 * @param ml        how the ML service is reached
 * @param attention thresholds for attention zones and recommendations
 * @param forecast  limits on forecast requests
 * @param refresh   optional scheduled warm-up of forecasts
 * @param cache     short-lived read caches in front of the storage
 */
@ConfigurationProperties(prefix = "tram")
public record TramProperties(
        String zone, Clock clock, Ml ml, Attention attention, Forecast forecast, Refresh refresh, Cache cache) {

    /**
     * Emulated current time.
     *
     * @param fixedInstant ISO instant to freeze "now" at, blank for the real clock
     */
    public record Clock(String fixedInstant) {
    }

    /**
     * ML service connection.
     *
     * @param mode           {@code stub} for synthetic forecasts, {@code http} for the real service
     * @param baseUrl        base URL of the ML service
     * @param connectTimeout connect timeout
     * @param readTimeout    read timeout
     * @param stub           shape of the synthetic network
     */
    public record Ml(String mode, String baseUrl, Duration connectTimeout, Duration readTimeout, Stub stub) {
    }

    /**
     * Shape of the synthetic network served in stub mode.
     *
     * @param routes        number of routes
     * @param stopsPerRoute stops on each route
     */
    public record Stub(int routes, int stopsPerRoute) {
    }

    /**
     * Attention thresholds, percent of the baseline.
     *
     * @param warningPct  from this deviation a point is a warning and an action is recommended
     * @param criticalPct from this deviation a point is critical
     */
    public record Attention(double warningPct, double criticalPct) {
    }

    /**
     * Limits on forecast requests.
     *
     * @param maxYearsAhead how far ahead a forecast may be requested when the model has no fixed range
     * @param from          first date the model covers, blank for no lower limit
     * @param to            last date the model covers, blank for "today plus the allowed years"
     */
    public record Forecast(int maxYearsAhead, LocalDate from, LocalDate to) {
    }

    /**
     * Read caches in front of the storage. Facts and stored snapshots change rarely, so a short
     * time-to-live removes almost all repeated aggregation work without serving stale data for long.
     *
     * @param forecastTtl how long a stored forecast read is reused
     * @param actualTtl   how long an aggregated facts read is reused
     * @param maxEntries  maximum entries per cache
     */
    public record Cache(Duration forecastTtl, Duration actualTtl, int maxEntries) {
    }

    /**
     * Scheduled warm-up.
     *
     * @param enabled whether the scheduler runs
     * @param cron    Spring cron expression
     */
    public record Refresh(boolean enabled, String cron) {
    }
}
