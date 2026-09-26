package ru.tramforecast.api.infrastructure;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import ru.tramforecast.api.infrastructure.security.AuthProperties;
import ru.tramforecast.api.infrastructure.security.SecurityConfig;

/**
 * Checks the rules of the credential checker that need no running application.
 */
class SecurityConfigTest {

    private final SecurityConfig config = new SecurityConfig();

    /**
     * Access control on with an empty user name or password must not start: running open by mistake
     * is worse than not running.
     */
    @Test
    void refusesToStartWithoutCredentialsWhenEnabled() {
        assertThatThrownBy(() -> config.apiAuthenticationProvider(new AuthProperties(true, "", "secret")))
                .isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> config.apiAuthenticationProvider(new AuthProperties(true, "user", " ")))
                .isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> config.apiAuthenticationProvider(new AuthProperties(true, null, null)))
                .isInstanceOf(IllegalStateException.class);
    }

    /**
     * The configured pair is accepted and anything else is not.
     */
    @Test
    void acceptsOnlyTheConfiguredPair() {
        var provider = config.apiAuthenticationProvider(new AuthProperties(true, "user", "secret"));

        assertThat(provider.authenticate(UsernamePasswordAuthenticationToken.unauthenticated("user", "secret"))
                .isAuthenticated()).isTrue();
        assertThatThrownBy(() -> provider.authenticate(
                        UsernamePasswordAuthenticationToken.unauthenticated("user", "Secret")))
                .isInstanceOf(BadCredentialsException.class);
        assertThatThrownBy(() -> provider.authenticate(
                        UsernamePasswordAuthenticationToken.unauthenticated("USER", "secret")))
                .isInstanceOf(BadCredentialsException.class);
    }

    /**
     * With the check off the provider is never asked, but if it were, nothing would pass.
     */
    @Test
    void disabledProviderAcceptsNothing() {
        var provider = config.apiAuthenticationProvider(new AuthProperties(false, "", ""));

        assertThatThrownBy(() -> provider.authenticate(UsernamePasswordAuthenticationToken.unauthenticated("", "")))
                .isInstanceOf(BadCredentialsException.class);
    }
}
