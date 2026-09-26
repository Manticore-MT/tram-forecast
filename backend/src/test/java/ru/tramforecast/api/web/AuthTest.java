package ru.tramforecast.api.web;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.core.env.Environment;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

/**
 * Starts the whole application with access control on and checks the agreed scheme over real HTTP:
 * HTTP Basic on every {@code /api/**} request, 401 (as a problem document, without a
 * {@code WWW-Authenticate} header) for a missing or wrong credential, everything else open.
 * Skipped automatically when Docker is not available.
 */
@Testcontainers(disabledWithoutDocker = true)
@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
            "tram.auth.enabled=true",
            "tram.auth.username=test-dispatcher",
            "tram.auth.password=test-secret-1"
        })
class AuthTest {

    @Container
    @ServiceConnection
    private static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:17-alpine");

    @Autowired
    private Environment environment;

    private HttpResponse<String> get(String path, String user, String password)
            throws IOException, InterruptedException {
        return send("GET", path, user, password);
    }

    private HttpResponse<String> send(String method, String path, String user, String password)
            throws IOException, InterruptedException {
        HttpRequest.Builder request = HttpRequest.newBuilder(
                        URI.create("http://localhost:" + environment.getProperty("local.server.port") + path))
                .method(method, HttpRequest.BodyPublishers.noBody());
        if (user != null) {
            String token = Base64.getEncoder().encodeToString((user + ":" + password).getBytes(StandardCharsets.UTF_8));
            request.header("Authorization", "Basic " + token);
        }
        return HttpClient.newHttpClient().send(request.build(), HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
    }

    /**
     * No credentials on a protected path: 401 with a problem document and no browser login prompt.
     *
     * @throws Exception when the request fails
     */
    @Test
    void missingCredentialsAreRejectedAsProblemWithoutAChallenge() throws Exception {
        HttpResponse<String> response = get("/api/meta", null, null);

        assertThat(response.statusCode()).isEqualTo(401);
        assertThat(response.headers().firstValue("Content-Type")).hasValueSatisfying(
                type -> assertThat(type).startsWith("application/problem+json"));
        assertThat(response.headers().firstValue("WWW-Authenticate")).isEmpty();
        assertThat(response.body())
                .contains("\"title\":\"Unauthorized\"")
                .contains("\"status\":401")
                .contains("\"code\":\"UNAUTHORIZED\"")
                .containsPattern("\"timestamp\":\"\\d{4}-\\d{2}-\\d{2}T[^\"]+[+-]\\d{2}:\\d{2}\"")
                .contains("\"instance\":\"/api/meta\"");
    }

    /**
     * A wrong password or a wrong user name is rejected the same way.
     *
     * @throws Exception when the request fails
     */
    @Test
    void wrongCredentialsAreRejected() throws Exception {
        assertThat(get("/api/meta", "test-dispatcher", "wrong").statusCode()).isEqualTo(401);
        assertThat(get("/api/meta", "somebody-else", "test-secret-1").statusCode()).isEqualTo(401);
        assertThat(get("/api/routes/1/forecast", "test-dispatcher", "").statusCode()).isEqualTo(401);
    }

    /**
     * The right credentials get through to the endpoint.
     *
     * @throws Exception when the request fails
     */
    @Test
    void validCredentialsReachTheEndpoint() throws Exception {
        HttpResponse<String> response = get("/api/meta", "test-dispatcher", "test-secret-1");

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).contains("\"dataSource\"");
    }

    /**
     * In the real application (not a test double) a URL that is not an endpoint is a 404 with its own
     * code and a wrong HTTP method is a 405, never a generic 500.
     *
     * @throws Exception when the request fails
     */
    @Test
    void unknownEndpointAndWrongMethodAreNotServerErrors() throws Exception {
        HttpResponse<String> unknown = get("/api/no-such-endpoint", "test-dispatcher", "test-secret-1");
        assertThat(unknown.statusCode()).isEqualTo(404);
        assertThat(unknown.body()).contains("\"code\":\"ENDPOINT_NOT_FOUND\"");

        HttpResponse<String> wrongMethod = send("POST", "/api/meta", "test-dispatcher", "test-secret-1");
        assertThat(wrongMethod.statusCode()).isEqualTo(405);
        assertThat(wrongMethod.body()).contains("\"code\":\"METHOD_NOT_ALLOWED\"");
    }

    /**
     * Only {@code /api/**} is protected: health checks and the OpenAPI document stay open.
     *
     * @throws Exception when the request fails
     */
    @Test
    void healthAndApiDocsStayOpen() throws Exception {
        assertThat(get("/actuator/health", null, null).statusCode()).isEqualTo(200);
        assertThat(get("/v3/api-docs", null, null).statusCode()).isEqualTo(200);
    }
}
