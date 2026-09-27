package ru.tramforecast.api.application;

import ru.tramforecast.api.domain.model.ModelStats;

/**
 * Use case: forecast quality (WAPE) over recent days.
 */
public interface GetModelStatsUseCase {

    /**
     * Reports the quality of the forecasts over recent days: as measured by the ML service on its
     * backtest when it can be asked, otherwise by comparing the initial snapshot of each day with the
     * facts.
     *
     * @param days how many recent days to include, between 1 and 90
     * @return the accuracy overall and per day
     * @throws InvalidRequestException when {@code days} is out of range
     */
    ModelStats get(int days);
}
