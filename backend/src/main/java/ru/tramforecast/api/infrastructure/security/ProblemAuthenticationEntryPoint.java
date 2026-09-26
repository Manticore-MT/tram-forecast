package ru.tramforecast.api.infrastructure.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

/**
 * Answers a missing or wrong credential with {@code 401} and an RFC 9457 problem document, the same
 * error shape as every other API error (including the {@code code} and {@code timestamp} fields).
 * It deliberately sends no {@code WWW-Authenticate} header:
 * that header would make a browser open its own login dialog over the frontend's request.
 */
public class ProblemAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private static final String BODY = "{\"type\":\"about:blank\",\"title\":\"Unauthorized\",\"status\":401,"
            + "\"detail\":\"Authentication is required: send an 'Authorization: Basic' header with valid "
            + "credentials.\",\"code\":\"UNAUTHORIZED\",\"timestamp\":\"%s\",\"instance\":\"%s\"}";

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
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/problem+json");
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        String timestamp = DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(
                OffsetDateTime.now(zone).truncatedTo(ChronoUnit.MILLIS));
        response.getWriter().write(BODY.formatted(timestamp, escape(request.getRequestURI())));
    }

    private static String escape(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
