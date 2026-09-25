package ru.tramforecast.api.web;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.tramforecast.api.application.ExportForecastUseCase;
import ru.tramforecast.api.application.ForecastQuery;
import ru.tramforecast.api.application.InvalidRequestException;
import ru.tramforecast.api.domain.model.RouteId;
import ru.tramforecast.api.domain.model.StopForecast;
import ru.tramforecast.api.domain.model.StopId;

/**
 * Tabular export of forecast results.
 */
@RestController
@RequestMapping("/api")
public class ExportController {

    private static final MediaType CSV = new MediaType("text", "csv", StandardCharsets.UTF_8);

    private final ExportForecastUseCase export;
    private final CsvForecastWriter csv;

    /**
     * Creates the controller.
     *
     * @param export the export use case
     * @param csv    the CSV renderer
     */
    public ExportController(ExportForecastUseCase export, CsvForecastWriter csv) {
        this.export = export;
        this.csv = csv;
    }

    /**
     * Exports the forecast as CSV. Filters and correction coefficients work exactly as on the
     * interactive endpoints, so the file matches what is on screen.
     *
     * @param format  {@code csv} (default); {@code xlsx} is not supported yet
     * @param routeId optional route filter
     * @param stopId  optional stop filter
     * @param params  common query parameters (horizon, date, interval, correction)
     * @return the file as an attachment
     */
    @GetMapping("/export")
    public ResponseEntity<String> export(
            @RequestParam(defaultValue = "csv") String format,
            @RequestParam(required = false) String routeId,
            @RequestParam(required = false) String stopId,
            ForecastParams params) {
        if (!"csv".equalsIgnoreCase(format)) {
            throw new InvalidRequestException("Unsupported export format '" + format + "', only csv is available");
        }
        if (stopId != null && routeId == null) {
            throw new InvalidRequestException("'stopId' requires 'routeId'");
        }
        ForecastQuery query = params.toQuery();
        List<StopForecast> rows = export.export(
                query, routeId == null ? null : new RouteId(routeId), stopId == null ? null : new StopId(stopId));
        String name = "forecast-" + query.horizon().name().toLowerCase(Locale.ROOT) + "-" + rows.get(0).date() + ".csv";
        return ResponseEntity.ok()
                .contentType(CSV)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(name).build().toString())
                .body(csv.write(rows));
    }
}
