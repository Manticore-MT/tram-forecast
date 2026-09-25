package ru.tramforecast.api.infrastructure.scheduler;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import ru.tramforecast.api.application.RefreshForecastUseCase;
import ru.tramforecast.api.domain.model.Horizon;

/**
 * Optional warm-up: on a schedule, recomputes today's forecast for every horizon and appends it
 * as a new snapshot. Off by default, because requests fill the storage lazily anyway.
 */
@Component
@EnableScheduling
@ConditionalOnProperty(name = "tram.refresh.enabled", havingValue = "true")
public class ForecastRefreshScheduler {

    private final RefreshForecastUseCase refresh;
    private final Clock clock;
    private final ZoneId zone;

    /**
     * Creates the scheduler.
     *
     * @param refresh the refresh use case
     * @param clock   source of "now"
     * @param zone    API zone
     */
    public ForecastRefreshScheduler(RefreshForecastUseCase refresh, Clock clock, ZoneId zone) {
        this.refresh = refresh;
        this.clock = clock;
        this.zone = zone;
    }

    /**
     * Refreshes every horizon for today.
     */
    @Scheduled(cron = "${tram.refresh.cron}", zone = "${tram.zone}")
    public void refreshToday() {
        LocalDate today = LocalDate.now(clock.withZone(zone));
        for (Horizon horizon : Horizon.values()) {
            refresh.refresh(horizon, today);
        }
    }
}
