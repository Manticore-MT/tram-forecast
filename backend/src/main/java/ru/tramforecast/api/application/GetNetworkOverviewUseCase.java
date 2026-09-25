package ru.tramforecast.api.application;

/**
 * Use case: the forecast of every route, for the network map.
 */
public interface GetNetworkOverviewUseCase {

    /**
     * Returns the per-route series of the whole network.
     *
     * @param query horizon, date and other read parameters
     * @return the overview
     */
    NetworkOverview get(ForecastQuery query);
}
