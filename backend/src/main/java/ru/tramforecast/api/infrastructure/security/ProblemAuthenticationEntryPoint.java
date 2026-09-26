package ru.tramforecast.api.infrastructure.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

/**
 * Answers a missing or wrong credential with {@code 401} and an RFC 9457 problem document, the same
 * error shape as every other API error. It deliberately sends no {@code WWW-Authenticate} header:
 * that header would make a browser open its own login dialog over the frontend's request.
 */
public class ProblemAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private static final String BODY = "{\"type\":\"about:blank\",\"title\":\"Unauthorized\",\"status\":401,"
            + "\"detail\":\"Authentication is required: send an 'Authorization: Basic' header with valid "
            + "credentials.\",\"instance\":\"%s\"}";

    @Override
    public void commence(
            HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
            throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/problem+json");
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write(BODY.formatted(escape(request.getRequestURI())));
    }

    private static String escape(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
