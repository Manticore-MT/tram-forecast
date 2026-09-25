package ru.tramforecast.api.application;

import ru.tramforecast.api.domain.model.LoadMatrix;
import ru.tramforecast.api.domain.model.RouteId;
import ru.tramforecast.api.domain.port.ActualRepository;

/**
 * Implements {@link GetLoadMatrixUseCase}.
 */
public class GetLoadMatrixService implements GetLoadMatrixUseCase {

    private final ActualRepository actuals;

    /**
     * Creates the service.
     *
     * @param actuals source of observed values
     */
    public GetLoadMatrixService(ActualRepository actuals) {
        this.actuals = actuals;
    }

    @Override
    public LoadMatrix get(RouteId routeId) {
        LoadMatrix matrix = actuals.loadMatrix(routeId);
        if (matrix.cells().isEmpty()) {
            throw new NotFoundException("No history to build a load matrix for route '" + routeId.value() + "'");
        }
        return matrix;
    }
}
