package ru.tramforecast.api.web;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
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
 * Keeps the committed API contract honest. It starts the whole application (with Postgres in a
 * container), downloads the generated OpenAPI document and requires it to equal
 * {@code docs/openapi.json}. When an endpoint or a field changes, this test fails until the file is
 * regenerated:
 *
 * <pre>./mvnw test -Dtest=OpenApiSpecTest -Dopenapi.update=true</pre>
 *
 * <p>Skipped automatically when Docker is not available.
 */
@Testcontainers(disabledWithoutDocker = true)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class OpenApiSpecTest {

    private static final Path COMMITTED = Path.of("..", "docs", "openapi.json");
    private static final JsonMapper MAPPER = JsonMapper.builder().build();

    @Container
    @ServiceConnection
    private static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:17-alpine");

    @Autowired
    private Environment environment;

    /**
     * The generated document must equal the committed one (or rewrite it on request).
     *
     * @throws IOException          when the file or the endpoint cannot be read
     * @throws InterruptedException when the request is interrupted
     */
    @Test
    void generatedContractEqualsTheCommittedFile() throws IOException, InterruptedException {
        String port = environment.getProperty("local.server.port");
        HttpResponse<String> response = HttpClient.newHttpClient().send(
                HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/v3/api-docs")).build(),
                HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        assertThat(response.statusCode()).isEqualTo(200);
        JsonNode generated = MAPPER.readTree(response.body());

        if (Boolean.getBoolean("openapi.update")) {
            Files.writeString(COMMITTED, MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(generated) + "\n",
                    StandardCharsets.UTF_8);
            return;
        }
        assertThat(COMMITTED).as("docs/openapi.json is missing, generate it with -Dopenapi.update=true").exists();
        JsonNode committed = MAPPER.readTree(Files.readString(COMMITTED, StandardCharsets.UTF_8));
        assertThat(generated)
                .as("The API changed but docs/openapi.json was not regenerated "
                        + "(run: ./mvnw test -Dtest=OpenApiSpecTest -Dopenapi.update=true)")
                .isEqualTo(committed);
    }
}
