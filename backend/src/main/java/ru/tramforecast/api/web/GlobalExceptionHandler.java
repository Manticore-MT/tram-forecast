package ru.tramforecast.api.web;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import ru.tramforecast.api.application.ForecastUnavailableException;
import ru.tramforecast.api.application.InvalidRequestException;
import ru.tramforecast.api.application.NotFoundException;

/**
 * Turns failures into RFC 9457 problem responses with a message a client can show to the user.
 * Every response also carries a machine-readable {@code code} (see {@link ErrorCode}) and the
 * {@code timestamp} of the failure. Nothing internal (stack traces, class names) leaves the service.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger LOG = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private final ZoneId zone;

    /**
     * Creates the handler.
     *
     * @param zone zone the error timestamp is rendered in (ISO 8601 with an explicit offset)
     */
    public GlobalExceptionHandler(ZoneId zone) {
        this.zone = zone;
    }

    /**
     * The request is well-formed but asks for something that cannot be served.
     *
     * @param e the failure
     * @return 400
     */
    @ExceptionHandler(InvalidRequestException.class)
    public ProblemDetail invalid(InvalidRequestException e) {
        return problem(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_REQUEST, "Invalid request", e.getMessage());
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
        return problem(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_PARAMETER, "Invalid parameter",
                "One of the request parameters is missing or has the wrong format. "
                        + "Expected: horizon = day|week|month|year, date = YYYY-MM-DD, snapshot = latest|initial, "
                        + "from/to = ISO 8601 with offset, coefficients = numbers between 0.1 and 3.");
    }

    /**
     * The route is unknown, the stop is not on the route, or there is no data to answer with.
     *
     * @param e the failure
     * @return 404
     */
    @ExceptionHandler(NotFoundException.class)
    public ProblemDetail notFound(NotFoundException e) {
        return switch (e.reason()) {
            case ROUTE -> problem(HttpStatus.NOT_FOUND, ErrorCode.ROUTE_NOT_FOUND, "Route not found", e.getMessage());
            case STOP -> problem(HttpStatus.NOT_FOUND, ErrorCode.STOP_NOT_FOUND, "Stop not found", e.getMessage());
            case NO_DATA -> problem(HttpStatus.NOT_FOUND, ErrorCode.NO_DATA, "No data", e.getMessage());
        };
    }

    /**
     * The URL is not an endpoint of this API.
     *
     * @param e the failure
     * @return 404
     */
    @ExceptionHandler({NoResourceFoundException.class, NoHandlerFoundException.class})
    public ProblemDetail noEndpoint(Exception e) {
        return problem(HttpStatus.NOT_FOUND, ErrorCode.ENDPOINT_NOT_FOUND, "Endpoint not found",
                "There is no such endpoint. The list of endpoints is in the OpenAPI document (/v3/api-docs).");
    }

    /**
     * The endpoint exists but not for this HTTP method.
     *
     * @param e the failure
     * @return 405
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ProblemDetail wrongMethod(HttpRequestMethodNotSupportedException e) {
        return problem(HttpStatus.METHOD_NOT_ALLOWED, ErrorCode.METHOD_NOT_ALLOWED, "Method not allowed",
                "This endpoint does not accept " + e.getMethod() + " requests.");
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
        return problem(HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.FORECAST_NOT_READY, "Forecast not ready",
                e.getMessage());
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
        return problem(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR, "Internal error",
                "Something went wrong on our side. Please try again later.");
    }

    private ProblemDetail problem(HttpStatus status, ErrorCode code, String title, String detail) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setTitle(title);
        problem.setProperty("code", code.name());
        problem.setProperty("timestamp", DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(
                OffsetDateTime.now(zone).truncatedTo(ChronoUnit.MILLIS)));
        return problem;
    }
}
