package ru.tramforecast.api.web;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import org.springframework.format.annotation.DateTimeFormat;
import ru.tramforecast.api.application.ForecastQuery;
import ru.tramforecast.api.application.InvalidRequestException;
import ru.tramforecast.api.domain.model.CorrectionCoefficients;
import ru.tramforecast.api.domain.model.Horizon;
import ru.tramforecast.api.domain.model.SnapshotKind;

/**
 * Query parameters shared by every forecast endpoint. All are optional.
 *
 * @param horizon  {@code day} (default), {@code month} or {@code year}
 * @param date     anchor date {@code YYYY-MM-DD}, default today
 * @param snapshot {@code latest} (default) or {@code initial}, the forecast as it was first made
 * @param weather  weather correction multiplier, default 1
 * @param event    event correction multiplier, default 1
 * @param season   season correction multiplier, default 1
 * @param from     inclusive lower bound of returned periods, ISO 8601 with offset
 * @param to       exclusive upper bound of returned periods, ISO 8601 with offset
 */
public record ForecastParams(
        Horizon horizon,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        SnapshotKind snapshot,
        Double weather,
        Double event,
        Double season,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to) {

    /**
     * Converts the parameters to an application query.
     *
     * @return the query
     * @throws InvalidRequestException when a coefficient is out of range or the interval is inverted
     */
    public ForecastQuery toQuery() {
        CorrectionCoefficients coefficients;
        try {
            coefficients = new CorrectionCoefficients(
                    weather == null ? 1.0 : weather,
                    event == null ? 1.0 : event,
                    season == null ? 1.0 : season);
        } catch (IllegalArgumentException e) {
            throw new InvalidRequestException(e.getMessage());
        }
        return new ForecastQuery(
                horizon,
                date,
                snapshot,
                coefficients,
                from == null ? null : from.toInstant(),
                to == null ? null : to.toInstant());
    }
}
