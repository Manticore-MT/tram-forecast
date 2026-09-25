package ru.tramforecast.api.infrastructure.persistence;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import ru.tramforecast.api.domain.model.Horizon;
import ru.tramforecast.api.domain.model.StopForecast;
import ru.tramforecast.api.domain.port.ForecastRepository;

/**
 * Short-lived read cache in front of a {@link ForecastRepository}. Empty results are never cached
 * (so a forecast stored a moment later is seen immediately), and every write drops the cache so a
 * new snapshot is visible right away.
 */
public class CachingForecastRepository implements ForecastRepository {

    private final ForecastRepository delegate;
    private final Cache<Key, List<StopForecast>> latest;
    private final Cache<Key, List<StopForecast>> initial;

    /**
     * Creates the cache.
     *
     * @param delegate   the real storage
     * @param ttl        how long a read is reused
     * @param maxEntries maximum cached reads per kind
     */
    public CachingForecastRepository(ForecastRepository delegate, Duration ttl, int maxEntries) {
        this.delegate = delegate;
        this.latest = Caffeine.newBuilder().maximumSize(maxEntries).expireAfterWrite(ttl).build();
        this.initial = Caffeine.newBuilder().maximumSize(maxEntries).expireAfterWrite(ttl).build();
    }

    @Override
    public List<StopForecast> findLatest(Horizon horizon, LocalDate date) {
        return cached(latest, new Key(horizon, date), () -> delegate.findLatest(horizon, date));
    }

    @Override
    public List<StopForecast> findInitial(Horizon horizon, LocalDate date) {
        return cached(initial, new Key(horizon, date), () -> delegate.findInitial(horizon, date));
    }

    @Override
    public void saveAll(List<StopForecast> forecasts) {
        delegate.saveAll(forecasts);
        latest.invalidateAll();
        initial.invalidateAll();
    }

    @Override
    public List<LocalDate> recentDates(Horizon horizon, int limit) {
        return delegate.recentDates(horizon, limit);
    }

    private static List<StopForecast> cached(
            Cache<Key, List<StopForecast>> cache, Key key, java.util.function.Supplier<List<StopForecast>> load) {
        List<StopForecast> hit = cache.getIfPresent(key);
        if (hit != null) {
            return hit;
        }
        List<StopForecast> loaded = List.copyOf(load.get());
        if (!loaded.isEmpty()) {
            cache.put(key, loaded);
        }
        return loaded;
    }

    /** Cache key: what was asked for. */
    private record Key(Horizon horizon, LocalDate date) {
    }
}
