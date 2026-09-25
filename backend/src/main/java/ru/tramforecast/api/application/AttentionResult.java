package ru.tramforecast.api.application;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import ru.tramforecast.api.domain.model.AttentionZone;
import ru.tramforecast.api.domain.model.Horizon;

/**
 * The ranked attention zones of the network.
 *
 * @param horizon     planning horizon
 * @param date        resolved anchor date
 * @param lastUpdated oldest generation time among the data the zones were computed from
 * @param zones       zones, largest deviation first
 */
public record AttentionResult(Horizon horizon, LocalDate date, Instant lastUpdated, List<AttentionZone> zones) {

    /**
     * Makes the zones immutable.
     */
    public AttentionResult {
        zones = List.copyOf(zones);
    }
}
