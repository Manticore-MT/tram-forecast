package ru.tramforecast.api.infrastructure.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

/**
 * Writes an RFC 9457 problem document from the security layer, in the same shape as every other API
 * error ({@code status}, {@code title}, {@code detail}, {@code code}, {@code timestamp},
 * {@code instance}). The security filters run before Spring MVC, so its exception handler cannot
 * produce these.
 */
final class ProblemJson {

    private ProblemJson() {
    }

    /**
     * Writes the response.
     *
     * @param request  the request that failed
     * @param response the response to fill
     * @param zone     zone the timestamp is rendered in
     * @param status   HTTP status
     * @param title    short name, fixed per kind of error
     * @param detail   sentence for the user
     * @param code     machine-readable error code
     * @throws IOException when the response cannot be written
     */
    static void write(
            HttpServletRequest request,
            HttpServletResponse response,
            ZoneId zone,
            int status,
            String title,
            String detail,
            String code)
            throws IOException {
        String timestamp = DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(
                OffsetDateTime.now(zone).truncatedTo(ChronoUnit.MILLIS));
        response.setStatus(status);
        response.setContentType("application/problem+json");
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write("{\"type\":\"about:blank\",\"title\":\"" + escape(title)
                + "\",\"status\":" + status
                + ",\"detail\":\"" + escape(detail)
                + "\",\"code\":\"" + escape(code)
                + "\",\"timestamp\":\"" + timestamp
                + "\",\"instance\":\"" + escape(request.getRequestURI()) + "\"}");
    }

    private static String escape(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
