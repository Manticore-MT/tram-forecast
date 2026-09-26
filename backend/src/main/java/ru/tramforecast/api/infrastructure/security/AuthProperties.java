package ru.tramforecast.api.infrastructure.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Settings of the access check on the API ({@code tram.auth.*}).
 *
 * @param enabled  whether {@code /api/**} requires HTTP Basic credentials
 * @param username the single accepted user name
 * @param password the single accepted password
 */
@ConfigurationProperties(prefix = "tram.auth")
public record AuthProperties(boolean enabled, String username, String password) {
}
