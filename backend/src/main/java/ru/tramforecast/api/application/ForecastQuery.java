package ru.tramforecast.api.application;

import java.time.Instant;
import java.time.LocalDate;
import ru.tramforecast.api.domain.model.CorrectionCoefficients;
import ru.tramforecast.api.domain.model.Horizon;
import ru.tramforecast.api.domain.model.SnapshotKind;

/**
 * Parameters shared by every forecast read. Missing values get defaults: horizon day, latest
 * snapshot, no correction, today's date.
 *
 * @param horizon      planning horizon, defaults to {@link Horizon#DAY}
 * @param date         anchor date, {@code null} means today
 * @param snapshot     which stored snapshot to read, defaults to {@link SnapshotKind#LATEST}
 * @param coefficients correction multipliers, defaults to none
 * @param from         optional inclusive lower bound on returned periods
 * @param to           optional exclusive upper bound on returned periods
 */
public record ForecastQuery(
        Horizon horizon,
        LocalDate date,
        SnapshotKind snapshot,
        CorrectionCoefficients coefficients,
        Instant from,
        Instant to) {

    /**
     * Applies defaults and validates the interval.
     */
    public ForecastQuery {
        horizon = horizon == null ? Horizon.DAY : horizon;
        snapshot = snapshot == null ? SnapshotKind.LATEST : snapshot;
        coefficients = coefficients == null ? CorrectionCoefficients.NONE : coefficients;
        if (from != null && to != null && !from.isBefore(to)) {
            throw new InvalidRequestException("'from' must be earlier than 'to'");
        }
    }

    /**
     * Query for the given horizon and date with all other parameters at their defaults.
     *
     * @param horizon planning horizon
     * @param date    anchor date, may be {@code null}
     * @return the query
     */
    public static ForecastQuery of(Horizon horizon, LocalDate date) {
        return new ForecastQuery(horizon, date, null, null, null, null);
    }
}
