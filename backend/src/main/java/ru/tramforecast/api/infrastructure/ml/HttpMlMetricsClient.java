package ru.tramforecast.api.infrastructure.ml;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.web.client.RestClient;
import ru.tramforecast.api.domain.model.BacktestDay;
import ru.tramforecast.api.domain.model.BacktestMetrics;
import ru.tramforecast.api.domain.port.MlMetricsClient;
import ru.tramforecast.api.domain.port.MlUnavailableException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/**
 * Reads the model's quality from the ML service ({@code GET /metrics}, described in
 * {@code docs/ml-contract.md}). The answer is a historical backtest that does not change, so it is
 * kept for a few minutes instead of being asked for on every request. Only the fields the backend
 * needs (the days, the origin, the first limitation and the score the platform gave the submitted
 * file); everything else in the answer is ignored.
 */
public class HttpMlMetricsClient implements MlMetricsClient {

    private static final JsonMapper MAPPER = JsonMapper.builder().build();
    private static final String KEY = "backtest";

    private final RestClient client;
    private final Cache<String, BacktestMetrics> cache;

    /**
     * Creates the client.
     *
     * @param client a REST client already configured with the ML base URL and timeouts
     * @param ttl    how long an answer is reused
     */
    public HttpMlMetricsClient(RestClient client, Duration ttl) {
        this.client = client;
        this.cache = Caffeine.newBuilder().maximumSize(1).expireAfterWrite(ttl).build();
    }

    @Override
    public BacktestMetrics backtest() {
        BacktestMetrics cached = cache.getIfPresent(KEY);
        if (cached != null) {
            return cached;
        }
        BacktestMetrics fresh = fetch();
        cache.put(KEY, fresh);
        return fresh;
    }

    private BacktestMetrics fetch() {
        try {
            String body = client.get().uri("/metrics").retrieve().body(String.class);
            JsonNode root = MAPPER.readTree(body);
            List<BacktestDay> days = new ArrayList<>();
            for (JsonNode day : root.path("byDay")) {
                days.add(new BacktestDay(
                        LocalDate.parse(day.path("date").asString()),
                        day.path("absoluteError").asDouble(),
                        day.path("actualSum").asDouble()));
            }
            if (days.isEmpty()) {
                throw new MlUnavailableException("The ML service returned no backtest days", null);
            }
            JsonNode platform = root.path("platform").path("score");
            return new BacktestMetrics(
                    root.path("origin").asString(""),
                    note(root),
                    days,
                    platform.isNumber() ? platform.asDouble() : null);
        } catch (MlUnavailableException e) {
            throw e;
        } catch (RuntimeException e) {
            throw new MlUnavailableException("The ML metrics request failed: " + e.getMessage(), e);
        }
    }

    private static String note(JsonNode root) {
        String origin = root.path("origin").asString("");
        JsonNode limitations = root.path("limitations");
        String limitation = limitations.isArray() && !limitations.isEmpty() ? limitations.get(0).asString("") : "";
        return "Backtest of the model from " + origin + " (route x hour)" + (limitation.isBlank() ? "" : ": " + limitation);
    }
}
