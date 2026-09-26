package ru.tramforecast.api.web;

import java.time.LocalDate;
import io.swagger.v3.oas.annotations.media.Schema;
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
        @Schema(description = "Planning horizon. It fixes the step of the returned points: day = hourly, "
                + "week = daily (seven days starting at the anchor date), month = daily, year = monthly.",
                type = "string", allowableValues = {"day", "week", "month", "year"}, defaultValue = "day")
        Horizon horizon,
        @Schema(description = "Anchor date YYYY-MM-DD: the day itself; the first of the seven days of a week; or any "
                + "day inside the month or year. Defaults to today. The whole period must lie inside the range the "
                + "model covers (forecastFrom .. forecastTo in /api/meta, otherwise at most one year ahead).", example = "2026-09-25")
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @Schema(description = "Which stored snapshot to read: the latest one, or the initial one (the forecast "
                + "as it was first made for that date).",
                type = "string", allowableValues = {"latest", "initial"}, defaultValue = "latest")
        SnapshotKind snapshot,
        @Schema(description = "Weather correction multiplier applied to the forecast.",
                minimum = "0.1", maximum = "3.0", defaultValue = "1.0")
        Double weather,
        @Schema(description = "Event correction multiplier applied to the forecast.",
                minimum = "0.1", maximum = "3.0", defaultValue = "1.0")
        Double event,
        @Schema(description = "Season correction multiplier applied to the forecast.",
                minimum = "0.1", maximum = "3.0", defaultValue = "1.0")
        Double season,
        @Schema(description = "Inclusive lower bound of the returned periods, ISO 8601 with offset.",
                example = "2026-09-25T06:00:00+03:00")
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
        @Schema(description = "Exclusive upper bound of the returned periods, ISO 8601 with offset.",
                example = "2026-09-25T12:00:00+03:00")
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
