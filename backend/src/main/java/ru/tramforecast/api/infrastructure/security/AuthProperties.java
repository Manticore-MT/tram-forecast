package ru.tramforecast.api.infrastructure.security;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Settings of the access check on the API ({@code tram.auth.*}).
 *
 * @param enabled           whether {@code /api/**} requires HTTP Basic credentials
 * @param username          the single accepted user name
 * @param password          the single accepted password
 * @param maxFailedAttempts consecutive failed attempts from one client after which it is locked out
 *                          (default 3)
 * @param lockout           how long a locked-out client is refused, even with the right password
 *                          (default 10 seconds)
 */
@ConfigurationProperties(prefix = "tram.auth")
public record AuthProperties(
        boolean enabled, String username, String password, Integer maxFailedAttempts, Duration lockout) {

    /**
     * Applies the defaults for the throttling settings.
     */
    public AuthProperties {
        maxFailedAttempts = maxFailedAttempts == null || maxFailedAttempts < 1 ? 3 : maxFailedAttempts;
        lockout = lockout == null ? Duration.ofSeconds(10) : lockout;
    }
}
