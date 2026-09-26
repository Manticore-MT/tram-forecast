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
 * Starts the whole application with CORS allowed for any origin (*) and access control on, and checks
 * over real HTTP what a browser relies on: the preflight is answered without credentials, and both a
 * successful call and a 401 carry the CORS headers (so the calling page can read them). Skipped
 * automatically when Docker is not available. That CORS is off unless configured is checked in
 * {@link AuthTest}.
 */
@Testcontainers(disabledWithoutDocker = true)
@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
            "tram.auth.enabled=true",
            "tram.auth.username=test-dispatcher",
            "tram.auth.password=test-secret-1",
            "tram.cors.allowed-origins=*"
        })
class CorsTest {

    private static final String ORIGIN = "http://localhost:5173";

    @Container
    @ServiceConnection
    private static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:17-alpine");

    @Autowired
    private Environment environment;

    private HttpResponse<String> send(String method, String path, boolean withCredentials, String... headers)
            throws IOException, InterruptedException {
        HttpRequest.Builder request = HttpRequest.newBuilder(
                        URI.create("http://localhost:" + environment.getProperty("local.server.port") + path))
                .method(method, HttpRequest.BodyPublishers.noBody())
                .header("Origin", ORIGIN);
        for (int i = 0; i < headers.length; i += 2) {
            request.header(headers[i], headers[i + 1]);
        }
        if (withCredentials) {
            String token = Base64.getEncoder()
                    .encodeToString("test-dispatcher:test-secret-1".getBytes(StandardCharsets.UTF_8));
            request.header("Authorization", "Basic " + token);
        }
        return HttpClient.newHttpClient().send(request.build(), HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
    }

    /**
     * The browser's preflight carries no credentials. It must still be answered, otherwise the real
     * request with the Authorization header is never sent.
     *
     * @throws Exception when the request fails
     */
    @Test
    void preflightIsAnsweredWithoutCredentials() throws Exception {
        HttpResponse<String> response = send("OPTIONS", "/api/meta", false,
                "Access-Control-Request-Method", "GET",
                "Access-Control-Request-Headers", "authorization");

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.headers().firstValue("Access-Control-Allow-Origin")).hasValue(ORIGIN);
        assertThat(response.headers().firstValue("Access-Control-Allow-Headers"))
                .hasValueSatisfying(value -> assertThat(value.toLowerCase()).contains("authorization"));
        assertThat(response.headers().firstValue("Access-Control-Allow-Methods"))
                .hasValueSatisfying(value -> assertThat(value).contains("GET"));
    }

    /**
     * A 401 must be readable by the page, otherwise the login form cannot tell a wrong password from
     * a network failure.
     *
     * @throws Exception when the request fails
     */
    @Test
    void unauthorizedAnswerIsReadableCrossOrigin() throws Exception {
        HttpResponse<String> response = send("GET", "/api/meta", false);

        assertThat(response.statusCode()).isEqualTo(401);
        assertThat(response.headers().firstValue("Access-Control-Allow-Origin")).hasValue(ORIGIN);
        assertThat(response.body()).contains("\"code\":\"UNAUTHORIZED\"");
    }

    /**
     * A successful call carries the CORS headers, and the file name of an export is readable.
     *
     * @throws Exception when the request fails
     */
    @Test
    void successfulCallCarriesCorsHeaders() throws Exception {
        HttpResponse<String> response = send("GET", "/api/meta", true);

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.headers().firstValue("Access-Control-Allow-Origin")).hasValue(ORIGIN);
        assertThat(response.headers().firstValue("Access-Control-Expose-Headers"))
                .hasValueSatisfying(value -> assertThat(value).contains("Content-Disposition"));
    }
}
