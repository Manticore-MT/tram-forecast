package ru.tramforecast.api.infrastructure;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;
import ru.tramforecast.api.domain.model.BacktestMetrics;
import ru.tramforecast.api.domain.port.MlUnavailableException;
import ru.tramforecast.api.infrastructure.ml.HttpMlMetricsClient;

/**
 * Contract test of the metrics client against a fake ML server: the shape of {@code GET /metrics} the
 * ML service really returns (with fields the backend does not need), keeping an answer for a while, and
 * every failure mode mapping to "ML unavailable".
 */
class HttpMlMetricsClientTest {

    private static final String METRICS = """
            {
              "scope": "historical_route_hour_backtest",
              "origin": "2025-09-01",
              "overall": {"wape": 0.111, "score": 0.889, "absoluteError": 30.0, "actualSum": 270.0, "observations": 5},
              "byRoute": [{"routeId": "1", "wape": 0.1}],
              "byDay": [
                {"date": "2025-09-01", "wape": 0.1, "score": 0.9, "absoluteError": 10.0, "actualSum": 100.0, "observations": 3},
                {"date": "2025-09-02", "wape": 0.2, "score": 0.8, "absoluteError": 20.0, "actualSum": 100.0, "observations": 3}
              ],
              "platform": {"score": 0.8822, "provenance": "reported_by_team"},
              "limitations": ["The blocks were used to tune the model; this is not an independent final test.", "Other."]
            }
            """;

    private HttpServer server;
    private volatile int status = 200;
    private volatile String body = METRICS;
    private final AtomicInteger requests = new AtomicInteger();

    /**
     * Starts the fake ML server on a free port.
     *
     * @throws IOException when the server cannot start
     */
    @BeforeEach
    void startServer() throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/", exchange -> {
            requests.incrementAndGet();
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

    private HttpMlMetricsClient client(Duration ttl) {
        RestClient rest = RestClient.builder().baseUrl("http://127.0.0.1:" + server.getAddress().getPort()).build();
        return new HttpMlMetricsClient(rest, ttl);
    }

    /**
     * The days and the two sums are read, the note names the origin and the first limitation, and the
     * fields the backend does not use are ignored.
     */
    @Test
    void readsTheDocumentedAnswer() {
        BacktestMetrics metrics = client(Duration.ofMinutes(5)).backtest();

        assertThat(metrics.origin()).isEqualTo("2025-09-01");
        assertThat(metrics.note())
                .contains("2025-09-01")
                .contains("not an independent final test")
                .doesNotContain("Other.");
        assertThat(metrics.days()).hasSize(2);
        assertThat(metrics.days().get(0).date()).isEqualTo(LocalDate.of(2025, 9, 1));
        assertThat(metrics.days().get(0).absoluteError()).isEqualTo(10.0);
        assertThat(metrics.days().get(1).actualSum()).isEqualTo(100.0);
    }

    /**
     * An answer is kept for the time to live, so the ML service is not asked on every request.
     */
    @Test
    void anAnswerIsReusedWithinTheTimeToLive() {
        HttpMlMetricsClient client = client(Duration.ofMinutes(5));

        client.backtest();
        client.backtest();
        client.backtest();

        assertThat(requests).hasValue(1);
    }

    /**
     * A failure is never kept: the next call asks again.
     */
    @Test
    void aFailureIsNotCached() {
        HttpMlMetricsClient client = client(Duration.ofMinutes(5));
        status = 500;
        assertThatThrownBy(client::backtest).isInstanceOf(MlUnavailableException.class);

        status = 200;

        assertThat(client.backtest().days()).hasSize(2);
        assertThat(requests).hasValue(2);
    }

    /**
     * Anything that is not the documented answer is "ML unavailable", never a raw parsing error.
     */
    @Test
    void badAnswersMeanUnavailable() {
        body = "<html>nope</html>";
        assertThatThrownBy(() -> client(Duration.ofMinutes(5)).backtest()).isInstanceOf(MlUnavailableException.class);

        body = "{\"origin\": \"2025-09-01\", \"byDay\": []}";
        assertThatThrownBy(() -> client(Duration.ofMinutes(5)).backtest()).isInstanceOf(MlUnavailableException.class);

        body = "{\"byDay\": [{\"date\": \"not-a-date\"}]}";
        assertThatThrownBy(() -> client(Duration.ofMinutes(5)).backtest()).isInstanceOf(MlUnavailableException.class);
    }

    /**
     * A connection that cannot be made is "ML unavailable".
     */
    @Test
    void connectionRefusedMeansUnavailable() {
        int port = server.getAddress().getPort();
        server.stop(0);
        RestClient rest = RestClient.builder().baseUrl("http://127.0.0.1:" + port).build();

        assertThatThrownBy(() -> new HttpMlMetricsClient(rest, Duration.ofMinutes(5)).backtest())
                .isInstanceOf(MlUnavailableException.class);
    }
}
