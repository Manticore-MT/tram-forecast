package ru.tramforecast.api.infrastructure.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;

/**
 * Slows down guessing of the password. After a number of consecutive failed attempts from one
 * client the client is locked out for a fixed time: during the lockout even the correct password is
 * refused. A successful attempt clears the count, and old failures are forgotten after a while, so a
 * mistyped password now and then never adds up to a lockout.
 *
 * <p>Attempts are counted per client address, not per user name: there is one shared login, and
 * counting by it would let anybody lock everyone else out with a few wrong attempts.
 */
public class LoginAttemptLimiter {

    /** Failures further apart than this do not add up. */
    private static final Duration FAILURE_WINDOW = Duration.ofMinutes(15);
    private static final long MAX_CLIENTS = 10_000;

    private final int maxFailures;
    private final Duration lockout;
    private final Clock clock;
    private final Cache<String, State> clients =
            Caffeine.newBuilder().maximumSize(MAX_CLIENTS).expireAfterWrite(Duration.ofHours(1)).build();

    /**
     * Creates the limiter.
     *
     * @param maxFailures consecutive failed attempts that trigger a lockout
     * @param lockout     how long the client is refused
     * @param clock       source of time (the real one in production; tests move their own)
     */
    public LoginAttemptLimiter(int maxFailures, Duration lockout, Clock clock) {
        this.maxFailures = maxFailures;
        this.lockout = lockout;
        this.clock = clock;
    }

    /**
     * How long the client must still wait.
     *
     * @param client the client address
     * @return the remaining lockout in whole seconds, rounded up; {@code 0} when the client may try
     */
    public long remainingSeconds(String client) {
        State state = clients.getIfPresent(client);
        if (state == null || state.lockedUntil == null) {
            return 0;
        }
        long millis = Duration.between(clock.instant(), state.lockedUntil).toMillis();
        return millis <= 0 ? 0 : (millis + 999) / 1000;
    }

    /**
     * Records a failed attempt; the last allowed one starts the lockout.
     *
     * @param client the client address
     */
    public void recordFailure(String client) {
        Instant now = clock.instant();
        clients.asMap().compute(client, (key, old) -> {
            State state = old == null ? new State() : old;
            if (state.lockedUntil != null && now.isBefore(state.lockedUntil)) {
                return state;
            }
            if (state.lastFailure != null && Duration.between(state.lastFailure, now).compareTo(FAILURE_WINDOW) > 0) {
                state.failures = 0;
            }
            state.lockedUntil = null;
            state.lastFailure = now;
            state.failures++;
            if (state.failures >= maxFailures) {
                state.lockedUntil = now.plus(lockout);
                state.failures = 0;
            }
            return state;
        });
    }

    /**
     * Records a successful attempt, which clears the client's failures.
     *
     * @param client the client address
     */
    public void recordSuccess(String client) {
        clients.invalidate(client);
    }

    /** What is known about one client. */
    private static final class State {
        private int failures;
        private Instant lastFailure;
        private Instant lockedUntil;
    }
}
