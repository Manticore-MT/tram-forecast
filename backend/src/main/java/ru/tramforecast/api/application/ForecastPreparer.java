package ru.tramforecast.api.application;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import ru.tramforecast.api.domain.model.ActualValue;
import ru.tramforecast.api.domain.model.CorrectionCoefficients;
import ru.tramforecast.api.domain.model.ForecastPoint;
import ru.tramforecast.api.domain.model.StopForecast;
import ru.tramforecast.api.domain.port.ActualRepository;

/**
 * Common preparation of every forecast read: resolve the date, load (with the ML fallback), fill
 * in the facts, apply the dispatcher's correction coefficients and cut to the requested interval.
 */
public class ForecastPreparer {

    private final ForecastLoader loader;
    private final ActualRepository actuals;
    private final ForecastDates dates;

    /**
     * Creates the preparer.
     *
     * @param loader  loads forecasts, asking ML on a storage miss
     * @param actuals source of observed values
     * @param dates   date resolution and validation
     */
    public ForecastPreparer(ForecastLoader loader, ActualRepository actuals, ForecastDates dates) {
        this.loader = loader;
        this.actuals = actuals;
        this.dates = dates;
    }

    /**
     * Prepares the forecasts a query asks for.
     *
     * @param query the query
     * @return the prepared forecasts of the whole network
     */
    public PreparedForecast prepare(ForecastQuery query) {
        LocalDate date = dates.resolve(query.date());
        List<StopForecast> loaded = loader.load(query.horizon(), date, query.snapshot());
        Map<String, Double> facts = factsByKey(actuals.find(query.horizon(), date));
        double factor = query.coefficients().factor();
        List<StopForecast> prepared = loaded.stream()
                .map(stop -> stop.withPoints(stop.points().stream()
                        .map(point -> adjust(stop, point, facts, query.coefficients(), factor))
                        .filter(point -> inInterval(point, query))
                        .toList()))
                .toList();
        return new PreparedForecast(date, prepared);
    }

    private static ForecastPoint adjust(
            StopForecast stop,
            ForecastPoint point,
            Map<String, Double> facts,
            CorrectionCoefficients coefficients,
            double factor) {
        ForecastPoint withFact = point.withActual(facts.get(key(stop, point)));
        return coefficients.isIdentity() ? withFact : withFact.withForecast(withFact.forecast() * factor);
    }

    private static boolean inInterval(ForecastPoint point, ForecastQuery query) {
        boolean afterFrom = query.from() == null || !point.periodStart().isBefore(query.from());
        boolean beforeTo = query.to() == null || point.periodStart().isBefore(query.to());
        return afterFrom && beforeTo;
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
