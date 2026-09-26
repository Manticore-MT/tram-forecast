package ru.tramforecast.api.domain.port;

import ru.tramforecast.api.domain.model.BacktestMetrics;

/**
 * Outbound port to the ML service for the quality of its model. The ML side owns the model and its
 * measurements (the backend has no facts to compute the quality itself); the backend only passes them on.
 */
public interface MlMetricsClient {

    /**
     * Asks ML for the quality of its model on the backtest block it keeps.
     *
     * @return the quality per day of the block
     * @throws MlUnavailableException when ML did not answer in time or answered with an error or nonsense
     */
    BacktestMetrics backtest();
}
