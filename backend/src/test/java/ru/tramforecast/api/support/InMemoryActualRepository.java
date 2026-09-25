package ru.tramforecast.api.support;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import ru.tramforecast.api.domain.model.ActualValue;
import ru.tramforecast.api.domain.model.Horizon;
import ru.tramforecast.api.domain.model.LoadMatrix;
import ru.tramforecast.api.domain.model.RouteId;
import ru.tramforecast.api.domain.port.ActualRepository;
import ru.tramforecast.api.domain.service.ForecastPeriod;

/**
 * In-memory stand-in for the facts storage. Values are assumed to be already at the granularity
 * the test asks for, so only the period filter is applied.
 */
public class InMemoryActualRepository implements ActualRepository {

    private final ZoneId zone;
    private final List<ActualValue> values = new ArrayList<>();

    /**
     * Creates the repository.
     *
     * @param zone zone that defines where days, months and years begin
     */
    public InMemoryActualRepository(ZoneId zone) {
        this.zone = zone;
    }

    /**
     * Adds an observed value.
     *
     * @param value the value
     */
    public void add(ActualValue value) {
        values.add(value);
    }

    @Override
    public List<ActualValue> find(Horizon horizon, LocalDate date) {
        ForecastPeriod period = ForecastPeriod.of(horizon, date, zone);
        return values.stream().filter(v -> period.contains(v.periodStart())).toList();
    }

    @Override
    public LoadMatrix loadMatrix(RouteId routeId) {
        return new LoadMatrix(routeId, List.of());
    }
}
