package ru.tramforecast.api.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.ZoneId;
import org.springframework.http.HttpHeaders;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Applies {@link LoginAttemptLimiter} to {@code /api/**}. It runs before the credential check: a
 * client that is locked out gets {@code 429} with a {@code Retry-After} header without the password
 * being looked at, and after the check a {@code 401} on a request that carried credentials counts as
 * a failed attempt while any other answer clears the count. A request without an
 * {@code Authorization} header is not an attempt and is never counted.
 *
 * <p>The client address is the request's remote address; behind the reverse proxy it is restored
 * from {@code X-Forwarded-For} by the server (only when the proxy is a trusted internal one).
 */
public class LoginThrottleFilter extends OncePerRequestFilter {

    private final LoginAttemptLimiter limiter;
    private final ZoneId zone;

    /**
     * Creates the filter.
     *
     * @param limiter counts the attempts
     * @param zone    zone the error timestamp is rendered in
     */
    public LoginThrottleFilter(LoginAttemptLimiter limiter, ZoneId zone) {
        this.limiter = limiter;
        this.zone = zone;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !(path.equals("/api") || path.startsWith("/api/"));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String client = request.getRemoteAddr();
        long wait = limiter.remainingSeconds(client);
        if (wait > 0) {
            response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(wait));
            ProblemJson.write(request, response, zone, 429, "Too many attempts",
                    "Too many failed login attempts. Try again in " + wait + " seconds.", "TOO_MANY_ATTEMPTS");
            return;
        }
        boolean carriesCredentials = request.getHeader(HttpHeaders.AUTHORIZATION) != null;
        chain.doFilter(request, response);
        if (carriesCredentials) {
            if (response.getStatus() == HttpServletResponse.SC_UNAUTHORIZED) {
                limiter.recordFailure(client);
            } else {
                limiter.recordSuccess(client);
            }
        }
    }
}
