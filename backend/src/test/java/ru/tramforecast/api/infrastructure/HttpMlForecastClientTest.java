package ru.tramforecast.api.infrastructure;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import ru.tramforecast.api.domain.model.Horizon;
import ru.tramforecast.api.domain.model.StopForecast;
import ru.tramforecast.api.domain.port.MlForecastClient;
import ru.tramforecast.api.domain.port.MlRequestRejectedException;
import ru.tramforecast.api.domain.port.MlUnavailableException;
import ru.tramforecast.api.infrastructure.config.TramProperties;
import ru.tramforecast.api.infrastructure.ml.MlConfig;

/**
 * Contract test of the HTTP client against a fake ML server: the exact request the backend sends,
 * the response shape documented in {@code ml/README.md}, and every failure mode (error status,
 * malformed body, timeout) mapping to "ML unavailable".
 */
class HttpMlForecastClientTest {

    private static final String GOOD_RESPONSE = """
            {
              "generatedAt": "2026-09-25T12:00:00+03:00",
              "modelVersion": "v0.3",
              "forecasts": [
                {
                  "routeId": "5",
                  "stopId": "1023",
                  "points": [
                    {"periodStart": "2026-09-25T09:00:00+03:00", "baseline": 900.0, "forecast": 1240.0},
                    {"periodStart": "2026-09-25T10:00:00+03:00", "baseline": 800.0, "forecast": 810.5}
                  ],
                  "factors": ["weekend", "rain"]
                },
                {"routeId": "5", "stopId": "1024", "points": []}
              ]
            }
            """;

    private HttpServer server;
    private volatile int status = 200;
    private volatile String body = GOOD_RESPONSE;
    private volatile long delayMillis;
    private final AtomicReference<String> receivedBody = new AtomicReference<>();
    private final AtomicReference<String> receivedPath = new AtomicReference<>();

    /**
     * Starts the fake ML server on a free port.
     *
     * @throws IOException when the server cannot start
     */
    @BeforeEach
    void startServer() throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/", exchange -> {
            receivedPath.set(exchange.getRequestMethod() + " " + exchange.getRequestURI().getPath());
            receivedBody.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            try {
                Thread.sleep(delayMillis);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(status, bytes.length);
            exchange.getResponseBody().write(bytes);
            exchange.close();
        });
        server.start();
    }

    /**
     * Stops the fake server.
     */
    @AfterEach
    void stopServer() {
        server.stop(0);
    }

    /**
     * The client posts the documented request and maps the documented response.
     */
    @Test
    void sendsTheDocumentedRequestAndMapsTheDocumentedResponse() {
        List<StopForecast> result = client(Duration.ofSeconds(2)).predict(Horizon.DAY, LocalDate.of(2026, 9, 25));

        assertThat(receivedPath.get()).isEqualTo("POST /predict");
        assertThat(receivedBody.get()).contains("\"horizon\":\"day\"").contains("\"date\":\"2026-09-25\"");
        assertThat(result).hasSize(2);
        StopForecast first = result.get(0);
        assertThat(first.routeId().value()).isEqualTo("5");
        assertThat(first.stopId().value()).isEqualTo("1023");
        assertThat(first.modelVersion()).isEqualTo("v0.3");
        assertThat(first.generatedAt()).isEqualTo(Instant.parse("2026-09-25T09:00:00Z"));
        assertThat(first.points()).hasSize(2);
        assertThat(first.points().get(0).periodStart()).isEqualTo(Instant.parse("2026-09-25T06:00:00Z"));
        assertThat(first.points().get(0).baseline()).isEqualTo(900.0);
        assertThat(first.points().get(0).forecast()).isEqualTo(1240.0);
        assertThat(first.factors()).containsExactly("weekend", "rain");
        assertThat(result.get(1).factors()).isEmpty();
    }

    /**
     * A non-2xx status is "ML unavailable".
     */
    @Test
    void errorStatusMeansUnavailable() {
        status = 503;
        body = "{\"error\":\"model_not_ready\"}";
        assertThatThrownBy(() -> client(Duration.ofSeconds(2)).predict(Horizon.DAY, LocalDate.of(2026, 9, 25)))
                .isInstanceOf(MlUnavailableException.class);
    }

    /**
     * A 422 with the documented explanation is a refusal, not "unavailable": asking again later gives the
     * same answer, so the code and the reason are passed on.
     */
    @Test
    void documentedRefusalIsNotUnavailable() {
        status = 422;
        body = "{\"detail\":{\"code\":\"UNSUPPORTED_PERIOD\",\"message\":\"Inside 2025-11-01 .. 2026-12-31 only\"}}";

        assertThatThrownBy(() -> client(Duration.ofSeconds(2)).predict(Horizon.DAY, LocalDate.of(2025, 10, 15)))
                .isInstanceOfSatisfying(MlRequestRejectedException.class, e -> {
                    assertThat(e.code()).isEqualTo("UNSUPPORTED_PERIOD");
                    assertThat(e.getMessage()).isEqualTo("Inside 2025-11-01 .. 2026-12-31 only");
                });
    }

    /**
     * A validation error of the ML framework (a list under "detail") is a refusal with its first message.
     */
    @Test
    void frameworkValidationErrorIsARefusal() {
        status = 422;
        body = "{\"detail\":[{\"loc\":[\"body\",\"horizon\"],\"msg\":\"Input should be day, week, month or year\"}]}";

        assertThatThrownBy(() -> client(Duration.ofSeconds(2)).predict(Horizon.DAY, LocalDate.of(2026, 9, 25)))
                .isInstanceOfSatisfying(MlRequestRejectedException.class, e -> {
                    assertThat(e.code()).isEqualTo("REJECTED");
                    assertThat(e.getMessage()).isEqualTo("Input should be day, week, month or year");
                });
    }

    /**
     * A 422 whose body is not the documented shape is still a refusal, with a generic explanation.
     */
    @Test
    void unreadableRefusalKeepsAGenericExplanation() {
        status = 422;
        body = "<html>nope</html>";

        assertThatThrownBy(() -> client(Duration.ofSeconds(2)).predict(Horizon.DAY, LocalDate.of(2026, 9, 25)))
                .isInstanceOfSatisfying(MlRequestRejectedException.class, e -> {
                    assertThat(e.code()).isEqualTo("REJECTED");
                    assertThat(e.getMessage()).isEqualTo("The ML service refused the request");
                });
    }

    /**
     * A body that does not follow the contract is "ML unavailable", never a raw parsing error.
     */
    @Test
    void malformedBodyMeansUnavailable() {
        body = "<html>not json</html>";
        assertThatThrownBy(() -> client(Duration.ofSeconds(2)).predict(Horizon.DAY, LocalDate.of(2026, 9, 25)))
                .isInstanceOf(MlUnavailableException.class);
    }

    /**
     * A slow model is cut off by the read timeout instead of holding the request hostage.
     */
    @Test
    void slowResponseIsCutOffByTheReadTimeout() {
        delayMillis = 1500;
        assertThatThrownBy(() -> client(Duration.ofMillis(300)).predict(Horizon.DAY, LocalDate.of(2026, 9, 25)))
                .isInstanceOf(MlUnavailableException.class);
    }

    /**
     * Nothing listening on the port is "ML unavailable".
     */
    @Test
    void connectionRefusedMeansUnavailable() {
        int port = server.getAddress().getPort();
        server.stop(0);
        assertThatThrownBy(() -> client(port, Duration.ofSeconds(1)).predict(Horizon.DAY, LocalDate.of(2026, 9, 25)))
                .isInstanceOf(MlUnavailableException.class);
    }

    private MlForecastClient client(Duration readTimeout) {
        return client(server.getAddress().getPort(), readTimeout);
    }

    private static MlForecastClient client(int port, Duration readTimeout) {
        TramProperties properties = new TramProperties(
                "Europe/Moscow",
                new TramProperties.Clock(""),
                new TramProperties.Ml(
                        "http", "http://127.0.0.1:" + port, Duration.ofSeconds(1), readTimeout,
                        new TramProperties.Stub(1, 1)),
                new TramProperties.Attention(10, 25),
                new TramProperties.Forecast(1, null, null),
                new TramProperties.Refresh(false, "0 0 * * * *"),
                new TramProperties.Cache(Duration.ofSeconds(1), Duration.ofSeconds(1), 8));
        return new MlConfig().httpMlForecastClient(properties);
    }
}
