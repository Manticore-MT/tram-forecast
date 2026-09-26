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
        PreparedForecast prepared = preparer.prepare(query);
        List<StopForecast> rows = prepared.stops().stream()
                .filter(s -> routeId == null || s.routeId().equals(routeId))
                .filter(s -> stopId == null || s.stopId().equals(stopId))
                .toList();
        if (rows.isEmpty()) {
            if (routeId != null && stopId != null) {
                throw prepared.missing(routeId, stopId);
            }
            if (routeId != null && !prepared.knownRoutes().contains(routeId)) {
                throw NotFoundException.route(routeId, prepared.knownRoutes());
            }
            throw NotFoundException.noData("Nothing to export for the given filters");
        }
        return rows;
    }
}
