package ru.tramforecast.api.application;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import ru.tramforecast.api.domain.model.Horizon;
import ru.tramforecast.api.domain.model.StopForecast;
import ru.tramforecast.api.domain.port.ForecastRepository;
import ru.tramforecast.api.domain.port.MlForecastClient;
import ru.tramforecast.api.domain.port.MlRequestRejectedException;
import ru.tramforecast.api.domain.port.MlUnavailableException;

/**
 * Implements {@link RefreshForecastUseCase} with two guards: a run is skipped while another is
 * still in progress (so a slow ML service is never hit twice at once), and an ML failure leaves
 * the last successful snapshot untouched.
 */
public class RefreshForecastService implements RefreshForecastUseCase {

    private static final Logger LOG = LoggerFactory.getLogger(RefreshForecastService.class);

    private final ForecastRepository repository;
    private final MlForecastClient ml;
    private final AtomicBoolean running = new AtomicBoolean(false);

    /**
     * Creates the service.
     *
     * @param repository storage of forecast snapshots
     * @param ml         the ML service
     */
    public RefreshForecastService(ForecastRepository repository, MlForecastClient ml) {
        this.repository = repository;
        this.ml = ml;
    }

    @Override
    public boolean refresh(Horizon horizon, LocalDate date) {
        if (!running.compareAndSet(false, true)) {
            LOG.info("Skipping refresh of {} {}: previous run still in progress", horizon, date);
            return false;
        }
        try {
            List<StopForecast> fresh = ml.predict(horizon, date);
            repository.saveAll(fresh);
            return !fresh.isEmpty();
        } catch (MlRequestRejectedException e) {
            LOG.warn("ML refused to refresh {} {}: {}", horizon, date, e.getMessage());
            return false;
        } catch (MlUnavailableException e) {
            LOG.warn("ML unavailable while refreshing {} {}, keeping the last snapshot: {}", horizon, date,
                    e.getMessage());
            return false;
        } finally {
            running.set(false);
        }
    }
}
