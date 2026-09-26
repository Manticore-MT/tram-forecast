package ru.tramforecast.api.web.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * JSON shapes of the REST API. All timestamps are ISO 8601 with an explicit offset; all dates are
 * {@code YYYY-MM-DD}. Field names are the contract with the frontend, see {@code docs/api-contract.md}.
 */
public final class Responses {

    private Responses() {
    }

    /**
     * One period of a series with the baseline, deviation and (when known) the fact.
     *
     * @param periodStart  start of the period
     * @param baseline     usual level
     * @param forecast     forecast value
     * @param actual       observed value, {@code null} until the period is known
     * @param deviationAbs forecast minus baseline
     * @param deviationPct deviation in percent of the baseline, {@code null} without a baseline
     */
    public record Point(
            OffsetDateTime periodStart,
            double baseline,
            double forecast,
            Double actual,
            double deviationAbs,
            Double deviationPct) {
    }

    /**
     * A compact point, enough to paint a map at the time-slider position.
     *
     * @param periodStart start of the period
     * @param baseline    usual level
     * @param forecast    forecast value
     */
    public record SlimPoint(OffsetDateTime periodStart, double baseline, double forecast) {
    }

    /**
     * A fact from the same period one year earlier, aligned to the current period.
     *
     * @param periodStart start of the current period it corresponds to
     * @param value       what was observed a year earlier
     */
    public record LastYearPoint(OffsetDateTime periodStart, double value) {
    }

    /**
     * Series of one route in the network overview.
     *
     * @param routeId route identifier
     * @param points  compact points
     */
    public record RouteSeries(String routeId, List<SlimPoint> points) {
    }

    /**
     * Response of {@code GET /api/routes}.
     *
     * @param horizon     {@code day}, {@code month} or {@code year}
     * @param date        resolved anchor date
     * @param lastUpdated when the oldest underlying snapshot was generated
     * @param routes      one series per route
     */
    public record NetworkOverview(String horizon, LocalDate date, OffsetDateTime lastUpdated, List<RouteSeries> routes) {
    }

    /**
     * Series of one stop inside a route response.
     *
     * @param stopId stop identifier
     * @param points compact points
     */
    public record StopSeries(String stopId, List<SlimPoint> points) {
    }

    /**
     * Response of {@code GET /api/routes/{routeId}/forecast}.
     *
     * @param routeId     route identifier
     * @param horizon     {@code day}, {@code month} or {@code year}
     * @param date        resolved anchor date
     * @param lastUpdated when the oldest underlying snapshot was generated
     * @param points      route total per period
     * @param lastYear    route total a year earlier
     * @param stops       series of every stop of the route
     */
    public record RouteForecast(
            String routeId,
            String horizon,
            LocalDate date,
            OffsetDateTime lastUpdated,
            List<Point> points,
            List<LastYearPoint> lastYear,
            List<StopSeries> stops) {
    }

    /**
     * A suggested dispatcher action.
     *
     * @param action   {@code ADD_VEHICLE}, {@code REMOVE_VEHICLE} or {@code NONE}
     * @param vehicles number of vehicles
     */
    public record Recommendation(String action, int vehicles) {
    }

    /**
     * Response of {@code GET /api/routes/{routeId}/stops/{stopId}/forecast}.
     *
     * @param routeId        route identifier
     * @param stopId         stop identifier
     * @param horizon        {@code day}, {@code month} or {@code year}
     * @param date           resolved anchor date
     * @param lastUpdated    when the snapshot was generated
     * @param modelVersion   version of the model that produced it
     * @param status         {@code NORMAL}, {@code WARNING} or {@code CRITICAL}
     * @param peakAt         period with the highest forecast
     * @param maxDeviationAt period with the largest deviation from the baseline
     * @param recommendation suggested action
     * @param points         the series
     * @param lastYear       facts a year earlier
     * @param factors        factors the model took into account
     */
    public record StopForecast(
            String routeId,
            String stopId,
            String horizon,
            LocalDate date,
            OffsetDateTime lastUpdated,
            String modelVersion,
            String status,
            OffsetDateTime peakAt,
            OffsetDateTime maxDeviationAt,
            Recommendation recommendation,
            List<Point> points,
            List<LastYearPoint> lastYear,
            List<String> factors) {
    }

    /**
     * One attention zone.
     *
     * @param routeId        route identifier
     * @param stopId         stop identifier
     * @param level          {@code WARNING} or {@code CRITICAL}
     * @param deviationAbs   absolute deviation at the point of maximum deviation
     * @param deviationPct   percent deviation at that point
     * @param peakAt         period with the highest forecast
     * @param maxDeviationAt period with the largest deviation
     * @param recommendation suggested action
     */
    public record AttentionZone(
            String routeId,
            String stopId,
            String level,
            double deviationAbs,
            double deviationPct,
            OffsetDateTime peakAt,
            OffsetDateTime maxDeviationAt,
            Recommendation recommendation) {
    }

    /**
     * Response of {@code GET /api/attention}.
     *
     * @param horizon     {@code day}, {@code month} or {@code year}
     * @param date        resolved anchor date
     * @param lastUpdated when the oldest underlying snapshot was generated
     * @param zones       zones, largest deviation first
     */
    public record Attention(String horizon, LocalDate date, OffsetDateTime lastUpdated, List<AttentionZone> zones) {
    }

    /**
     * One cell of the load matrix.
     *
     * @param dayOfWeek ISO day of week, 1 = Monday
     * @param hour      hour of day, 0-23
     * @param value     typical load
     */
    public record MatrixCell(int dayOfWeek, int hour, double value) {
    }

    /**
     * Response of {@code GET /api/routes/{routeId}/load-matrix}.
     *
     * @param routeId route identifier
     * @param cells   matrix cells
     */
    public record LoadMatrix(String routeId, List<MatrixCell> cells) {
    }

    /**
     * Accuracy of one day.
     *
     * @param date      the day
     * @param wape      weighted absolute percentage error
     * @param wapeScore {@code max(0, 1 - wape)}
     */
    public record DailyAccuracy(LocalDate date, double wape, double wapeScore) {
    }

    /**
     * Response of {@code GET /api/model/stats}.
     *
     * @param wape      overall WAPE, {@code null} when there is nothing to compare
     * @param wapeScore overall WAPE-score, {@code null} when there is nothing to compare
     * @param history   accuracy per day, oldest first
     * @param source    {@code ml-backtest} (measured by the ML side on a historical block) or {@code facts}
     *                  (the backend's own stored forecasts against the facts)
     * @param note      what the numbers are and are not, for a caption; {@code null} when there is none
     */
    public record ModelStats(
            Double wape, Double wapeScore, List<DailyAccuracy> history, String source, String note) {
    }
}
