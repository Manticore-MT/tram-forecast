package ru.tramforecast.api.application;

/**
 * The requested period lies (fully or partly) outside the range the model covers. Asking again
 * later does not help; the client has to pick another period.
 */
public class PeriodNotSupportedException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /**
     * Creates the exception.
     *
     * @param message user-facing explanation, including the supported range
     */
    public PeriodNotSupportedException(String message) {
        super(message);
    }
}
