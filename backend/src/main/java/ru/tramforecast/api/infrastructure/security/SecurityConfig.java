package ru.tramforecast.api.infrastructure.security;

import java.time.ZoneId;
import java.util.List;
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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Access check of the API. When {@code tram.auth.enabled} is true, every request under
 * {@code /api/**} must carry {@code Authorization: Basic base64(user:password)}; a missing or wrong
 * credential is answered with a 401 problem document. There is no login endpoint and no session:
 * the client sends the header on each request. Everything outside {@code /api/**} (health checks,
 * the OpenAPI document, the static frontend behind the proxy) stays open. With the check off (the
 * default, for local development) nothing is protected. When {@code tram.cors.allowed-origins} is
 * set, cross-origin browser calls are allowed from those addresses; the CORS filter runs before the
 * credential check, so the browser's credential-less preflight request is answered and even a 401
 * stays readable by the calling page.
 */
@Configuration
@EnableConfigurationProperties({AuthProperties.class, CorsProperties.class})
public class SecurityConfig {

    /**
     * The filter chain.
     *
     * @param http     Spring Security builder
     * @param auth     access settings
     * @param provider checker of the credentials
     * @param zone     API zone, used for the timestamp of a 401 response
     * @param cors     cross-origin settings
     * @return the chain
     * @throws Exception when the chain cannot be built
     */
    @Bean
    public SecurityFilterChain apiSecurity(
            HttpSecurity http, AuthProperties auth, AuthenticationProvider provider, ZoneId zone,
            CorsProperties cors)
            throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable);
        if (cors.enabled()) {
            http.cors(config -> config.configurationSource(corsSource(cors)));
        }
        if (!auth.enabled()) {
            return http.authorizeHttpRequests(requests -> requests.anyRequest().permitAll()).build();
        }
        ProblemAuthenticationEntryPoint entryPoint = new ProblemAuthenticationEntryPoint(zone);
        return http
                .authenticationProvider(provider)
                .httpBasic(basic -> basic.authenticationEntryPoint(entryPoint))
                .exceptionHandling(errors -> errors.authenticationEntryPoint(entryPoint))
                .authorizeHttpRequests(requests -> requests
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll())
                .build();
    }

    private static CorsConfigurationSource corsSource(CorsProperties cors) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(cors.allowedOrigins());
        config.setAllowedMethods(List.of("GET", "HEAD", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        // the export endpoint names its file in this header, and a page can only read it if exposed
        config.setExposedHeaders(List.of("Content-Disposition"));
        // credentials are sent as an explicit Authorization header, never as browser-managed cookies
        config.setAllowCredentials(false);
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
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
