package ru.tramforecast.api.infrastructure.config;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Time-related beans: the zone the API speaks in and the clock "now" comes from. Freezing the
 * clock lets the demo emulate a current moment on historical data.
 */
@Configuration
@EnableConfigurationProperties(TramProperties.class)
public class TimeConfig {

    /**
     * The zone all API timestamps are rendered in.
     *
     * @param properties application settings
     * @return the configured zone
     */
    @Bean
    public ZoneId apiZone(TramProperties properties) {
        return ZoneId.of(properties.zone());
    }

    /**
     * The clock used to decide what "today" is.
     *
     * @param properties application settings
     * @return a fixed clock when {@code tram.clock.fixed-instant} is set, otherwise the system clock
     */
    @Bean
    public Clock clock(TramProperties properties) {
        String fixed = properties.clock() == null ? null : properties.clock().fixedInstant();
        if (fixed == null || fixed.isBlank()) {
            return Clock.systemUTC();
        }
        return Clock.fixed(Instant.parse(fixed), ZoneId.of("UTC"));
    }
}
