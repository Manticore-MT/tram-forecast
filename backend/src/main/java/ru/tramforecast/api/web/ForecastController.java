package ru.tramforecast.api.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.tramforecast.api.application.GetAttentionZonesUseCase;
import ru.tramforecast.api.application.GetLoadMatrixUseCase;
import ru.tramforecast.api.application.GetNetworkOverviewUseCase;
import ru.tramforecast.api.application.GetRouteForecastUseCase;
import ru.tramforecast.api.application.GetStopForecastUseCase;
import ru.tramforecast.api.domain.model.RouteId;
import ru.tramforecast.api.domain.model.StopId;
import ru.tramforecast.api.web.dto.Responses;

/**
 * Read endpoints of the dashboard: network overview, route, stop, attention zones, load matrix.
 * Every request is answered from stored aggregates; the ML service is involved only on a storage
 * miss, and that is hidden behind the use cases.
 */
@RestController
@RequestMapping("/api")
public class ForecastController {

    private final GetNetworkOverviewUseCase overview;
    private final GetRouteForecastUseCase route;
    private final GetStopForecastUseCase stop;
    private final GetAttentionZonesUseCase attention;
    private final GetLoadMatrixUseCase matrix;
    private final ApiMapper mapper;

    /**
     * Creates the controller.
     *
     * @param overview network overview use case
     * @param route    route forecast use case
     * @param stop     stop forecast use case
     * @param attention attention zones use case
     * @param matrix   load matrix use case
     * @param mapper   response mapper
     */
    public ForecastController(
            GetNetworkOverviewUseCase overview,
            GetRouteForecastUseCase route,
            GetStopForecastUseCase stop,
            GetAttentionZonesUseCase attention,
            GetLoadMatrixUseCase matrix,
            ApiMapper mapper) {
        this.overview = overview;
        this.route = route;
        this.stop = stop;
        this.attention = attention;
        this.matrix = matrix;
        this.mapper = mapper;
    }

    /**
     * Forecast of every route, for painting the network map.
     *
     * @param params common query parameters
     * @return one series per route
     */
    @GetMapping("/routes")
    public Responses.NetworkOverview routes(ForecastParams params) {
        return mapper.toResponse(overview.get(params.toQuery()));
    }

    /**
     * Forecast of one route with all of its stops.
     *
     * @param routeId route identifier
     * @param params  common query parameters
     * @return route total and per-stop series
     */
    @GetMapping("/routes/{routeId}/forecast")
    public Responses.RouteForecast routeForecast(@PathVariable String routeId, ForecastParams params) {
        return mapper.toResponse(route.get(new RouteId(routeId), params.toQuery()));
    }

    /**
     * Details of one stop: baseline, deviation, verdict, peak, facts a year earlier.
     *
     * @param routeId route identifier
     * @param stopId  stop identifier
     * @param params  common query parameters
     * @return the stop details
     */
    @GetMapping("/routes/{routeId}/stops/{stopId}/forecast")
    public Responses.StopForecast stopForecast(
            @PathVariable String routeId, @PathVariable String stopId, ForecastParams params) {
        return mapper.toResponse(stop.get(new RouteId(routeId), new StopId(stopId), params.toQuery()));
    }

    /**
     * Attention zones of the network, largest deviation first.
     *
     * @param params common query parameters
     * @return the zones
     */
    @GetMapping("/attention")
    public Responses.Attention attention(ForecastParams params) {
        return mapper.toResponse(attention.get(params.toQuery()));
    }

    /**
     * The typical week of a route: average load per day of week and hour.
     *
     * @param routeId route identifier
     * @return the matrix
     */
    @GetMapping("/routes/{routeId}/load-matrix")
    public Responses.LoadMatrix loadMatrix(@PathVariable String routeId) {
        return mapper.toResponse(matrix.get(new RouteId(routeId)));
    }
}
