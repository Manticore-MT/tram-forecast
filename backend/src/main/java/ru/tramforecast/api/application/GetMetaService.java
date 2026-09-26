package ru.tramforecast.api.application;

import java.time.Clock;
import java.time.ZoneId;

/**
 * Implements {@link GetMetaUseCase}.
 */
public class GetMetaService implements GetMetaUseCase {

    private final Clock clock;
    private final ForecastDates dates;
    private final ZoneId zone;
    private final String dataSource;

    /**
     * Creates the service.
     *
     * @param clock      source of the current moment
     * @param dates      date resolution and limits
     * @param zone       service zone
     * @param dataSource {@code model} or {@code stub}
     */
    public GetMetaService(Clock clock, ForecastDates dates, ZoneId zone, String dataSource) {
        this.clock = clock;
        this.dates = dates;
        this.zone = zone;
        this.dataSource = dataSource;
    }

    @Override
    public ServiceMeta get() {
        return new ServiceMeta(
                clock.instant(), dates.today(), dates.latest(), dates.earliest(), dates.forecastTo(), zone.getId(),
                dataSource);
    }
}
