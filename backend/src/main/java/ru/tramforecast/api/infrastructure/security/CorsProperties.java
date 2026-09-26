package ru.tramforecast.api.infrastructure.security;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Cross-origin settings of the API ({@code tram.cors.*}). CORS is a browser rule: a page served
 * from one address may read the API's answers from another address only if the API allows that
 * address. On the deployed stand the site and the API share one address (behind the proxy), so it
 * is not needed there; it exists for a frontend developed on {@code localhost} against a remote API.
 *
 * @param allowedOrigins addresses allowed to call the API from a browser, for example
 *                       {@code http://localhost:5173}; {@code *} allows any address; empty (the
 *                       default) switches CORS off
 */
@ConfigurationProperties(prefix = "tram.cors")
public record CorsProperties(List<String> allowedOrigins) {

    /**
     * Treats a missing value as no origins.
     */
    public CorsProperties {
        allowedOrigins = allowedOrigins == null ? List.of() : allowedOrigins.stream()
                .map(String::strip)
                .filter(origin -> !origin.isEmpty())
                .toList();
    }

    /**
     * Tells whether CORS is switched on.
     *
     * @return {@code true} when at least one origin is allowed
     */
    public boolean enabled() {
        return !allowedOrigins.isEmpty();
    }
}
