package ru.tramforecast.api.infrastructure.persistence;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import ru.tramforecast.api.domain.model.ActualValue;
import ru.tramforecast.api.domain.model.Horizon;
import ru.tramforecast.api.domain.model.LoadMatrix;
import ru.tramforecast.api.domain.model.RouteId;
import ru.tramforecast.api.domain.port.ActualRepository;

/**
 * Short-lived read cache in front of an {@link ActualRepository}. Facts come from a one-off dataset
 * load, while aggregating them (a year of hourly values) is the most expensive query of the
 * service, so reusing the result for a few minutes removes almost all of that work.
 */
public class CachingActualRepository implements ActualRepository {

    private final ActualRepository delegate;
    private final Cache<Key, List<ActualValue>> values;
    private final Cache<RouteId, LoadMatrix> matrices;

    /**
     * Creates the cache.
     *
     * @param delegate   the real storage
     * @param ttl        how long a read is reused
     * @param maxEntries maximum cached reads per kind
     */
    public CachingActualRepository(ActualRepository delegate, Duration ttl, int maxEntries) {
        this.delegate = delegate;
        this.values = Caffeine.newBuilder().maximumSize(maxEntries).expireAfterWrite(ttl).build();
        this.matrices = Caffeine.newBuilder().maximumSize(maxEntries).expireAfterWrite(ttl).build();
    }

    @Override
    public List<ActualValue> find(Horizon horizon, LocalDate date) {
        return values.get(new Key(horizon, date), k -> List.copyOf(delegate.find(horizon, date)));
    }

    @Override
    public LoadMatrix loadMatrix(RouteId routeId) {
        return matrices.get(routeId, delegate::loadMatrix);
    }

    /** Cache key: what was asked for. */
    private record Key(Horizon horizon, LocalDate date) {
    }
}
