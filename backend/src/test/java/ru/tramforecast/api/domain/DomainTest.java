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
import ru.tramforecast.api.domain.service.AttentionPolicy;
import ru.tramforecast.api.domain.service.AttentionZoneCalculator;
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
        assertThat(SeriesAnalytics.maxDeviation(points, 0)).get().extracting(ForecastPoint::periodStart).isEqualTo(T1);
    }

    /**
     * A near-empty hour whose baseline is a sliver of the route's busiest hour is ignored even when its
     * percent deviation is technically huge: a stray boarding or two against a baseline of one reads as
     * "+300 %", but the point that matters is the real, busy hour.
     */
    @Test
    void maxDeviationIgnoresDeviationsOnAnAlmostEmptyBaseline() {
        List<ForecastPoint> points = List.of(
                new ForecastPoint(T0, 1, 3, null),     // +200 %, but only 2 more boardings than usual
                new ForecastPoint(T1, 5000, 5300, null), // +6 %, but 300 more boardings at the real peak
                new ForecastPoint(T2, 4000, 3600, null));  // -10 %

        assertThat(SeriesAnalytics.maxDeviation(points, 10)).get()
                .extracting(ForecastPoint::periodStart).isEqualTo(T2);
        // Without the floor the near-empty hour would win on percent alone.
        assertThat(SeriesAnalytics.maxDeviation(points, 0)).get()
                .extracting(ForecastPoint::periodStart).isEqualTo(T0);
    }

    /**
     * Only routes beyond the threshold become zones, ranked by deviation, with a recommendation.
     */
    @Test
    void attentionZonesAreThresholdedRankedAndCarryRecommendations() {
        AttentionZoneCalculator calculator = new AttentionZoneCalculator(
                new AttentionPolicy(10, 25, 10), new RecommendationPolicy(10));
        RouteForecast calm = route("R1", new ForecastPoint(T0, 100, 105, null));
        RouteForecast busy = route("R2", new ForecastPoint(T0, 100, 130, null));
        RouteForecast quiet = route("R3", new ForecastPoint(T0, 100, 85, null));

        List<AttentionZone> zones = calculator.calculate(List.of(calm, busy, quiet));

        assertThat(zones).extracting(z -> z.routeId().value()).containsExactly("R2", "R3");
        assertThat(zones.get(0).level()).isEqualTo(AttentionLevel.CRITICAL);
        assertThat(zones.get(0).recommendation().action()).isEqualTo(RecommendationAction.ADD_VEHICLE);
        assertThat(zones.get(1).level()).isEqualTo(AttentionLevel.WARNING);
        assertThat(zones.get(1).recommendation().action()).isEqualTo(RecommendationAction.REMOVE_VEHICLE);
    }

    /**
     * A route forecast can swap its points and keeps everything else.
     */
    @Test
    void routeForecastKeepsItsIdentityWhenPointsAreReplaced() {
        RouteForecast original = route("R1", new ForecastPoint(T0, 100, 120, null));

        RouteForecast changed = original.withPoints(List.of(new ForecastPoint(T0, 100, 150, null)));

        assertThat(changed.routeId()).isEqualTo(original.routeId());
        assertThat(changed.modelVersion()).isEqualTo("test");
        assertThat(changed.factors()).containsExactly("factor");
        assertThat(changed.points().get(0).forecast()).isEqualTo(150);
        assertThat(original.points().get(0).forecast()).isEqualTo(120);
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

    /**
     * A week is seven days starting at the anchor date itself, not a calendar week, so the operator
     * chooses the first day.
     */
    @Test
    void weekIsSevenDaysStartingAtTheDate() {
        ZoneId moscow = ZoneId.of("Europe/Moscow");
        // Friday: a calendar week would start on Monday the 21st
        ForecastPeriod week = ForecastPeriod.of(Horizon.WEEK, LocalDate.of(2026, 9, 25), moscow);

        assertThat(week.start()).isEqualTo(Instant.parse("2026-09-24T21:00:00Z"));
        assertThat(week.end()).isEqualTo(Instant.parse("2026-10-01T21:00:00Z"));
        assertThat(week.contains(Instant.parse("2026-09-20T12:00:00Z"))).isFalse();
        assertThat(Horizon.WEEK.granularity()).isEqualTo(ru.tramforecast.api.domain.model.Granularity.DAY);
    }

    private static RouteForecast route(String route, ForecastPoint point) {
        return new RouteForecast(
                new RouteId(route), Horizon.DAY, LocalDate.of(2026, 9, 25), T0, "test", List.of(point),
                List.of("factor"));
    }
}
