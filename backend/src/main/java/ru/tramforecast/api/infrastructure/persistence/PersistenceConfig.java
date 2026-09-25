package ru.tramforecast.api.infrastructure.persistence;

import java.time.ZoneId;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import ru.tramforecast.api.domain.port.ActualRepository;
import ru.tramforecast.api.domain.port.ForecastRepository;
import ru.tramforecast.api.infrastructure.config.TramProperties;

/**
 * Registers the Postgres adapters of the storage ports.
 */
@Configuration
public class PersistenceConfig {

    /**
     * Forecast snapshot storage.
     *
     * @param jdbc       Spring JDBC template
     * @param properties application settings
     * @return the repository, with a short read cache in front
     */
    @Bean
    public ForecastRepository forecastRepository(JdbcTemplate jdbc, TramProperties properties) {
        return new CachingForecastRepository(
                new JdbcForecastRepository(jdbc),
                properties.cache().forecastTtl(),
                properties.cache().maxEntries());
    }

    /**
     * Observed values storage.
     *
     * @param jdbc       Spring JDBC template
     * @param zone       API zone
     * @param properties application settings
     * @return the repository, with a short read cache in front
     */
    @Bean
    public ActualRepository actualRepository(JdbcTemplate jdbc, ZoneId zone, TramProperties properties) {
        return new CachingActualRepository(
                new JdbcActualRepository(jdbc, zone),
                properties.cache().actualTtl(),
                properties.cache().maxEntries());
    }
}
