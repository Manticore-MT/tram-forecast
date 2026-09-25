package ru.tramforecast.api.application;

import java.util.List;
import ru.tramforecast.api.domain.model.RouteId;
import ru.tramforecast.api.domain.model.StopForecast;
import ru.tramforecast.api.domain.model.StopId;

/**
 * Implements {@link ExportForecastUseCase}.
 */
public class ExportForecastService implements ExportForecastUseCase {

    private final ForecastPreparer preparer;

    /**
     * Creates the service.
     *
     * @param preparer prepares forecasts for a query
     */
    public ExportForecastService(ForecastPreparer preparer) {
        this.preparer = preparer;
    }

    @Override
    public List<StopForecast> export(ForecastQuery query, RouteId routeId, StopId stopId) {
        List<StopForecast> rows = preparer.prepare(query).stops().stream()
                .filter(s -> routeId == null || s.routeId().equals(routeId))
                .filter(s -> stopId == null || s.stopId().equals(stopId))
                .toList();
        if (rows.isEmpty()) {
            throw new NotFoundException("Nothing to export for the given route and stop");
        }
        return rows;
    }
}
