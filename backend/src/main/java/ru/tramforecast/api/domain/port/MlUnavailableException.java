package ru.tramforecast.api.domain.port;

/**
 * Signals that the ML service could not deliver a forecast (timeout, connection error, error status).
 */
public class MlUnavailableException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /**
     * Creates the exception.
     *
     * @param message what went wrong
     * @param cause   the underlying failure, may be {@code null}
     */
    public MlUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
