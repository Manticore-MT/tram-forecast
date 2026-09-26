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
 * Starts the whole application with access control on (three failed attempts lock a client out; the
 * lockout is shortened to two seconds to keep the test fast) and checks the agreed rule over real
 * HTTP. Every test uses its own client address, sent as X-Forwarded-For (the server honours it for a
 * trusted proxy, and the test connects from localhost), so the tests cannot lock each other out.
 * Skipped automatically when Docker is not available.
 */
@Testcontainers(disabledWithoutDocker = true)
@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
            "tram.auth.enabled=true",
            "tram.auth.username=test-dispatcher",
            "tram.auth.password=test-secret-1",
            "tram.auth.max-failed-attempts=3",
            "tram.auth.lockout=2s"
        })
class LoginThrottleTest {

    @Container
    @ServiceConnection
    private static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:17-alpine");

    @Autowired
    private Environment environment;

    private HttpResponse<String> get(String client, String user, String password)
            throws IOException, InterruptedException {
        HttpRequest.Builder request = HttpRequest.newBuilder(
                        URI.create("http://localhost:" + environment.getProperty("local.server.port") + "/api/meta"))
                .header("X-Forwarded-For", client);
        if (user != null) {
            request.header("Authorization", "Basic "
                    + Base64.getEncoder().encodeToString((user + ":" + password).getBytes(StandardCharsets.UTF_8)));
        }
        return HttpClient.newHttpClient().send(request.build(), HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
    }

    private HttpResponse<String> right(String client) throws IOException, InterruptedException {
        return get(client, "test-dispatcher", "test-secret-1");
    }

    private HttpResponse<String> wrong(String client) throws IOException, InterruptedException {
        return get(client, "test-dispatcher", "guess");
    }

    /**
     * Three wrong attempts in a row lock the client out: the next request, even with the right
     * password, gets 429 with the wait and a problem document. When the wait is over the right
     * password works again.
     *
     * @throws Exception when a request fails
     */
    @Test
    void threeWrongAttemptsLockTheClientOutEvenForTheRightPassword() throws Exception {
        String client = "203.0.113.10";
        assertThat(wrong(client).statusCode()).isEqualTo(401);
        assertThat(wrong(client).statusCode()).isEqualTo(401);
        assertThat(wrong(client).statusCode()).isEqualTo(401);

        HttpResponse<String> locked = right(client);

        assertThat(locked.statusCode()).isEqualTo(429);
        assertThat(locked.headers().firstValue("Retry-After")).isPresent();
        assertThat(Long.parseLong(locked.headers().firstValue("Retry-After").orElseThrow())).isBetween(1L, 2L);
        assertThat(locked.headers().firstValue("Content-Type")).hasValueSatisfying(
                type -> assertThat(type).startsWith("application/problem+json"));
        assertThat(locked.body())
                .contains("\"status\":429")
                .contains("\"code\":\"TOO_MANY_ATTEMPTS\"")
                .contains("\"instance\":\"/api/meta\"");

        Thread.sleep(2300);

        assertThat(right(client).statusCode()).isEqualTo(200);
    }

    /**
     * A client that was locked out does not affect anyone else.
     *
     * @throws Exception when a request fails
     */
    @Test
    void otherClientsAreNotAffected() throws Exception {
        for (int i = 0; i < 3; i++) {
            wrong("203.0.113.20");
        }

        assertThat(right("203.0.113.20").statusCode()).isEqualTo(429);
        assertThat(right("203.0.113.21").statusCode()).isEqualTo(200);
    }

    /**
     * A successful login clears the count, so mistakes on either side of it do not lock the client.
     *
     * @throws Exception when a request fails
     */
    @Test
    void aSuccessfulLoginResetsTheCount() throws Exception {
        String client = "203.0.113.30";
        wrong(client);
        wrong(client);
        assertThat(right(client).statusCode()).isEqualTo(200);
        wrong(client);
        wrong(client);

        assertThat(wrong(client).statusCode()).isEqualTo(401);
        assertThat(right(client).statusCode()).isEqualTo(429);
    }

    /**
     * A request without credentials is not a login attempt: any number of them never locks a client
     * out, they just get 401.
     *
     * @throws Exception when a request fails
     */
    @Test
    void requestsWithoutCredentialsAreNotCounted() throws Exception {
        String client = "203.0.113.40";
        for (int i = 0; i < 6; i++) {
            assertThat(get(client, null, null).statusCode()).isEqualTo(401);
        }

        assertThat(right(client).statusCode()).isEqualTo(200);
    }
}
