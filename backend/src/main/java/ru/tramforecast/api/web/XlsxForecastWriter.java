package ru.tramforecast.api.web;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import ru.tramforecast.api.domain.model.ForecastPoint;
import ru.tramforecast.api.domain.model.RouteForecast;

/**
 * Renders route forecasts as XLSX, one row per route and period — same columns as
 * {@link CsvForecastWriter}, so the two formats are interchangeable.
 */
public class XlsxForecastWriter {

    private static final String[] HEADER = {
        "route_id", "horizon", "date", "period_start", "baseline", "forecast", "actual",
        "deviation_abs", "deviation_pct", "generated_at", "model_version",
    };

    private final ZoneId zone;

    /**
     * Creates the writer.
     *
     * @param zone zone timestamps are rendered in
     */
    public XlsxForecastWriter(ZoneId zone) {
        this.zone = zone;
    }

    /**
     * Renders the forecasts.
     *
     * @param forecasts forecasts to export
     * @return the XLSX workbook, as bytes
     */
    public byte[] write(List<RouteForecast> forecasts) {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            XSSFSheet sheet = workbook.createSheet("forecast");
            writeHeader(sheet);
            int rowIndex = 1;
            for (RouteForecast forecast : forecasts) {
                for (ForecastPoint point : forecast.points()) {
                    writeRow(sheet, rowIndex++, forecast, point);
                }
            }
            for (int col = 0; col < HEADER.length; col++) {
                sheet.autoSizeColumn(col);
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private void writeHeader(XSSFSheet sheet) {
        Row row = sheet.createRow(0);
        for (int col = 0; col < HEADER.length; col++) {
            row.createCell(col).setCellValue(HEADER[col]);
        }
    }

    private void writeRow(XSSFSheet sheet, int rowIndex, RouteForecast forecast, ForecastPoint point) {
        Row row = sheet.createRow(rowIndex);
        int col = 0;
        row.createCell(col++).setCellValue(forecast.routeId().value());
        row.createCell(col++).setCellValue(ApiMapper.horizon(forecast.horizon()));
        row.createCell(col++).setCellValue(forecast.date().toString());
        row.createCell(col++).setCellValue(iso(point.periodStart().atZone(zone)));
        row.createCell(col++).setCellValue(point.baseline());
        row.createCell(col++).setCellValue(point.forecast());
        Cell actual = row.createCell(col++);
        if (point.actual() != null) {
            actual.setCellValue(point.actual());
        }
        row.createCell(col++).setCellValue(point.deviationAbs());
        Cell deviationPct = row.createCell(col++);
        if (point.deviationPct() != null) {
            deviationPct.setCellValue(point.deviationPct());
        }
        row.createCell(col++).setCellValue(iso(forecast.generatedAt().atZone(zone)));
        row.createCell(col).setCellValue(forecast.modelVersion());
    }

    private static String iso(java.time.ZonedDateTime time) {
        return DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(time.toOffsetDateTime());
    }
}
