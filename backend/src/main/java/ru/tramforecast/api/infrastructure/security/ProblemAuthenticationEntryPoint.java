package ru.tramforecast.api.infrastructure.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.ZoneId;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

/**
 * Answers a missing or wrong credential with {@code 401} and an RFC 9457 problem document, the same
 * error shape as every other API error (including the {@code code} and {@code timestamp} fields).
 * It deliberately sends no {@code WWW-Authenticate} header: that header would make a browser open
 * its own login dialog over the frontend's request.
 */
public class ProblemAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ZoneId zone;

    /**
     * Creates the entry point.
     *
     * @param zone zone the error timestamp is rendered in
     */
    public ProblemAuthenticationEntryPoint(ZoneId zone) {
        this.zone = zone;
    }

    @Override
    public void commence(
            HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
            throws IOException {
        ProblemJson.write(request, response, zone, HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized",
                "Authentication is required: send an 'Authorization: Basic' header with valid credentials.",
                "UNAUTHORIZED");
    }
}
