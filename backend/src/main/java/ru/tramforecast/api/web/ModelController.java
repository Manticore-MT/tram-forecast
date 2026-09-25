package ru.tramforecast.api.web;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.tramforecast.api.application.GetModelStatsUseCase;
import ru.tramforecast.api.web.dto.Responses;

/**
 * Forecast quality endpoint.
 */
@RestController
@RequestMapping(value = "/api/model", produces = MediaType.APPLICATION_JSON_VALUE)
public class ModelController {

    private final GetModelStatsUseCase stats;
    private final ApiMapper mapper;

    /**
     * Creates the controller.
     *
     * @param stats  model statistics use case
     * @param mapper response mapper
     */
    public ModelController(GetModelStatsUseCase stats, ApiMapper mapper) {
        this.stats = stats;
        this.mapper = mapper;
    }

    /**
     * WAPE of the initial daily forecasts against the facts over recent days.
     *
     * @param days how many recent days to include, 1 to 90, default 30
     * @return overall and per-day accuracy
     */
    @Operation(summary = "Forecast quality: WAPE of the initial daily forecasts against the facts")
    @GetMapping("/stats")
    public Responses.ModelStats stats(@RequestParam(defaultValue = "30") int days) {
        return mapper.toResponse(stats.get(days));
    }
}
