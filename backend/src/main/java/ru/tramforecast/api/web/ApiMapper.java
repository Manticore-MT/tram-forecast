package ru.tramforecast.api.web;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Locale;
import ru.tramforecast.api.application.AttentionResult;
import ru.tramforecast.api.application.HistoryPoint;
import ru.tramforecast.api.application.NetworkOverview;
import ru.tramforecast.api.application.RouteForecastResult;
import ru.tramforecast.api.application.StopForecastResult;
import ru.tramforecast.api.domain.model.AttentionZone;
import ru.tramforecast.api.domain.model.ForecastPoint;
import ru.tramforecast.api.domain.model.Horizon;
import ru.tramforecast.api.domain.model.LoadMatrix;
import ru.tramforecast.api.domain.model.ModelStats;
import ru.tramforecast.api.domain.model.Recommendation;
import ru.tramforecast.api.domain.model.RouteForecast;
import ru.tramforecast.api.domain.model.StopForecast;
import ru.tramforecast.api.web.dto.Responses;

/**
 * Converts application results into API responses, rendering every instant in the API zone with an
 * explicit offset (for example {@code 2026-09-25T09:00:00+03:00}).
 */
public class ApiMapper {

    private final ZoneId zone;

    /**
     * Creates the mapper.
     *
     * @param zone zone timestamps are rendered in
     */
    public ApiMapper(ZoneId zone) {
        this.zone = zone;
    }

    /**
     * Maps the network overview.
     *
     * @param overview the overview
     * @return the response
     */
    public Responses.NetworkOverview toResponse(NetworkOverview overview) {
        return new Responses.NetworkOverview(
                horizon(overview.horizon()),
                overview.date(),
                time(overview.lastUpdated()),
                overview.routes().stream()
                        .map(r -> new Responses.RouteSeries(r.routeId().value(), slim(r.points())))
                        .toList());
    }

    /**
     * Maps a route forecast.
     *
     * @param result the route forecast
     * @return the response
     */
    public Responses.RouteForecast toResponse(RouteForecastResult result) {
        RouteForecast route = result.route();
        return new Responses.RouteForecast(
                route.routeId().value(),
                horizon(route.horizon()),
                route.date(),
                time(route.generatedAt()),
                points(route.points()),
                lastYear(result.lastYear()),
                result.stops().stream()
                        .map(s -> new Responses.StopSeries(s.stopId().value(), slim(s.points())))
                        .toList());
    }

    /**
     * Maps a stop forecast.
     *
     * @param result the stop details
     * @return the response
     */
    public Responses.StopForecast toResponse(StopForecastResult result) {
        StopForecast forecast = result.forecast();
        return new Responses.StopForecast(
                forecast.routeId().value(),
                forecast.stopId().value(),
                horizon(forecast.horizon()),
                result.date(),
                time(forecast.generatedAt()),
                forecast.modelVersion(),
                result.level().name(),
                result.peak() == null ? null : time(result.peak().periodStart()),
                result.maxDeviation() == null ? null : time(result.maxDeviation().periodStart()),
                recommendation(result.recommendation()),
                points(forecast.points()),
                lastYear(result.lastYear()),
                forecast.factors());
    }

    /**
     * Maps the attention zones.
     *
     * @param result the zones
     * @return the response
     */
    public Responses.Attention toResponse(AttentionResult result) {
        return new Responses.Attention(
                horizon(result.horizon()),
                result.date(),
                time(result.lastUpdated()),
                result.zones().stream().map(this::zone).toList());
    }

    /**
     * Maps a load matrix.
     *
     * @param matrix the matrix
     * @return the response
     */
    public Responses.LoadMatrix toResponse(LoadMatrix matrix) {
        return new Responses.LoadMatrix(
                matrix.routeId().value(),
                matrix.cells().stream()
                        .map(c -> new Responses.MatrixCell(c.dayOfWeek(), c.hour(), c.value()))
                        .toList());
    }

    /**
     * Maps the model statistics.
     *
     * @param stats the statistics
     * @return the response
     */
    public Responses.ModelStats toResponse(ModelStats stats) {
        return new Responses.ModelStats(
                stats.wape(),
                stats.wapeScore(),
                stats.history().stream()
                        .map(d -> new Responses.DailyAccuracy(d.date(), d.wape(), d.wapeScore()))
                        .toList(),
                stats.source(),
                stats.note());
    }

    /**
     * Renders an instant in the API zone.
     *
     * @param instant the instant
     * @return the same moment with the zone's offset
     */
    public OffsetDateTime time(Instant instant) {
        return instant.atZone(zone).toOffsetDateTime();
    }

    /**
     * Lower-case horizon name as used in URLs and JSON.
     *
     * @param horizon the horizon
     * @return {@code day}, {@code month} or {@code year}
     */
    public static String horizon(Horizon horizon) {
        return horizon.name().toLowerCase(Locale.ROOT);
    }

    private Responses.AttentionZone zone(AttentionZone zone) {
        return new Responses.AttentionZone(
                zone.routeId().value(),
                zone.stopId().value(),
                zone.level().name(),
                round(zone.deviationAbs()),
                round(zone.deviationPct()),
                time(zone.peakAt()),
                time(zone.maxDeviationAt()),
                recommendation(zone.recommendation()));
    }

    /**
     * Rounds a value to two decimals for the API, so the floating point noise of sums and
     * divisions never reaches the client.
     *
     * @param value the raw value
     * @return the rounded value
     */
    static double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private static Double round(Double value) {
        return value == null ? null : round(value.doubleValue());
    }

    private static Responses.Recommendation recommendation(Recommendation recommendation) {
        return new Responses.Recommendation(recommendation.action().name(), recommendation.vehicles());
    }

    private List<Responses.Point> points(List<ForecastPoint> points) {
        return points.stream()
                .map(p -> new Responses.Point(
                        time(p.periodStart()),
                        round(p.baseline()),
                        round(p.forecast()),
                        round(p.actual()),
                        round(p.deviationAbs()),
                        round(p.deviationPct())))
                .toList();
    }

    private List<Responses.SlimPoint> slim(List<ForecastPoint> points) {
        return points.stream()
                .map(p -> new Responses.SlimPoint(time(p.periodStart()), round(p.baseline()), round(p.forecast())))
                .toList();
    }

    private List<Responses.LastYearPoint> lastYear(List<HistoryPoint> history) {
        return history.stream().map(h -> new Responses.LastYearPoint(time(h.periodStart()), round(h.value()))).toList();
    }
}
