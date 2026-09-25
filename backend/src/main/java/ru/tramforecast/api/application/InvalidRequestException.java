package ru.tramforecast.api.application;

/**
 * The caller asked for something that cannot be served (bad interval, date out of range).
 */
public class InvalidRequestException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /**
     * Creates the exception.
     *
     * @param message user-facing explanation
     */
    public InvalidRequestException(String message) {
        super(message);
    }
}
