package ru.tramforecast.api.application;

import java.util.List;
import ru.tramforecast.api.domain.model.RouteForecast;
import ru.tramforecast.api.domain.model.RouteId;

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
    public List<RouteForecast> export(ForecastQuery query, RouteId routeId) {
        PreparedForecast prepared = preparer.prepare(query);
        List<RouteForecast> rows = prepared.routes().stream()
                .filter(r -> routeId == null || r.routeId().equals(routeId))
                .toList();
        if (rows.isEmpty()) {
            if (routeId != null && !prepared.knownRoutes().contains(routeId)) {
                throw NotFoundException.route(routeId, prepared.knownRoutes());
            }
            throw NotFoundException.noData("Nothing to export for the given filters");
        }
        return rows;
    }
}
