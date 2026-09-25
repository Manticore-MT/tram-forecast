package ru.tramforecast.api.domain.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
import ru.tramforecast.api.domain.model.ForecastPoint;
import ru.tramforecast.api.domain.model.RouteForecast;
import ru.tramforecast.api.domain.model.RouteId;
import ru.tramforecast.api.domain.model.StopForecast;

/**
 * Sums stop forecasts into route forecasts (route and network level views).
 */
public final class ForecastAggregator {

    private ForecastAggregator() {
    }

    /**
     * Groups stop forecasts by route and sums baseline, forecast and actual per period.
     *
     * @param stops stop forecasts of one horizon and date
     * @return one forecast per route, ordered by route id
     */
    public static List<RouteForecast> byRoute(List<StopForecast> stops) {
        Map<RouteId, List<StopForecast>> grouped =
                stops.stream().collect(Collectors.groupingBy(StopForecast::routeId));
        List<RouteForecast> result = new ArrayList<>();
        for (Map.Entry<RouteId, List<StopForecast>> entry : grouped.entrySet()) {
            result.add(sum(entry.getKey(), entry.getValue()));
        }
        result.sort(Comparator.comparing(r -> r.routeId().value()));
        return result;
    }

    private static RouteForecast sum(RouteId routeId, List<StopForecast> stops) {
        Map<Instant, double[]> sums = new TreeMap<>();
        Map<Instant, Boolean> hasActual = new TreeMap<>();
        for (StopForecast stop : stops) {
            for (ForecastPoint point : stop.points()) {
                double[] acc = sums.computeIfAbsent(point.periodStart(), k -> new double[3]);
                acc[0] += point.baseline();
                acc[1] += point.forecast();
                if (point.actual() != null) {
                    acc[2] += point.actual();
                    hasActual.put(point.periodStart(), true);
                }
            }
        }
        List<ForecastPoint> points = new ArrayList<>();
        sums.forEach((start, acc) ->
                points.add(new ForecastPoint(start, acc[0], acc[1], hasActual.containsKey(start) ? acc[2] : null)));
        StopForecast first = stops.get(0);
        Instant oldest = stops.stream().map(StopForecast::generatedAt).min(Comparator.naturalOrder()).orElseThrow();
        return new RouteForecast(routeId, first.horizon(), first.date(), oldest, points);
    }
}
