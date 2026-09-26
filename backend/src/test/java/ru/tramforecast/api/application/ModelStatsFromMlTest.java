package ru.tramforecast.api.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;
import ru.tramforecast.api.domain.model.BacktestDay;
import ru.tramforecast.api.domain.model.BacktestMetrics;
import ru.tramforecast.api.domain.model.ModelStats;
import ru.tramforecast.api.domain.port.MlMetricsClient;
import ru.tramforecast.api.domain.port.MlUnavailableException;
import ru.tramforecast.api.support.InMemoryActualRepository;
import ru.tramforecast.api.support.InMemoryForecastRepository;

/**
 * Tests of the quality statistics taken from the ML service's backtest: which days count, how the
 * overall WAPE is combined, and what happens when ML cannot be asked.
 */
class ModelStatsFromMlTest {

    private static final ZoneId MOSCOW = ZoneId.of("Europe/Moscow");
    private static final LocalDate BLOCK_START = LocalDate.of(2025, 9, 1);

    private final InMemoryForecastRepository forecasts = new InMemoryForecastRepository();
    private final InMemoryActualRepository actuals = new InMemoryActualRepository(MOSCOW);

    /**
     * A backtest block of 61 days (1 Sep .. 31 Oct): each day has 1000 observed and an error that varies
     * in a fixed pattern, so the expected WAPE of any set of days can be worked out by hand.
     */
    private static BacktestMetrics block() {
        List<BacktestDay> days = new ArrayList<>();
        for (int i = 0; i < 61; i++) {
            days.add(new BacktestDay(BLOCK_START.plusDays(i), 100 + (i % 5) * 10, 1000));
        }
        return new BacktestMetrics("2025-09-01", "Backtest of the model from 2025-09-01 (route x hour)", days, 0.88226);
    }

    private static ForecastDates on(String date) {
        return new ForecastDates(
                Clock.fixed(Instant.parse(date + "T06:00:00Z"), ZoneId.of("UTC")), MOSCOW, 1);
    }

    private GetModelStatsService service(MlMetricsClient ml, String today) {
        return new GetModelStatsService(forecasts, actuals, ml, on(today));
    }

    /**
     * On the frozen day 1 Nov the last 30 days of the block are 2 Oct .. 31 Oct; the overall WAPE is the
     * exact ratio of the summed errors to the summed observed values, not an average of daily ratios.
     */
    @Test
    void lastThirtyDaysBeforeTodayAreTakenFromTheBacktest() {
        ModelStats stats = service(() -> block(), "2025-11-01").get(30);

        assertThat(stats.source()).isEqualTo("ml-backtest");
        assertThat(stats.note()).contains("2025-09-01");
        assertThat(stats.history()).hasSize(30);
        assertThat(stats.history().get(0).date()).isEqualTo(LocalDate.of(2025, 10, 2));
        assertThat(stats.history().get(29).date()).isEqualTo(LocalDate.of(2025, 10, 31));
        double error = 0;
        for (int i = 31; i < 61; i++) {
            error += 100 + (i % 5) * 10;
        }
        assertThat(stats.wape()).isCloseTo(error / 30_000.0, org.assertj.core.data.Offset.offset(1e-12));
        assertThat(stats.wapeScore()).isCloseTo(1 - error / 30_000.0, org.assertj.core.data.Offset.offset(1e-12));
        // a single day: 2 Oct is index 31 -> error 110
        assertThat(stats.history().get(0).wape()).isEqualTo(0.11);
    }

    /**
     * The platform's score is reported on its own, next to the backtest but never merged into it: the
     * backtest numbers stay what the days give, and the note says the score is not a backtest and does not
     * apply to stops.
     */
    @Test
    void thePlatformScoreIsASeparateMeasurement() {
        ModelStats stats = service(() -> block(), "2025-11-01").get(30);

        assertThat(stats.platformScore()).isEqualTo(0.88226);
        assertThat(stats.platformNote()).contains("скрытой проверке платформы").contains("не бэктест").contains("остановки");
        assertThat(stats.wapeScore()).isNotEqualTo(0.88226);

        BacktestMetrics without = new BacktestMetrics("2025-09-01", "note", block().days());
        ModelStats none = service(() -> without, "2025-11-01").get(30);
        assertThat(none.platformScore()).isNull();
        assertThat(none.platformNote()).isNull();
    }

    /**
     * Asking for more days than the block has returns the whole block, oldest first.
     */
    @Test
    void anAskForMoreDaysThanTheBlockHasReturnsTheWholeBlock() {
        ModelStats stats = service(() -> block(), "2025-11-01").get(90);

        assertThat(stats.history()).hasSize(61);
        assertThat(stats.history().get(0).date()).isEqualTo(BLOCK_START);
    }

    /**
     * Days on or after "today" are not history yet, so a "today" inside the block counts only earlier
     * days.
     */
    @Test
    void onlyDaysBeforeTodayCount() {
        ModelStats stats = service(() -> block(), "2025-10-10").get(5);

        assertThat(stats.history()).extracting(d -> d.date().toString())
                .containsExactly("2025-10-05", "2025-10-06", "2025-10-07", "2025-10-08", "2025-10-09");
    }

    /**
     * Before the block there is nothing to compare: empty history and no overall value, not zeros.
     */
    @Test
    void nothingBeforeTheBlockGivesNoNumbers() {
        ModelStats stats = service(() -> block(), "2025-08-01").get(30);

        assertThat(stats.history()).isEmpty();
        assertThat(stats.wape()).isNull();
        assertThat(stats.wapeScore()).isNull();
        assertThat(stats.source()).isEqualTo("ml-backtest");
    }

    /**
     * If ML cannot be asked the backend measures from its own stored forecasts and the facts (here
     * there are none, so nothing to compare) instead of failing.
     */
    @Test
    void anUnavailableMlFallsBackToTheFacts() {
        MlMetricsClient down = () -> {
            throw new MlUnavailableException("down", null);
        };

        ModelStats stats = service(down, "2025-11-01").get(30);

        assertThat(stats.source()).isEqualTo("facts");
        assertThat(stats.note()).isNull();
        assertThat(stats.platformScore()).isNull();
        assertThat(stats.wape()).isNull();
        assertThat(stats.history()).isEmpty();
    }

    /**
     * The limits on {@code days} are the same whatever the source.
     */
    @Test
    void theDaysLimitStillApplies() {
        GetModelStatsService service = service(() -> block(), "2025-11-01");

        assertThatThrownBy(() -> service.get(0)).isInstanceOf(InvalidRequestException.class);
        assertThatThrownBy(() -> service.get(91)).isInstanceOf(InvalidRequestException.class);
    }
}
