package ru.tramforecast.api.infrastructure;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import org.junit.jupiter.api.Test;
import ru.tramforecast.api.infrastructure.security.LoginAttemptLimiter;

/**
 * Tests of the lockout rule with a clock the test moves by hand: three failed attempts in a row lock
 * a client for ten seconds, nothing else does.
 */
class LoginAttemptLimiterTest {

    private static final Duration LOCKOUT = Duration.ofSeconds(10);

    /** A clock that only moves when the test says so. */
    private static final class ManualClock extends Clock {
        private Instant now = Instant.parse("2026-09-26T12:00:00Z");

        void advance(Duration by) {
            now = now.plus(by);
        }

        @Override
        public ZoneId getZone() {
            return ZoneId.of("UTC");
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return now;
        }
    }

    private final ManualClock clock = new ManualClock();
    private final LoginAttemptLimiter limiter = new LoginAttemptLimiter(3, LOCKOUT, clock);

    /**
     * Two failures are still allowed; the third starts a ten second lockout.
     */
    @Test
    void thirdFailureInARowStartsTheLockout() {
        limiter.recordFailure("a");
        limiter.recordFailure("a");
        assertThat(limiter.remainingSeconds("a")).isZero();

        limiter.recordFailure("a");

        assertThat(limiter.remainingSeconds("a")).isEqualTo(10);
    }

    /**
     * The wait counts down (rounded up) and the client may try again when it is over, with the
     * counter back at zero.
     */
    @Test
    void lockoutEndsAndTheCounterStartsAgain() {
        for (int i = 0; i < 3; i++) {
            limiter.recordFailure("a");
        }

        clock.advance(Duration.ofMillis(3500));
        assertThat(limiter.remainingSeconds("a")).isEqualTo(7);

        clock.advance(Duration.ofSeconds(7));
        assertThat(limiter.remainingSeconds("a")).isZero();

        // a full set of attempts is allowed again: two failures do not lock
        limiter.recordFailure("a");
        limiter.recordFailure("a");
        assertThat(limiter.remainingSeconds("a")).isZero();
    }

    /**
     * A success clears the failures, so failures on either side of it never add up.
     */
    @Test
    void successClearsTheFailures() {
        limiter.recordFailure("a");
        limiter.recordFailure("a");
        limiter.recordSuccess("a");
        limiter.recordFailure("a");
        limiter.recordFailure("a");

        assertThat(limiter.remainingSeconds("a")).isZero();
    }

    /**
     * Clients are counted separately: one client's failures never lock another.
     */
    @Test
    void clientsAreCountedSeparately() {
        for (int i = 0; i < 3; i++) {
            limiter.recordFailure("a");
        }

        assertThat(limiter.remainingSeconds("a")).isPositive();
        assertThat(limiter.remainingSeconds("b")).isZero();
    }

    /**
     * A failure during a lockout does not extend it, so a client that keeps trying is not locked
     * out for longer than the fixed ten seconds.
     */
    @Test
    void failuresDuringTheLockoutDoNotExtendIt() {
        for (int i = 0; i < 3; i++) {
            limiter.recordFailure("a");
        }
        clock.advance(Duration.ofSeconds(4));

        limiter.recordFailure("a");

        assertThat(limiter.remainingSeconds("a")).isEqualTo(6);
    }

    /**
     * Failures separated by a long pause are unrelated and do not add up to a lockout.
     */
    @Test
    void oldFailuresAreForgotten() {
        limiter.recordFailure("a");
        limiter.recordFailure("a");
        clock.advance(Duration.ofMinutes(16));

        limiter.recordFailure("a");

        assertThat(limiter.remainingSeconds("a")).isZero();
    }
}
