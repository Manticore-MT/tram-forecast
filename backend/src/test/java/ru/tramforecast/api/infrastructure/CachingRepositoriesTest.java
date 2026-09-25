package ru.tramforecast.api.infrastructure;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import ru.tramforecast.api.domain.model.ActualValue;
import ru.tramforecast.api.domain.model.ForecastPoint;
import ru.tramforecast.api.domain.model.Horizon;
import ru.tramforecast.api.domain.model.LoadMatrix;
import ru.tramforecast.api.domain.model.RouteId;
import ru.tramforecast.api.domain.model.StopForecast;
import ru.tramforecast.api.domain.model.StopId;
import ru.tramforecast.api.domain.port.ActualRepository;
import ru.tramforecast.api.infrastructure.persistence.CachingActualRepository;
import ru.tramforecast.api.infrastructure.persistence.CachingForecastRepository;
import ru.tramforecast.api.support.InMemoryActualRepository;
import ru.tramforecast.api.support.InMemoryForecastRepository;

/**
 * The read caches must save repeated work without ever hiding data that was just written.
 */
class CachingRepositoriesTest {

    private static final LocalDate DATE = LocalDate.of(2026, 9, 25);
    private static final Instant NOW = Instant.parse("2026-09-25T09:00:00Z");

    /**
     * A repeated read is served from the cache, an empty read is not cached, and a write makes the
     * new snapshot visible at once.
     */
    @Test
    void forecastReadsAreCachedButNeverHideNewData() {
        AtomicInteger reads = new AtomicInteger();
        InMemoryForecastRepository real = new InMemoryForecastRepository() {
            @Override
            public List<StopForecast> findLatest(Horizon horizon, LocalDate date) {
                reads.incrementAndGet();
                return super.findLatest(horizon, date);
            }
        };
        CachingForecastRepository cache = new CachingForecastRepository(real, Duration.ofMinutes(5), 16);

        assertThat(cache.findLatest(Horizon.DAY, DATE)).isEmpty();
        assertThat(cache.findLatest(Horizon.DAY, DATE)).isEmpty();
        assertThat(reads).hasValue(2);

        cache.saveAll(List.of(stop(130)));
        assertThat(cache.findLatest(Horizon.DAY, DATE)).hasSize(1);
        assertThat(cache.findLatest(Horizon.DAY, DATE)).hasSize(1);
        assertThat(reads).hasValue(3);

        cache.saveAll(List.of(stop(160).withPoints(List.of(new ForecastPoint(NOW, 100, 160, null)))));
        assertThat(cache.findLatest(Horizon.DAY, DATE)).hasSize(1);
        assertThat(reads).hasValue(4);
    }

    /**
     * Facts and load matrices are computed once per request shape.
     */
    @Test
    void factsAreAggregatedOncePerRequestShape() {
        AtomicInteger finds = new AtomicInteger();
        AtomicInteger matrices = new AtomicInteger();
        InMemoryActualRepository real = new InMemoryActualRepository(ZoneId.of("Europe/Moscow"));
        real.add(new ActualValue(new RouteId("R1"), new StopId("S1"), NOW, 5));
        ActualRepository counting = new ActualRepository() {
            @Override
            public List<ActualValue> find(Horizon horizon, LocalDate date) {
                finds.incrementAndGet();
                return real.find(horizon, date);
            }

            @Override
            public LoadMatrix loadMatrix(RouteId routeId) {
                matrices.incrementAndGet();
                return real.loadMatrix(routeId);
            }
        };
        CachingActualRepository cache = new CachingActualRepository(counting, Duration.ofMinutes(5), 16);

        assertThat(cache.find(Horizon.DAY, DATE)).hasSize(1);
        assertThat(cache.find(Horizon.DAY, DATE)).hasSize(1);
        cache.find(Horizon.MONTH, DATE);
        cache.loadMatrix(new RouteId("R1"));
        cache.loadMatrix(new RouteId("R1"));

        assertThat(finds).hasValue(2);
        assertThat(matrices).hasValue(1);
    }

    private static StopForecast stop(double forecast) {
        return new StopForecast(
                new RouteId("R1"), new StopId("S1"), Horizon.DAY, DATE, NOW.plusSeconds((long) forecast), "test",
                List.of(new ForecastPoint(NOW, 100, forecast, null)), List.of());
    }
}
