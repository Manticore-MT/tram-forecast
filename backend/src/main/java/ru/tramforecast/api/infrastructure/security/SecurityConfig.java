package ru.tramforecast.api.infrastructure.security;

import java.util.UUID;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Access check of the API. When {@code tram.auth.enabled} is true, every request under
 * {@code /api/**} must carry {@code Authorization: Basic base64(user:password)}; a missing or wrong
 * credential is answered with a 401 problem document. There is no login endpoint and no session:
 * the client sends the header on each request. Everything outside {@code /api/**} (health checks,
 * the OpenAPI document, the static frontend behind the proxy) stays open. With the check off (the
 * default, for local development) nothing is protected.
 */
@Configuration
@EnableConfigurationProperties(AuthProperties.class)
public class SecurityConfig {

    /**
     * The filter chain.
     *
     * @param http     Spring Security builder
     * @param auth     access settings
     * @param provider checker of the credentials
     * @return the chain
     * @throws Exception when the chain cannot be built
     */
    @Bean
    public SecurityFilterChain apiSecurity(HttpSecurity http, AuthProperties auth, AuthenticationProvider provider)
            throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable);
        if (!auth.enabled()) {
            return http.authorizeHttpRequests(requests -> requests.anyRequest().permitAll()).build();
        }
        ProblemAuthenticationEntryPoint entryPoint = new ProblemAuthenticationEntryPoint();
        return http
                .authenticationProvider(provider)
                .httpBasic(basic -> basic.authenticationEntryPoint(entryPoint))
                .exceptionHandling(errors -> errors.authenticationEntryPoint(entryPoint))
                .authorizeHttpRequests(requests -> requests
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll())
                .build();
    }

    /**
     * The credential checker. With the check on, the configured user name and password are
     * required (the service refuses to start without them, rather than run open by mistake). With
     * it off the chain never asks for credentials, so the provider gets random values nobody
     * knows.
     *
     * @param auth access settings
     * @return the provider
     */
    @Bean
    public AuthenticationProvider apiAuthenticationProvider(AuthProperties auth) {
        if (!auth.enabled()) {
            return new StaticCredentialsAuthenticationProvider(
                    UUID.randomUUID().toString(), UUID.randomUUID().toString());
        }
        if (isBlank(auth.username()) || isBlank(auth.password())) {
            throw new IllegalStateException(
                    "tram.auth.enabled is true but TRAM_AUTH_USERNAME or TRAM_AUTH_PASSWORD is empty");
        }
        return new StaticCredentialsAuthenticationProvider(auth.username(), auth.password());
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
