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
 * Starts the whole application with Postgres in a container and asks for a week over real HTTP: the
 * forecast is computed, stored as a snapshot and read back, so this covers the storage of the new
 * horizon as well as the API. Skipped automatically when Docker is not available.
 */
@Testcontainers(disabledWithoutDocker = true)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class WeekHorizonTest {

    private static final JsonMapper MAPPER = JsonMapper.builder().build();

    @Container
    @ServiceConnection
    private static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:17-alpine");

    @Autowired
    private Environment environment;

    private JsonNode get(String path) throws IOException, InterruptedException {
        HttpResponse<String> response = HttpClient.newHttpClient().send(
                HttpRequest.newBuilder(
                                URI.create("http://localhost:" + environment.getProperty("local.server.port") + path))
                        .build(),
                HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        assertThat(response.statusCode()).as(response.body()).isEqualTo(200);
        return MAPPER.readTree(response.body());
    }

    /**
     * A week is seven daily points that start at the requested date, not at the Monday before it, and
     * a second request is served from the stored snapshot with the same answer.
     *
     * @throws Exception when a request fails
     */
    @Test
    void weekStartsAtTheRequestedDateAndSurvivesTheDatabaseRoundTrip() throws Exception {
        // 2026-09-25 is a Friday
        String path = "/api/routes/R1/forecast?horizon=week&date=2026-09-25";

        JsonNode first = get(path);
        JsonNode second = get(path);

        assertThat(first.get("horizon").asString()).isEqualTo("week");
        assertThat(first.get("date").asString()).isEqualTo("2026-09-25");
        assertThat(first.get("points")).hasSize(7);
        assertThat(first.get("points").get(0).get("periodStart").asString()).isEqualTo("2026-09-25T00:00:00+03:00");
        assertThat(first.get("points").get(6).get("periodStart").asString()).isEqualTo("2026-10-01T00:00:00+03:00");
        assertThat(second.get("points")).isEqualTo(first.get("points"));
        assertThat(second.get("lastUpdated")).isEqualTo(first.get("lastUpdated"));
    }
}
