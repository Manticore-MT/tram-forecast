package ru.tramforecast.api.web;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
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
@RequestMapping("/api")
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
    @GetMapping("/meta")
    public Meta meta() {
        ServiceMeta value = meta.get();
        List<HorizonInfo> horizons = Arrays.stream(Horizon.values())
                .map(h -> new HorizonInfo(ApiMapper.horizon(h), h.granularity().name().toLowerCase(java.util.Locale.ROOT)))
                .toList();
        return new Meta(
                mapper.time(value.now()), value.today(), value.latestDate(), value.zone(), value.dataSource(), horizons);
    }

    /**
     * Response of {@code GET /api/meta}.
     *
     * @param now        the current moment the service works with (may be emulated)
     * @param today      the current calendar day
     * @param latestDate the latest date a forecast can be requested for
     * @param zone       IANA zone of the calendar days
     * @param dataSource {@code model} for the real ML service, {@code stub} for synthetic demo data
     * @param horizons   supported horizons and the step of their points
     */
    public record Meta(
            OffsetDateTime now,
            LocalDate today,
            LocalDate latestDate,
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
