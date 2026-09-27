package ru.tramforecast.api.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springdoc.core.annotations.ParameterObject;
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
import ru.tramforecast.api.domain.model.RouteForecast;
import ru.tramforecast.api.domain.model.RouteId;

/**
 * Tabular export of forecast results.
 */
@RestController
@RequestMapping("/api")
public class ExportController {

    private static final MediaType CSV = new MediaType("text", "csv", StandardCharsets.UTF_8);
    private static final MediaType XLSX =
            MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    private final ExportForecastUseCase export;
    private final CsvForecastWriter csv;
    private final XlsxForecastWriter xlsx;

    /**
     * Creates the controller.
     *
     * @param export the export use case
     * @param csv    the CSV renderer
     * @param xlsx   the XLSX renderer
     */
    public ExportController(ExportForecastUseCase export, CsvForecastWriter csv, XlsxForecastWriter xlsx) {
        this.export = export;
        this.csv = csv;
        this.xlsx = xlsx;
    }

    /**
     * Exports the forecast as CSV or XLSX. Filters and correction coefficients work exactly as on
     * the interactive endpoints, so the file matches what is on screen.
     *
     * @param format  {@code csv} (default) or {@code xlsx}
     * @param routeId optional route filter
     * @param params  common query parameters (horizon, date, interval, correction)
     * @return the file as an attachment
     */
    @Operation(
            summary = "Export the forecast as CSV or XLSX (one row per route and period)",
            responses = @ApiResponse(
                    responseCode = "200",
                    description = "A CSV or XLSX attachment, header row first",
                    content = @Content(mediaType = "text/csv", schema = @Schema(type = "string"))))
    @GetMapping("/export")
    public ResponseEntity<?> export(
            @RequestParam(defaultValue = "csv") String format,
            @RequestParam(required = false) String routeId,
            @ParameterObject ForecastParams params) {
        ForecastQuery query = params.toQuery();
        List<RouteForecast> rows = export.export(query, routeId == null ? null : new RouteId(routeId));
        String horizon = query.horizon().name().toLowerCase(Locale.ROOT);
        String date = rows.get(0).date().toString();
        if ("xlsx".equalsIgnoreCase(format)) {
            String name = "forecast-" + horizon + "-" + date + ".xlsx";
            return ResponseEntity.ok()
                    .contentType(XLSX)
                    .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(name).build().toString())
                    .body(xlsx.write(rows));
        }
        if (!"csv".equalsIgnoreCase(format)) {
            throw new InvalidRequestException("Unsupported export format '" + format + "', use csv or xlsx");
        }
        String name = "forecast-" + horizon + "-" + date + ".csv";
        return ResponseEntity.ok()
                .contentType(CSV)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(name).build().toString())
                .body(csv.write(rows));
    }
}
