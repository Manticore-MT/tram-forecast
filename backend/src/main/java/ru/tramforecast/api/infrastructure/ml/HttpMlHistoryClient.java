package ru.tramforecast.api.infrastructure.ml;

import java.time.LocalDate;
import org.springframework.web.client.RestClient;
import ru.tramforecast.api.domain.model.HistoryComparison;
import ru.tramforecast.api.domain.port.MlHistoryClient;
import ru.tramforecast.api.domain.port.MlUnavailableException;

/** Bounded HTTP call to historical observations; no synthetic fallback. */
public class HttpMlHistoryClient implements MlHistoryClient {
    private final RestClient client;
    public HttpMlHistoryClient(RestClient client) { this.client = client; }

    @Override
    public HistoryComparison comparison(String routeId, LocalDate date) {
        try {
            HistoryComparison result = client.get().uri(b -> b.path("/history/comparison")
                    .queryParam("routeId", routeId).queryParam("date", date).build())
                    .retrieve().body(HistoryComparison.class);
            if (result == null || result.lastWeek() == null || result.lastMonth() == null
                    || result.typicalWeek() == null) throw new IllegalStateException("Incomplete history");
            return result;
        } catch (RuntimeException e) {
            throw new MlUnavailableException("Historical observations unavailable", e);
        }
    }
}
