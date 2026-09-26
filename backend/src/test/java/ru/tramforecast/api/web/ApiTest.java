package ru.tramforecast.api.web;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.matchesPattern;
import static org.hamcrest.Matchers.nullValue;
import static org.hamcrest.Matchers.startsWith;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.format.support.DefaultFormattingConversionService;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import ru.tramforecast.api.application.ExportForecastService;
import ru.tramforecast.api.application.ForecastDates;
import ru.tramforecast.api.application.ForecastLoader;
import ru.tramforecast.api.application.ForecastPreparer;
import ru.tramforecast.api.application.GetAttentionZonesService;
import ru.tramforecast.api.application.GetLoadMatrixService;
import ru.tramforecast.api.application.GetModelStatsService;
import ru.tramforecast.api.application.GetNetworkOverviewService;
import ru.tramforecast.api.application.GetRouteForecastService;
import ru.tramforecast.api.application.GetStopForecastService;
import ru.tramforecast.api.application.HistoryAligner;
import ru.tramforecast.api.domain.port.MlForecastClient;
import ru.tramforecast.api.domain.port.MlUnavailableException;
import ru.tramforecast.api.domain.service.AttentionPolicy;
import ru.tramforecast.api.domain.service.AttentionZoneCalculator;
import ru.tramforecast.api.domain.service.RecommendationPolicy;
import ru.tramforecast.api.infrastructure.ml.StubMlForecastClient;
import ru.tramforecast.api.support.InMemoryActualRepository;
import ru.tramforecast.api.support.InMemoryForecastRepository;

/**
 * HTTP-level tests through MockMvc on the real controllers, use cases and the synthetic ML client,
 * with in-memory storage. They pin the API contract the frontend relies on: paths, parameters,
 * ISO timestamps with an offset, error messages and the CSV export.
 */
class ApiTest {

    private static final ZoneId MOSCOW = ZoneId.of("Europe/Moscow");
    private static final String ISO_WITH_OFFSET = "\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?[+-]\\d{2}:\\d{2}";
    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-09-25T09:00:00Z"), ZoneId.of("UTC"));

    private MockMvc mvc;

    /**
     * Builds the controllers on top of in-memory storage and the stub ML client.
     */
    @BeforeEach
    void setUp() {
        buildWith(new StubMlForecastClient(2, 3, CLOCK, MOSCOW));
    }

    private void buildWith(MlForecastClient ml) {
        buildWith(ml, null, null);
    }

    private void buildWith(MlForecastClient ml, LocalDate from, LocalDate to) {
        ForecastDates dates = new ForecastDates(CLOCK, MOSCOW, 1, from, to);
        InMemoryForecastRepository forecasts = new InMemoryForecastRepository();
        InMemoryActualRepository actuals = new InMemoryActualRepository(MOSCOW);
        ForecastPreparer preparer = new ForecastPreparer(new ForecastLoader(forecasts, ml), actuals, dates);
        AttentionPolicy attention = new AttentionPolicy(10, 25);
        RecommendationPolicy recommendation = new RecommendationPolicy(10);
        HistoryAligner history = new HistoryAligner(actuals, MOSCOW);
        ApiMapper mapper = new ApiMapper(MOSCOW);
        DefaultFormattingConversionService conversion = new DefaultFormattingConversionService();
        conversion.addConverter(String.class, ru.tramforecast.api.domain.model.Horizon.class, WebConfig.horizonConverter());
        conversion.addConverter(
                String.class, ru.tramforecast.api.domain.model.SnapshotKind.class, WebConfig.snapshotConverter());
        mvc = MockMvcBuilders.standaloneSetup(
                        new ForecastController(
                                new GetNetworkOverviewService(preparer),
                                new GetRouteForecastService(preparer, history),
                                new GetStopForecastService(preparer, history, attention, recommendation),
                                new GetAttentionZonesService(preparer, new AttentionZoneCalculator(attention, recommendation)),
                                new GetLoadMatrixService(actuals),
                                mapper),
                        new ExportController(new ExportForecastService(preparer), new CsvForecastWriter(MOSCOW)),
                        new ModelController(new GetModelStatsService(forecasts, actuals), mapper),
                        new MetaController(
                                new ru.tramforecast.api.application.GetMetaService(CLOCK, dates, MOSCOW, "stub"),
                                mapper))
                .setControllerAdvice(new GlobalExceptionHandler(MOSCOW))
                .setConversionService(conversion)
                .build();
    }

    /**
     * The network overview returns one series per route, hourly for a day, times with an offset.
     */
    @org.junit.jupiter.api.Test
    void networkOverviewReturnsHourlySeriesWithOffsets() throws Exception {
        mvc.perform(get("/api/routes").param("horizon", "day").param("date", "2026-09-25"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.horizon").value("day"))
                .andExpect(jsonPath("$.date").value("2026-09-25"))
                .andExpect(jsonPath("$.routes", hasSize(2)))
                .andExpect(jsonPath("$.routes[0].points", hasSize(24)))
                .andExpect(jsonPath("$.routes[0].points[0].periodStart").value("2026-09-25T00:00:00+03:00"))
                .andExpect(jsonPath("$.lastUpdated").value("2026-09-25T12:00:00+03:00"));
    }

    /**
     * Steps follow the horizon: a month is daily, a year is monthly. Omitted parameters default.
     */
    @Test
    void stepsFollowTheHorizonAndParametersDefault() throws Exception {
        mvc.perform(get("/api/routes/R1/forecast").param("horizon", "month"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.points", hasSize(30)))
                .andExpect(jsonPath("$.stops", hasSize(3)));
        mvc.perform(get("/api/routes/R1/forecast").param("horizon", "YEAR"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.points", hasSize(12)));
        mvc.perform(get("/api/routes/R1/forecast"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.horizon").value("day"))
                .andExpect(jsonPath("$.date").value("2026-09-25"));
    }

    /**
     * Stop details carry the baseline, deviation, status and factors.
     */
    @Test
    void stopDetailsCarryDeviationStatusAndFactors() throws Exception {
        mvc.perform(get("/api/routes/R1/stops/R1-S1/forecast").param("horizon", "day"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stopId").value("R1-S1"))
                .andExpect(jsonPath("$.points", hasSize(24)))
                .andExpect(jsonPath("$.points[0].deviationAbs").isNumber())
                .andExpect(jsonPath("$.status").isString())
                .andExpect(jsonPath("$.peakAt").value(startsWith("2026-09-25T")))
                .andExpect(jsonPath("$.factors[0]").value("working day"))
                .andExpect(jsonPath("$.modelVersion").value("stub"));
    }

    /**
     * Correction coefficients change the forecast immediately and are validated.
     */
    @Test
    void correctionCoefficientsChangeTheForecast() throws Exception {
        String plain = mvc.perform(get("/api/routes/R1/stops/R1-S1/forecast"))
                .andReturn().getResponse().getContentAsString();
        String corrected = mvc.perform(get("/api/routes/R1/stops/R1-S1/forecast").param("event", "1.5"))
                .andReturn().getResponse().getContentAsString();
        org.assertj.core.api.Assertions.assertThat(corrected).isNotEqualTo(plain);

        mvc.perform(get("/api/routes/R1/stops/R1-S1/forecast").param("weather", "9"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value(containsString("between")));
    }

    /**
     * Attention zones are ranked by deviation and carry a recommendation.
     */
    @Test
    void attentionEndpointRanksZones() throws Exception {
        mvc.perform(get("/api/attention").param("horizon", "day"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.zones").isArray())
                .andExpect(jsonPath("$.zones[0].recommendation.action").isString());
    }

    /**
     * CSV export is an attachment with a header row and one row per stop and period.
     */
    @Test
    void csvExportIsAnAttachmentWithOneRowPerPeriod() throws Exception {
        mvc.perform(get("/api/export").param("horizon", "day").param("routeId", "R1").param("stopId", "R1-S1"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", containsString("forecast-day-2026-09-25.csv")))
                .andExpect(content().contentTypeCompatibleWith("text/csv"))
                .andExpect(content().string(startsWith("route_id,stop_id,horizon,date,period_start,baseline")))
                .andExpect(content().string(containsString("R1,R1-S1,day,2026-09-25,2026-09-25T00:00:00+03:00")));
        mvc.perform(get("/api/export").param("format", "xlsx"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value(containsString("only csv")));
    }

    /**
     * Metadata tells the frontend the current moment, the selectable range and the data source.
     */
    @Test
    void metaDescribesRangeAndDataSource() throws Exception {
        mvc.perform(get("/api/meta"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.now").value("2026-09-25T12:00:00+03:00"))
                .andExpect(jsonPath("$.today").value("2026-09-25"))
                .andExpect(jsonPath("$.latestDate").value("2027-09-25"))
                .andExpect(jsonPath("$.zone").value("Europe/Moscow"))
                .andExpect(jsonPath("$.dataSource").value("stub"))
                .andExpect(jsonPath("$.horizons", hasSize(4)))
                .andExpect(jsonPath("$.horizons[1].horizon").value("week"))
                .andExpect(jsonPath("$.horizons[1].step").value("day"))
                .andExpect(jsonPath("$.horizons[2].horizon").value("month"))
                .andExpect(jsonPath("$.horizons[2].step").value("day"));
    }

    /**
     * A week is seven daily points starting at the requested date (not at the start of a calendar
     * week), and the date in the answer is that first day.
     */
    @Test
    void weekIsSevenDailyPointsStartingAtTheDate() throws Exception {
        mvc.perform(get("/api/routes/R1/forecast").param("horizon", "week").param("date", "2026-09-25"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.horizon").value("week"))
                .andExpect(jsonPath("$.date").value("2026-09-25"))
                .andExpect(jsonPath("$.points", hasSize(7)))
                .andExpect(jsonPath("$.points[0].periodStart").value("2026-09-25T00:00:00+03:00"))
                .andExpect(jsonPath("$.points[6].periodStart").value("2026-10-01T00:00:00+03:00"));
        mvc.perform(get("/api/routes").param("horizon", "week").param("date", "2026-09-25"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.routes[0].points", hasSize(7)));
    }

    /**
     * A period that is not entirely inside the model's range is a 400 with its own code and the range in
     * the message (not a misleading "try again later"): a day before the range, a week or a month that
     * sticks out of it. Periods inside are served.
     */
    @Test
    void periodOutsideTheModelRangeIsA400WithItsOwnCode() throws Exception {
        buildWith(new StubMlForecastClient(2, 3, CLOCK, MOSCOW), LocalDate.of(2026, 9, 1), LocalDate.of(2026, 12, 31));

        mvc.perform(get("/api/routes/R1/forecast").param("date", "2026-08-15"))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
                .andExpect(jsonPath("$.code").value("PERIOD_NOT_SUPPORTED"))
                .andExpect(jsonPath("$.title").value("Period not supported"))
                .andExpect(jsonPath("$.detail").value(containsString("2026-09-01 .. 2026-12-31")))
                .andExpect(jsonPath("$.detail").value(containsString("day covers 2026-08-15 .. 2026-08-15")));
        mvc.perform(get("/api/routes").param("horizon", "week").param("date", "2026-12-28"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("PERIOD_NOT_SUPPORTED"));
        mvc.perform(get("/api/routes").param("horizon", "month").param("date", "2026-08-20"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("PERIOD_NOT_SUPPORTED"));

        mvc.perform(get("/api/routes/R1/forecast").param("date", "2026-09-25")).andExpect(status().isOk());
        mvc.perform(get("/api/routes").param("horizon", "week").param("date", "2026-12-25"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.routes[0].points", hasSize(7)));
    }

    /**
     * The metadata reports the model's range so a client can limit the date picker; without a fixed
     * range the fields are empty and the latest date is "today plus a year".
     */
    @Test
    void metaReportsTheModelRangeOrNone() throws Exception {
        buildWith(new StubMlForecastClient(2, 3, CLOCK, MOSCOW), LocalDate.of(2026, 9, 1), LocalDate.of(2026, 12, 31));
        mvc.perform(get("/api/meta"))
                .andExpect(jsonPath("$.forecastFrom").value("2026-09-01"))
                .andExpect(jsonPath("$.forecastTo").value("2026-12-31"))
                .andExpect(jsonPath("$.latestDate").value("2026-12-31"));

        buildWith(new StubMlForecastClient(2, 3, CLOCK, MOSCOW));
        mvc.perform(get("/api/meta"))
                .andExpect(jsonPath("$.forecastFrom").value(nullValue()))
                .andExpect(jsonPath("$.forecastTo").value(nullValue()))
                .andExpect(jsonPath("$.latestDate").value("2027-09-25"));
    }

    /**
     * The quality endpoint says where the numbers come from; without the ML service and without facts
     * it has nothing to compare, so there are no values (not zeros) and the source is the facts.
     */
    @Test
    void modelStatsSaysWhereTheNumbersComeFrom() throws Exception {
        mvc.perform(get("/api/model/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.source").value("facts"))
                .andExpect(jsonPath("$.note").value(nullValue()))
                .andExpect(jsonPath("$.platformScore").value(nullValue()))
                .andExpect(jsonPath("$.wape").value(nullValue()))
                .andExpect(jsonPath("$.history", hasSize(0)));
    }

    /**
     * Bad input yields a 400 with a readable message, an unknown route a 404.
     */
    @Test
    void errorsAreReadable() throws Exception {
        mvc.perform(get("/api/routes").param("horizon", "decade"))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
                .andExpect(jsonPath("$.code").value("INVALID_PARAMETER"))
                .andExpect(jsonPath("$.timestamp").value(matchesPattern(ISO_WITH_OFFSET)))
                .andExpect(jsonPath("$.detail").value(containsString("horizon = day|week|month|year")));
        mvc.perform(get("/api/routes").param("date", "2030-01-01"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
                .andExpect(jsonPath("$.detail").value(containsString("at most 1 year")));
        mvc.perform(get("/api/routes/NOPE/forecast"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Route not found"))
                .andExpect(jsonPath("$.code").value("ROUTE_NOT_FOUND"))
                .andExpect(jsonPath("$.detail").value(containsString("There is no route 'NOPE'. Known routes: R1, R2")))
                .andExpect(jsonPath("$.instance").value("/api/routes/NOPE/forecast"));
    }

    /**
     * An unknown stop on a known route, an unknown route on a stop request and a route without
     * history each get their own code, so the client can say what exactly is missing.
     */
    @Test
    void notFoundIsSpecificAboutWhatIsMissing() throws Exception {
        mvc.perform(get("/api/routes/R1/stops/nope/forecast"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("STOP_NOT_FOUND"))
                .andExpect(jsonPath("$.detail").value("Route 'R1' has no stop 'nope'"));
        mvc.perform(get("/api/routes/NOPE/stops/ALL/forecast"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("ROUTE_NOT_FOUND"));
        mvc.perform(get("/api/routes/R1/load-matrix"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NO_DATA"))
                .andExpect(jsonPath("$.detail").value(containsString("No history is stored for route 'R1'")));
        mvc.perform(get("/api/export").param("routeId", "NOPE"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("ROUTE_NOT_FOUND"));
        mvc.perform(get("/api/export").param("routeId", "R1").param("stopId", "nope"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("STOP_NOT_FOUND"));
    }

    /**
     * A URL that is not an endpoint is a 404 with its own code, and a wrong HTTP method is a 405,
     * so the client never has to guess from a generic 500.
     */
    @Test
    void unknownEndpointAndWrongMethodHaveTheirOwnCodes() throws Exception {
        mvc.perform(get("/api/no-such-endpoint"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
                .andExpect(jsonPath("$.code").value("ENDPOINT_NOT_FOUND"));
        mvc.perform(post("/api/meta"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.code").value("METHOD_NOT_ALLOWED"))
                .andExpect(jsonPath("$.detail").value(containsString("POST")));
    }

    /**
     * An unexpected failure is reported as a generic 500 that leaks nothing internal.
     */
    @Test
    void unexpectedFailureLeaksNothingInternal() {
        var problem = new GlobalExceptionHandler(MOSCOW).unexpected(new IllegalStateException("db password is hunter2"));

        assertThat(problem.getStatus()).isEqualTo(500);
        assertThat(problem.getProperties()).containsEntry("code", "INTERNAL_ERROR");
        assertThat(String.valueOf(problem.getDetail())).doesNotContain("hunter2");
    }

    /**
     * With ML down and nothing stored the API answers 503 with a retry-friendly message.
     */
    @Test
    void mlOutageWithEmptyStorageIsA503() throws Exception {
        buildWith((horizon, date) -> {
            throw new MlUnavailableException("down", null);
        });
        mvc.perform(get("/api/routes"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("FORECAST_NOT_READY"))
                .andExpect(jsonPath("$.detail").value(containsString("try again later")));
    }
}
