package ru.tramforecast.api.web;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import ru.tramforecast.api.domain.model.ForecastPoint;
import ru.tramforecast.api.domain.model.StopForecast;

/**
 * Renders stop forecasts as CSV, one row per stop and period. Timestamps use the API zone with an
 * explicit offset, numbers use a dot as the decimal separator.
 */
public class CsvForecastWriter {

    private static final String HEADER = "route_id,stop_id,horizon,date,period_start,baseline,forecast,actual,"
            + "deviation_abs,deviation_pct,generated_at,model_version";

    private final ZoneId zone;

    /**
     * Creates the writer.
     *
     * @param zone zone timestamps are rendered in
     */
    public CsvForecastWriter(ZoneId zone) {
        this.zone = zone;
    }

    /**
     * Renders the forecasts.
     *
     * @param forecasts forecasts to export
     * @return the CSV document, lines separated by {@code \n}
     */
    public String write(List<StopForecast> forecasts) {
        StringBuilder csv = new StringBuilder(HEADER).append('\n');
        for (StopForecast forecast : forecasts) {
            for (ForecastPoint point : forecast.points()) {
                csv.append(escape(forecast.routeId().value())).append(',')
                        .append(escape(forecast.stopId().value())).append(',')
                        .append(ApiMapper.horizon(forecast.horizon())).append(',')
                        .append(forecast.date()).append(',')
                        .append(iso(point.periodStart().atZone(zone))).append(',')
                        .append(point.baseline()).append(',')
                        .append(point.forecast()).append(',')
                        .append(point.actual() == null ? "" : point.actual()).append(',')
                        .append(point.deviationAbs()).append(',')
                        .append(point.deviationPct() == null ? "" : point.deviationPct()).append(',')
                        .append(iso(forecast.generatedAt().atZone(zone))).append(',')
                        .append(escape(forecast.modelVersion())).append('\n');
            }
        }
        return csv.toString();
    }

    private static String iso(java.time.ZonedDateTime time) {
        return DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(time.toOffsetDateTime());
    }

    private static String escape(String value) {
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
