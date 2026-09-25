package ru.tramforecast.api.application;

/**
 * No forecast is stored for the request and ML could not produce one either.
 */
public class ForecastUnavailableException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /**
     * Creates the exception.
     *
     * @param message user-facing explanation
     * @param cause   the underlying failure, may be {@code null}
     */
    public ForecastUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
