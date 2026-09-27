package ru.tramforecast.api.domain.port;

/**
 * Signals that the ML service understood the request and refused it (for example a period outside
 * the range its model covers). Unlike {@link MlUnavailableException} this is not a temporary
 * failure: asking again later gives the same answer.
 */
public class MlRequestRejectedException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    private final String code;

    /**
     * Creates the exception.
     *
     * @param code    the ML service's own code for the refusal, for example {@code UNSUPPORTED_PERIOD}
     * @param message the reason, as the ML service put it
     */
    public MlRequestRejectedException(String code, String message) {
        super(message);
        this.code = code;
    }

    /**
     * The ML service's code for the refusal.
     *
     * @return the code, never {@code null}
     */
    public String code() {
        return code;
    }
}
