package ru.tramforecast.api.infrastructure.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;

/**
 * Accepts one fixed user name and password. HTTP Basic sends the credentials with every request, so
 * the check has to be cheap (a slow password hash would be paid on each call); both values are
 * compared in constant time so the answer does not leak how much of them matched.
 */
public class StaticCredentialsAuthenticationProvider implements AuthenticationProvider {

    private final byte[] username;
    private final byte[] password;

    /**
     * Creates the provider.
     *
     * @param username the accepted user name
     * @param password the accepted password
     */
    public StaticCredentialsAuthenticationProvider(String username, String password) {
        this.username = username.getBytes(StandardCharsets.UTF_8);
        this.password = password.getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        byte[] givenUser = String.valueOf(authentication.getName()).getBytes(StandardCharsets.UTF_8);
        byte[] givenPassword = String.valueOf(authentication.getCredentials()).getBytes(StandardCharsets.UTF_8);
        boolean userMatches = MessageDigest.isEqual(username, givenUser);
        boolean passwordMatches = MessageDigest.isEqual(password, givenPassword);
        if (!(userMatches & passwordMatches)) {
            throw new BadCredentialsException("Invalid credentials");
        }
        return UsernamePasswordAuthenticationToken.authenticated(authentication.getName(), null, List.of());
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }
}
