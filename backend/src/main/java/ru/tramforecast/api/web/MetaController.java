package ru.tramforecast.api.web;

import io.swagger.v3.oas.annotations.Operation;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.tramforecast.api.application.GetMetaUseCase;
import ru.tramforecast.api.application.ServiceMeta;
import ru.tramforecast.api.domain.model.Horizon;

/**
 * Service metadata: lets the frontend bound its calendar and label demo data honestly.
 */
@RestController
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
public class MetaController {

    private final GetMetaUseCase meta;
    private final ApiMapper mapper;

    /**
     * Creates the controller.
     *
     * @param meta   metadata use case
     * @param mapper response mapper
     */
    public MetaController(GetMetaUseCase meta, ApiMapper mapper) {
        this.meta = meta;
        this.mapper = mapper;
    }

    /**
     * The current moment, selectable date range, horizons with their steps and the data source.
     *
     * @return the metadata
     */
    @Operation(summary = "Service metadata: current moment, selectable dates, horizons, data source")
    @GetMapping("/meta")
    public Meta meta() {
        ServiceMeta value = meta.get();
        List<HorizonInfo> horizons = Arrays.stream(Horizon.values())
                .map(h -> new HorizonInfo(ApiMapper.horizon(h), h.granularity().name().toLowerCase(java.util.Locale.ROOT)))
                .toList();
        return new Meta(
                mapper.time(value.now()),
                value.today(),
                value.latestDate(),
                value.forecastFrom(),
                value.forecastTo(),
                value.zone(),
                value.dataSource(),
                horizons);
    }

    /**
     * Response of {@code GET /api/meta}.
     *
     * @param now        the current moment the service works with (may be emulated)
     * @param today      the current calendar day
     * @param latestDate the latest date a forecast can be requested for (the end of the model's range when
     *                   it is fixed)
     * @param forecastFrom first date the model covers, {@code null} when there is no lower limit; a period
     *                     that starts earlier is refused with {@code PERIOD_NOT_SUPPORTED}
     * @param forecastTo   last date the model covers, {@code null} when the range is not fixed; a period that
     *                     ends later is refused with {@code PERIOD_NOT_SUPPORTED}
     * @param zone       IANA zone of the calendar days
     * @param dataSource {@code model} for the real ML service, {@code stub} for synthetic demo data
     * @param horizons   supported horizons and the step of their points
     */
    public record Meta(
            OffsetDateTime now,
            LocalDate today,
            LocalDate latestDate,
            LocalDate forecastFrom,
            LocalDate forecastTo,
            String zone,
            String dataSource,
            List<HorizonInfo> horizons) {
    }

    /**
     * A horizon and the step of its points.
     *
     * @param horizon {@code day}, {@code month} or {@code year}
     * @param step    {@code hour}, {@code day} or {@code month}
     */
    public record HorizonInfo(String horizon, String step) {
    }
}
