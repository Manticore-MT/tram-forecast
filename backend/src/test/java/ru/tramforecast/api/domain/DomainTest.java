package ru.tramforecast.api.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.OptionalDouble;
import org.junit.jupiter.api.Test;
import ru.tramforecast.api.domain.model.AttentionLevel;
import ru.tramforecast.api.domain.model.AttentionZone;
import ru.tramforecast.api.domain.model.CorrectionCoefficients;
import ru.tramforecast.api.domain.model.ForecastPoint;
import ru.tramforecast.api.domain.model.Horizon;
import ru.tramforecast.api.domain.model.RecommendationAction;
import ru.tramforecast.api.domain.model.RouteForecast;
import ru.tramforecast.api.domain.model.RouteId;
import ru.tramforecast.api.domain.model.StopForecast;
import ru.tramforecast.api.domain.model.StopId;
import ru.tramforecast.api.domain.service.AttentionPolicy;
import ru.tramforecast.api.domain.service.AttentionZoneCalculator;
import ru.tramforecast.api.domain.service.ForecastAggregator;
import ru.tramforecast.api.domain.service.ForecastPeriod;
import ru.tramforecast.api.domain.service.RecommendationPolicy;
import ru.tramforecast.api.domain.service.SeriesAnalytics;
import ru.tramforecast.api.domain.service.Wape;

/**
 * Unit tests of the pure business rules: deviation, peaks, zones, aggregation, WAPE, periods.
 */
class DomainTest {

    private static final Instant T0 = Instant.parse("2026-09-25T00:00:00Z");
    private static final Instant T1 = T0.plusSeconds(3600);
    private static final Instant T2 = T0.plusSeconds(7200);

    /**
     * Deviation is forecast minus baseline, in percent of the baseline.
     */
    @Test
    void deviationIsMeasuredAgainstBaseline() {
        ForecastPoint point = new ForecastPoint(T0, 900, 1240, null);
        assertThat(point.deviationAbs()).isEqualTo(340);
        assertThat(point.deviationPct()).isCloseTo(37.78, org.assertj.core.data.Offset.offset(0.01));
    }

    /**
     * Without a positive baseline there is no percent deviation.
     */
    @Test
    void noPercentDeviationWithoutBaseline() {
        assertThat(new ForecastPoint(T0, 0, 10, null).deviationPct()).isNull();
    }

    /**
     * Peak is the maximum forecast, max deviation the largest gap to the baseline.
     */
    @Test
    void peakAndMaxDeviationAreDifferentThings() {
        List<ForecastPoint> points = List.of(
                new ForecastPoint(T0, 1000, 1100, null),
                new ForecastPoint(T1, 100, 180, null),
                new ForecastPoint(T2, 500, 500, null));
        assertThat(SeriesAnalytics.peak(points)).get().extracting(ForecastPoint::periodStart).isEqualTo(T0);
        assertThat(SeriesAnalytics.maxDeviation(points)).get().extracting(ForecastPoint::periodStart).isEqualTo(T1);
    }

    /**
     * Only stops beyond the threshold become zones, ranked by deviation, with a recommendation.
     */
    @Test
    void attentionZonesAreThresholdedRankedAndCarryRecommendations() {
        AttentionZoneCalculator calculator = new AttentionZoneCalculator(
                new AttentionPolicy(10, 25), new RecommendationPolicy(10));
        StopForecast calm = stop("R1", "S1", new ForecastPoint(T0, 100, 105, null));
        StopForecast busy = stop("R1", "S2", new ForecastPoint(T0, 100, 130, null));
        StopForecast quiet = stop("R2", "S3", new ForecastPoint(T0, 100, 85, null));

        List<AttentionZone> zones = calculator.calculate(List.of(calm, busy, quiet));

        assertThat(zones).extracting(z -> z.stopId().value()).containsExactly("S2", "S3");
        assertThat(zones.get(0).level()).isEqualTo(AttentionLevel.CRITICAL);
        assertThat(zones.get(0).recommendation().action()).isEqualTo(RecommendationAction.ADD_VEHICLE);
        assertThat(zones.get(1).level()).isEqualTo(AttentionLevel.WARNING);
        assertThat(zones.get(1).recommendation().action()).isEqualTo(RecommendationAction.REMOVE_VEHICLE);
    }

    /**
     * Stop series are summed per period into route series, and freshness is the oldest snapshot.
     */
    @Test
    void routeForecastSumsStopsPerPeriod() {
        StopForecast a = stop("R1", "S1", new ForecastPoint(T0, 100, 120, 110.0));
        StopForecast b = stop("R1", "S2", new ForecastPoint(T0, 50, 60, null));

        List<RouteForecast> routes = ForecastAggregator.byRoute(List.of(a, b));

        assertThat(routes).hasSize(1);
        ForecastPoint total = routes.get(0).points().get(0);
        assertThat(total.baseline()).isEqualTo(150);
        assertThat(total.forecast()).isEqualTo(180);
        assertThat(total.actual()).isEqualTo(110.0);
    }

    /**
     * WAPE and its score follow the judging formula.
     */
    @Test
    void wapeMatchesTheJudgingFormula() {
        OptionalDouble wape = Wape.wape(List.of(100.0, 100.0), List.of(90.0, 120.0));
        assertThat(wape.getAsDouble()).isCloseTo(0.15, org.assertj.core.data.Offset.offset(1e-9));
        assertThat(Wape.score(0.15)).isCloseTo(0.85, org.assertj.core.data.Offset.offset(1e-9));
        assertThat(Wape.score(1.7)).isZero();
        assertThat(Wape.wape(List.of(0.0), List.of(5.0))).isEmpty();
    }

    /**
     * Correction coefficients multiply, and out-of-range values are rejected.
     */
    @Test
    void correctionCoefficientsMultiplyAndAreBounded() {
        assertThat(new CorrectionCoefficients(1.1, 1.2, 1.0).factor()).isCloseTo(1.32, org.assertj.core.data.Offset.offset(1e-9));
        assertThat(CorrectionCoefficients.NONE.isIdentity()).isTrue();
        assertThatThrownBy(() -> new CorrectionCoefficients(0.0, 1, 1)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new CorrectionCoefficients(1, 9, 1)).isInstanceOf(IllegalArgumentException.class);
    }

    /**
     * A horizon covers the day, month or year around the date in the given zone.
     */
    @Test
    void forecastPeriodCoversDayMonthYearInZone() {
        ZoneId moscow = ZoneId.of("Europe/Moscow");
        LocalDate date = LocalDate.of(2026, 9, 25);
        ForecastPeriod day = ForecastPeriod.of(Horizon.DAY, date, moscow);
        ForecastPeriod month = ForecastPeriod.of(Horizon.MONTH, date, moscow);
        ForecastPeriod year = ForecastPeriod.of(Horizon.YEAR, date, moscow);

        assertThat(day.start()).isEqualTo(Instant.parse("2026-09-24T21:00:00Z"));
        assertThat(day.end()).isEqualTo(Instant.parse("2026-09-25T21:00:00Z"));
        assertThat(month.start()).isEqualTo(Instant.parse("2026-08-31T21:00:00Z"));
        assertThat(month.end()).isEqualTo(Instant.parse("2026-09-30T21:00:00Z"));
        assertThat(year.start()).isEqualTo(Instant.parse("2025-12-31T21:00:00Z"));
        assertThat(year.contains(Instant.parse("2026-06-01T00:00:00Z"))).isTrue();
    }

    private static StopForecast stop(String route, String stop, ForecastPoint point) {
        return new StopForecast(
                new RouteId(route), new StopId(stop), Horizon.DAY, LocalDate.of(2026, 9, 25),
                T0, "test", List.of(point), List.of());
    }
}
