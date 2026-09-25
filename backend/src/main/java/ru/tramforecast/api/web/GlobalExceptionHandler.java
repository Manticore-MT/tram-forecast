package ru.tramforecast.api.web;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import ru.tramforecast.api.application.ForecastUnavailableException;
import ru.tramforecast.api.application.InvalidRequestException;
import ru.tramforecast.api.application.NotFoundException;

/**
 * Turns failures into RFC 9457 problem responses with a message a client can show to the user.
 * Nothing internal (stack traces, class names) leaves the service.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger LOG = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * The request is well-formed but asks for something that cannot be served.
     *
     * @param e the failure
     * @return 400
     */
    @ExceptionHandler(InvalidRequestException.class)
    public ProblemDetail invalid(InvalidRequestException e) {
        return problem(HttpStatus.BAD_REQUEST, "Invalid request", e.getMessage());
    }

    /**
     * A parameter could not be parsed (unknown horizon, malformed date, and so on).
     *
     * @param e the failure
     * @return 400
     */
    @ExceptionHandler({
        MethodArgumentTypeMismatchException.class,
        MethodArgumentNotValidException.class,
        HandlerMethodValidationException.class,
        MissingServletRequestParameterException.class,
        org.springframework.validation.BindException.class
    })
    public ProblemDetail badParameter(Exception e) {
        return problem(HttpStatus.BAD_REQUEST, "Invalid parameter",
                "One of the request parameters is missing or has the wrong format. "
                        + "Expected: horizon = day|month|year, date = YYYY-MM-DD, snapshot = latest|initial, "
                        + "from/to = ISO 8601 with offset, coefficients = numbers between 0.1 and 3.");
    }

    /**
     * The route or stop is unknown.
     *
     * @param e the failure
     * @return 404
     */
    @ExceptionHandler(NotFoundException.class)
    public ProblemDetail notFound(NotFoundException e) {
        return problem(HttpStatus.NOT_FOUND, "Not found", e.getMessage());
    }

    /**
     * No forecast is stored and ML could not produce one.
     *
     * @param e the failure
     * @return 503
     */
    @ExceptionHandler(ForecastUnavailableException.class)
    public ProblemDetail unavailable(ForecastUnavailableException e) {
        LOG.warn("Forecast unavailable: {}", e.getMessage());
        return problem(HttpStatus.SERVICE_UNAVAILABLE, "Forecast not ready", e.getMessage());
    }

    /**
     * Anything unexpected.
     *
     * @param e the failure
     * @return 500 with a generic message
     */
    @ExceptionHandler(Exception.class)
    public ProblemDetail unexpected(Exception e) {
        LOG.error("Unexpected error", e);
        return problem(HttpStatus.INTERNAL_SERVER_ERROR, "Internal error",
                "Something went wrong on our side. Please try again later.");
    }

    private static ProblemDetail problem(HttpStatus status, String title, String detail) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setTitle(title);
        return problem;
    }
}
