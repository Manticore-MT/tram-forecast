package ru.tramforecast.api.application;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.OptionalDouble;
import ru.tramforecast.api.domain.model.ActualValue;
import ru.tramforecast.api.domain.model.DailyAccuracy;
import ru.tramforecast.api.domain.model.ForecastPoint;
import ru.tramforecast.api.domain.model.Horizon;
import ru.tramforecast.api.domain.model.ModelStats;
import ru.tramforecast.api.domain.model.StopForecast;
import ru.tramforecast.api.domain.port.ActualRepository;
import ru.tramforecast.api.domain.port.ForecastRepository;
import ru.tramforecast.api.domain.service.Wape;

/**
 * Implements {@link GetModelStatsUseCase}. Accuracy is measured on the <em>initial</em> snapshot of
 * each day against the facts, never on the latest one: comparing a forecast that keeps updating
 * with the outcome would be a moving target. Reads storage only, it never triggers ML.
 */
public class GetModelStatsService implements GetModelStatsUseCase {

    private static final int MAX_DAYS = 90;

    private final ForecastRepository forecasts;
    private final ActualRepository actuals;

    /**
     * Creates the service.
     *
     * @param forecasts stored forecast snapshots
     * @param actuals   observed values
     */
    public GetModelStatsService(ForecastRepository forecasts, ActualRepository actuals) {
        this.forecasts = forecasts;
        this.actuals = actuals;
    }

    @Override
    public ModelStats get(int days) {
        if (days < 1 || days > MAX_DAYS) {
            throw new InvalidRequestException("'days' must be between 1 and " + MAX_DAYS);
        }
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
