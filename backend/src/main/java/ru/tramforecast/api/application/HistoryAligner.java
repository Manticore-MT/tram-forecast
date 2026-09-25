package ru.tramforecast.api.application;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import ru.tramforecast.api.domain.model.ActualValue;
import ru.tramforecast.api.domain.model.Horizon;
import ru.tramforecast.api.domain.model.RouteId;
import ru.tramforecast.api.domain.model.StopId;
import ru.tramforecast.api.domain.port.ActualRepository;

/**
 * Builds the "was" side of the "was / will be" comparison: facts of the same period one year
 * earlier, shifted forward so they line up with the current periods on one axis.
 */
public class HistoryAligner {

    private final ActualRepository actuals;
    private final ZoneId zone;

    /**
     * Creates the aligner.
     *
     * @param actuals source of observed values
     * @param zone    zone used to shift periods by whole calendar years
     */
    public HistoryAligner(ActualRepository actuals, ZoneId zone) {
        this.actuals = actuals;
        this.zone = zone;
    }

    /**
     * Facts of one stop a year earlier.
     *
     * @param horizon planning horizon
     * @param date    current anchor date
     * @param routeId the route
     * @param stopId  the stop
     * @return aligned facts, ordered by period
     */
    public List<HistoryPoint> forStop(Horizon horizon, LocalDate date, RouteId routeId, StopId stopId) {
        return align(actuals.find(horizon, date.minusYears(1)).stream()
                .filter(a -> a.routeId().equals(routeId) && a.stopId().equals(stopId))
                .toList());
    }

    /**
     * Facts of a whole route (all stops summed) a year earlier.
     *
     * @param horizon planning horizon
     * @param date    current anchor date
     * @param routeId the route
     * @return aligned facts, ordered by period
     */
    public List<HistoryPoint> forRoute(Horizon horizon, LocalDate date, RouteId routeId) {
        return align(actuals.find(horizon, date.minusYears(1)).stream()
                .filter(a -> a.routeId().equals(routeId))
                .toList());
    }

    private List<HistoryPoint> align(List<ActualValue> values) {
        Map<Instant, Double> summed = new TreeMap<>();
        for (ActualValue value : values) {
            Instant shifted = value.periodStart().atZone(zone).plusYears(1).toInstant();
            summed.merge(shifted, value.value(), Double::sum);
        }
        return summed.entrySet().stream()
                .map(e -> new HistoryPoint(e.getKey(), e.getValue()))
                .sorted(Comparator.comparing(HistoryPoint::periodStart))
                .toList();
    }
}
