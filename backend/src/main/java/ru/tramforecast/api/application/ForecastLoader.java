package ru.tramforecast.api.application;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.locks.ReentrantLock;
import ru.tramforecast.api.domain.model.Horizon;
import ru.tramforecast.api.domain.model.SnapshotKind;
import ru.tramforecast.api.domain.model.StopForecast;
import ru.tramforecast.api.domain.port.ForecastRepository;
import ru.tramforecast.api.domain.port.MlForecastClient;
import ru.tramforecast.api.domain.port.MlRequestRejectedException;
import ru.tramforecast.api.domain.port.MlUnavailableException;

/**
 * Reads forecasts from storage and, only when storage has nothing for the request, asks ML to
 * compute them and stores the answer as a new snapshot (a read-through cache). Requests for the
 * same missing forecast are serialized so ML is asked once, not once per waiting caller.
 */
public class ForecastLoader {

    private static final int LOCK_STRIPES = 16;

    private final ForecastRepository repository;
    private final MlForecastClient ml;
    private final ReentrantLock[] locks = new ReentrantLock[LOCK_STRIPES];

    /**
     * Creates the loader.
     *
     * @param repository storage of forecast snapshots
     * @param ml         the ML service
     */
    public ForecastLoader(ForecastRepository repository, MlForecastClient ml) {
        this.repository = repository;
        this.ml = ml;
        for (int i = 0; i < LOCK_STRIPES; i++) {
            locks[i] = new ReentrantLock();
        }
    }

    /**
     * Loads the forecasts of the whole network.
     *
     * @param horizon planning horizon
     * @param date    anchor date
     * @param kind    which snapshot to read
     * @return forecasts for every stop, never empty
     * @throws ForecastUnavailableException when nothing is stored and ML cannot produce a forecast
     */
    public List<StopForecast> load(Horizon horizon, LocalDate date, SnapshotKind kind) {
        List<StopForecast> stored = read(horizon, date, kind);
        if (!stored.isEmpty()) {
            return stored;
        }
        ReentrantLock lock = locks[Math.floorMod(31 * horizon.hashCode() + date.hashCode(), LOCK_STRIPES)];
        lock.lock();
        try {
            stored = read(horizon, date, kind);
            if (!stored.isEmpty()) {
                return stored;
            }
            fetchAndStore(horizon, date);
            stored = read(horizon, date, kind);
            if (stored.isEmpty()) {
                throw new ForecastUnavailableException("ML returned no forecast for " + horizon + " " + date, null);
            }
            return stored;
        } finally {
            lock.unlock();
        }
    }

    private void fetchAndStore(Horizon horizon, LocalDate date) {
        try {
            repository.saveAll(ml.predict(horizon, date));
        } catch (MlRequestRejectedException e) {
            if ("UNSUPPORTED_PERIOD".equals(e.code()) || "SCENARIO_DISABLED".equals(e.code())) {
                throw new PeriodNotSupportedException(e.getMessage());
            }
            throw new InvalidRequestException(e.getMessage());
        } catch (MlUnavailableException e) {
            throw new ForecastUnavailableException(
                    "The forecast is not ready and the ML service is unavailable, try again later", e);
        }
    }

    private List<StopForecast> read(Horizon horizon, LocalDate date, SnapshotKind kind) {
        return kind == SnapshotKind.INITIAL
                ? repository.findInitial(horizon, date)
                : repository.findLatest(horizon, date);
    }
}
