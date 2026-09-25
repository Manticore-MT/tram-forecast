package ru.tramforecast.api.application;

/**
 * Use case: the ranked list of attention zones of the network.
 */
public interface GetAttentionZonesUseCase {

    /**
     * Computes the attention zones. The backend owns the threshold and the ranking; ML only
     * supplies the aggregates they are computed from.
     *
     * @param query horizon, date and other read parameters
     * @return the zones, largest deviation first
     */
    AttentionResult get(ForecastQuery query);
}
