package ru.tramforecast.api.application;

import ru.tramforecast.api.domain.model.Horizon;
import java.time.LocalDate;

/**
 * Use case: recompute a forecast and store it as a new snapshot (used by the optional scheduler
 * to keep today's forecasts warm).
 */
public interface RefreshForecastUseCase {

    /**
     * Asks ML for a fresh forecast and appends it. Never throws for an ML outage: the previously
     * stored snapshot stays the latest one.
     *
     * @param horizon planning horizon
     * @param date    anchor date
     * @return {@code true} when a new snapshot was stored, {@code false} when the run was skipped
     *         (another refresh still running) or ML failed
     */
    boolean refresh(Horizon horizon, LocalDate date);
}
