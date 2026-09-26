package ru.tramforecast.api.domain.port;

import java.time.LocalDate;
import java.util.List;
import ru.tramforecast.api.domain.model.Horizon;
import ru.tramforecast.api.domain.model.RouteForecast;

/**
 * Outbound port to the ML service. The backend only ever asks for finished aggregates (forecast,
 * baseline, factors per route and period); it never touches raw telemetry.
 */
public interface MlForecastClient {

    /**
     * Asks ML to compute the forecast of the whole network for a horizon and anchor date.
     *
     * @param horizon planning horizon
     * @param date    anchor date
     * @return one forecast per route
     * @throws MlUnavailableException     when ML did not answer in time or answered with an error
     * @throws MlRequestRejectedException when ML understood the request and refused it (for example a
     *                                    period outside the range its model covers)
     */
    List<RouteForecast> predict(Horizon horizon, LocalDate date);
}
