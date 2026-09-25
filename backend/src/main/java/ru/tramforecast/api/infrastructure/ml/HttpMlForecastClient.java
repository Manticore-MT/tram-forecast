package ru.tramforecast.api.infrastructure.ml;

import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;
import ru.tramforecast.api.domain.model.ForecastPoint;
import ru.tramforecast.api.domain.model.Horizon;
import ru.tramforecast.api.domain.model.RouteId;
import ru.tramforecast.api.domain.model.StopForecast;
import ru.tramforecast.api.domain.model.StopId;
import ru.tramforecast.api.domain.port.MlForecastClient;
import ru.tramforecast.api.domain.port.MlUnavailableException;

/**
 * Calls the real ML service over HTTP: {@code POST /predict} with a horizon and a date, answered
 * with finished aggregates for every stop. The contract is documented in {@code ml/README.md}.
 */
public class HttpMlForecastClient implements MlForecastClient {

    private final RestClient client;

    /**
     * Creates the client.
     *
     * @param client a REST client already configured with the ML base URL and timeouts
     */
    public HttpMlForecastClient(RestClient client) {
        this.client = client;
    }

    @Override
    public List<StopForecast> predict(Horizon horizon, LocalDate date) {
        try {
            PredictResponse response = client.post()
                    .uri("/predict")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new PredictRequest(horizon.name().toLowerCase(Locale.ROOT), date.toString()))
                    .retrieve()
                    .body(PredictResponse.class);
            if (response == null || response.forecasts() == null) {
                throw new MlUnavailableException("The ML service returned an empty answer", null);
            }
            return map(response, horizon, date);
        } catch (MlUnavailableException e) {
            throw e;
        } catch (RuntimeException e) {
            throw new MlUnavailableException("The ML service request failed: " + e.getMessage(), e);
        }
    }

    private static List<StopForecast> map(PredictResponse response, Horizon horizon, LocalDate date) {
        Instant generatedAt = response.generatedAt().toInstant();
        return response.forecasts().stream()
                .map(item -> new StopForecast(
                        new RouteId(item.routeId()),
                        new StopId(item.stopId()),
                        horizon,
                        date,
                        generatedAt,
                        response.modelVersion() == null ? "unknown" : response.modelVersion(),
                        item.points().stream()
                                .map(p -> new ForecastPoint(p.periodStart().toInstant(), p.baseline(), p.forecast(), null))
                                .toList(),
                        item.factors() == null ? List.of() : item.factors()))
                .toList();
    }

    /**
     * Request body of {@code POST /predict}.
     *
     * @param horizon {@code day}, {@code month} or {@code year}
     * @param date    ISO anchor date
     */
    record PredictRequest(String horizon, String date) {
    }

    /**
     * Response body of {@code POST /predict}.
     *
     * @param generatedAt  when the forecast was computed
     * @param modelVersion version of the model
     * @param forecasts    one entry per stop
     */
    record PredictResponse(OffsetDateTime generatedAt, String modelVersion, List<StopItem> forecasts) {
    }

    /**
     * Forecast of one stop in the ML response.
     *
     * @param routeId route identifier
     * @param stopId  stop identifier
     * @param points  ordered points
     * @param factors factors the model took into account, may be absent
     */
    record StopItem(String routeId, String stopId, List<PointItem> points, List<String> factors) {
    }

    /**
     * One period in the ML response.
     *
     * @param periodStart start of the period
     * @param baseline    usual level
     * @param forecast    forecast value
     */
    record PointItem(OffsetDateTime periodStart, double baseline, double forecast) {
    }
}
