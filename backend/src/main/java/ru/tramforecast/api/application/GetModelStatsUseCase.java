package ru.tramforecast.api.application;

import ru.tramforecast.api.domain.model.ModelStats;

/**
 * Use case: forecast quality (WAPE) over recent days.
 */
public interface GetModelStatsUseCase {

    /**
     * Compares the initial snapshot of each recent day with the facts.
     *
     * @param days how many recent days to include, between 1 and 90
     * @return the accuracy overall and per day
     * @throws InvalidRequestException when {@code days} is out of range
     */
    ModelStats get(int days);
}
