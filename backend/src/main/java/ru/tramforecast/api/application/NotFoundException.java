package ru.tramforecast.api.application;

/**
 * The requested route or stop has no forecast.
 */
public class NotFoundException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /**
     * Creates the exception.
     *
     * @param message user-facing explanation
     */
    public NotFoundException(String message) {
        super(message);
    }
}
