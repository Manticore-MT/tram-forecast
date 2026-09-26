package ru.tramforecast.api.application;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.OptionalDouble;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import ru.tramforecast.api.domain.model.ActualValue;
import ru.tramforecast.api.domain.model.BacktestDay;
import ru.tramforecast.api.domain.model.BacktestMetrics;
import ru.tramforecast.api.domain.model.DailyAccuracy;
import ru.tramforecast.api.domain.model.ForecastPoint;
import ru.tramforecast.api.domain.model.Horizon;
import ru.tramforecast.api.domain.model.ModelStats;
import ru.tramforecast.api.domain.model.StopForecast;
import ru.tramforecast.api.domain.port.ActualRepository;
import ru.tramforecast.api.domain.port.ForecastRepository;
import ru.tramforecast.api.domain.port.MlMetricsClient;
import ru.tramforecast.api.domain.port.MlUnavailableException;
import ru.tramforecast.api.domain.service.Wape;

/**
 * Implements {@link GetModelStatsUseCase}. Accuracy is measured on the <em>initial</em> snapshot of
 * each day against the facts, never on the latest one: comparing a forecast that keeps updating
 * with the outcome would be a moving target. Reads storage only, it never triggers a forecast.
 *
 * <p>When the ML service can tell how good its model is (a backtest on a historical block), that is
 * used: the ML side owns the model and its measurements, and the backend may have no facts at all.
 * Only the last {@code days} days of the block that lie before "today" count, so the numbers describe
 * the period just before the moment the service works with. If ML cannot be asked, or is not
 * connected, the backend compares its own stored forecasts with the facts.
 */
public class GetModelStatsService implements GetModelStatsUseCase {

    private static final Logger LOG = LoggerFactory.getLogger(GetModelStatsService.class);
    private static final int MAX_DAYS = 90;
    private static final String SOURCE_ML = "ml-backtest";
    /**
     * The platform's score is a different measurement from the backtest (a hidden check of the submitted
     * contest file, reported by the team), and it is a route x hour score: it says nothing about stops, whose
     * values are a demonstration. The wording is the ML side's.
     */
    private static final String PLATFORM_NOTE = "Результат на скрытой проверке платформы для отправленного "
            + "конкурсного файла (сообщён командой). Это не бэктест, и переносить его на остановки нельзя: "
            + "прогноз по остановкам демонстрационный.";

    private final ForecastRepository forecasts;
    private final ActualRepository actuals;
    private final MlMetricsClient ml;
    private final ForecastDates dates;

    /**
     * Creates the service that measures only from its own stored forecasts and the facts.
     *
     * @param forecasts stored forecast snapshots
     * @param actuals   observed values
     */
    public GetModelStatsService(ForecastRepository forecasts, ActualRepository actuals) {
        this(forecasts, actuals, null, null);
    }

    /**
     * Creates the service.
     *
     * @param forecasts stored forecast snapshots
     * @param actuals   observed values
     * @param ml        the ML service's own measurements, {@code null} when it is not connected
     * @param dates     what "today" is, needed to pick the recent days of the ML backtest
     */
    public GetModelStatsService(
            ForecastRepository forecasts, ActualRepository actuals, MlMetricsClient ml, ForecastDates dates) {
        this.forecasts = forecasts;
        this.actuals = actuals;
        this.ml = ml;
        this.dates = dates;
    }

    @Override
    public ModelStats get(int days) {
        if (days < 1 || days > MAX_DAYS) {
            throw new InvalidRequestException("'days' must be between 1 and " + MAX_DAYS);
        }
        if (ml != null && dates != null) {
            try {
                return fromBacktest(days);
            } catch (MlUnavailableException e) {
                LOG.warn("The ML service could not report its quality, measuring from the facts: {}", e.getMessage());
            }
        }
        return fromFacts(days);
    }

    private ModelStats fromBacktest(int days) {
        BacktestMetrics metrics = ml.backtest();
        LocalDate today = dates.today();
        List<BacktestDay> known = metrics.days().stream()
                .filter(day -> day.date().isBefore(today))
                .sorted(Comparator.comparing(BacktestDay::date))
                .toList();
        List<BacktestDay> window = known.subList(Math.max(0, known.size() - days), known.size());
        List<DailyAccuracy> history = new ArrayList<>();
        double error = 0;
        double actual = 0;
        for (BacktestDay day : window) {
            error += day.absoluteError();
            actual += day.actualSum();
            if (day.actualSum() > 0) {
                double wape = day.absoluteError() / day.actualSum();
                history.add(new DailyAccuracy(day.date(), wape, Wape.score(wape)));
            }
        }
        if (actual <= 0) {
            return new ModelStats(null, null, history, SOURCE_ML, metrics.note(), platform(metrics), platformNote(metrics));
        }
        double wape = error / actual;
        return new ModelStats(
                wape, Wape.score(wape), history, SOURCE_ML, metrics.note(), platform(metrics), platformNote(metrics));
    }

    private static Double platform(BacktestMetrics metrics) {
        return metrics.platformScore();
    }

    private static String platformNote(BacktestMetrics metrics) {
        return metrics.platformScore() == null ? null : PLATFORM_NOTE;
    }

    private ModelStats fromFacts(int days) {
        List<DailyAccuracy> history = new ArrayList<>();
        List<Double> allActual = new ArrayList<>();
        List<Double> allPredicted = new ArrayList<>();
        for (LocalDate date : forecasts.recentDates(Horizon.DAY, days)) {
            Map<String, Double> facts = factsByKey(actuals.find(Horizon.DAY, date));
            List<Double> actual = new ArrayList<>();
            List<Double> predicted = new ArrayList<>();
            for (StopForecast stop : forecasts.findInitial(Horizon.DAY, date)) {
                for (ForecastPoint point : stop.points()) {
                    Double fact = facts.get(key(stop, point));
                    if (fact != null) {
                        actual.add(fact);
                        predicted.add(point.forecast());
                    }
                }
            }
            OptionalDouble wape = Wape.wape(actual, predicted);
            if (wape.isPresent()) {
                history.add(new DailyAccuracy(date, wape.getAsDouble(), Wape.score(wape.getAsDouble())));
                allActual.addAll(actual);
                allPredicted.addAll(predicted);
            }
        }
        history.sort(Comparator.comparing(DailyAccuracy::date));
        OptionalDouble overall = Wape.wape(allActual, allPredicted);
        return new ModelStats(
                overall.isPresent() ? overall.getAsDouble() : null,
                overall.isPresent() ? Wape.score(overall.getAsDouble()) : null,
                history);
    }

    private static Map<String, Double> factsByKey(List<ActualValue> values) {
        Map<String, Double> map = new HashMap<>();
        for (ActualValue value : values) {
            map.put(value.routeId().value() + "|" + value.stopId().value() + "|" + value.periodStart(), value.value());
        }
        return map;
    }

    private static String key(StopForecast stop, ForecastPoint point) {
        return stop.routeId().value() + "|" + stop.stopId().value() + "|" + point.periodStart();
    }
}
