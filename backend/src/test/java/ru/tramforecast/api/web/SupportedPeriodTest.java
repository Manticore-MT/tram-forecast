package ru.tramforecast.api.web;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.core.env.Environment;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/**
 * Starts the whole application as the stand runs it: the clock frozen on 1 November 2025 and the model's
 * range fixed to 2025-11-01 .. 2026-12-31 (Postgres in a container). Checks over real HTTP that the
 * metadata reports them and that a period outside the range is a 400 with its own code, not a
 * misleading "try again later". Skipped automatically when Docker is not available.
 */
@Testcontainers(disabledWithoutDocker = true)
@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
            "tram.clock.fixed-instant=2025-11-01T06:00:00Z",
            "tram.forecast.from=2025-11-01",
            "tram.forecast.to=2026-12-31"
        })
class SupportedPeriodTest {

    private static final JsonMapper MAPPER = JsonMapper.builder().build();

    @Container
    @ServiceConnection
    private static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:17-alpine");

    @Autowired
    private Environment environment;

    private HttpResponse<String> get(String path) throws IOException, InterruptedException {
        return HttpClient.newHttpClient().send(
                HttpRequest.newBuilder(
                                URI.create("http://localhost:" + environment.getProperty("local.server.port") + path))
                        .build(),
                HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
    }

    /**
     * The metadata shows the frozen "now" and the range, and the latest selectable date is the end of it.
     *
     * @throws Exception when a request fails
     */
    @Test
    void metaShowsTheFrozenDayAndTheRange() throws Exception {
        JsonNode meta = MAPPER.readTree(get("/api/meta").body());

        assertThat(meta.get("today").asString()).isEqualTo("2025-11-01");
        assertThat(meta.get("now").asString()).startsWith("2025-11-01T09:00");
        assertThat(meta.get("forecastFrom").asString()).isEqualTo("2025-11-01");
        assertThat(meta.get("forecastTo").asString()).isEqualTo("2026-12-31");
        assertThat(meta.get("latestDate").asString()).isEqualTo("2026-12-31");
    }

    /**
     * Periods that stick out of the range are refused with {@code PERIOD_NOT_SUPPORTED} and the range in
     * the message: a day before it, a week that ends after it, the whole of 2025 as a year.
     *
     * @throws Exception when a request fails
     */
    @Test
    void periodsOutsideTheRangeAreARefusalWithItsOwnCode() throws Exception {
        for (String path : new String[] {
            "/api/routes/R1/forecast?horizon=day&date=2025-10-15",
            "/api/routes/R1/forecast?horizon=week&date=2026-12-28",
            "/api/routes/R1/forecast?horizon=year&date=2025-12-01"
        }) {
            HttpResponse<String> response = get(path);

            assertThat(response.statusCode()).as(path).isEqualTo(400);
            assertThat(response.body()).as(path)
                    .contains("\"code\":\"PERIOD_NOT_SUPPORTED\"")
                    .contains("2025-11-01 .. 2026-12-31");
        }
    }

    /**
     * Inside the range everything works, and a request without a date is about the frozen day.
     *
     * @throws Exception when a request fails
     */
    @Test
    void periodsInsideTheRangeAreServed() throws Exception {
        HttpResponse<String> withoutDate = get("/api/routes/R1/forecast");
        HttpResponse<String> week = get("/api/routes/R1/forecast?horizon=week&date=2026-12-25");
        HttpResponse<String> year = get("/api/routes/R1/forecast?horizon=year&date=2026-06-15");

        assertThat(withoutDate.statusCode()).isEqualTo(200);
        assertThat(MAPPER.readTree(withoutDate.body()).get("date").asString()).isEqualTo("2025-11-01");
        assertThat(week.statusCode()).isEqualTo(200);
        assertThat(year.statusCode()).isEqualTo(200);
    }
}
