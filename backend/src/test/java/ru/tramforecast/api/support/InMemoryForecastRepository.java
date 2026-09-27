package ru.tramforecast.api.support;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import ru.tramforecast.api.domain.model.Horizon;
import ru.tramforecast.api.domain.model.RouteForecast;
import ru.tramforecast.api.domain.port.ForecastRepository;

/**
 * Append-only in-memory stand-in for the forecast storage, with the same snapshot semantics as the
 * Postgres adapter: latest is the newest {@code generatedAt}, initial the oldest.
 */
public class InMemoryForecastRepository implements ForecastRepository {

    private final List<RouteForecast> rows = new ArrayList<>();

    @Override
    public List<RouteForecast> findLatest(Horizon horizon, LocalDate date) {
        return pick(horizon, date, true);
    }

    @Override
    public List<RouteForecast> findInitial(Horizon horizon, LocalDate date) {
        return pick(horizon, date, false);
    }

    @Override
    public void saveAll(List<RouteForecast> forecasts) {
        rows.addAll(forecasts);
    }

    @Override
    public List<LocalDate> recentDates(Horizon horizon, int limit) {
        return rows.stream()
                .filter(r -> r.horizon() == horizon)
                .map(RouteForecast::date)
                .distinct()
                .sorted(Comparator.reverseOrder())
                .limit(limit)
                .toList();
    }

    /**
     * Number of stored stop forecasts.
     *
     * @return the row count
     */
    public int size() {
        return rows.size();
    }

    private List<RouteForecast> pick(Horizon horizon, LocalDate date, boolean latest) {
        List<RouteForecast> candidates = rows.stream()
                .filter(r -> r.horizon() == horizon && r.date().equals(date))
                .toList();
        if (candidates.isEmpty()) {
            return List.of();
        }
        Comparator<Instant> order = Comparator.naturalOrder();
        Instant chosen = candidates.stream()
                .map(RouteForecast::generatedAt)
                .reduce((a, b) -> (order.compare(a, b) >= 0) == latest ? a : b)
                .orElseThrow();
        return candidates.stream().filter(r -> r.generatedAt().equals(chosen)).toList();
    }
}
