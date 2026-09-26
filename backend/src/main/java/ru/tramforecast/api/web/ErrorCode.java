package ru.tramforecast.api.web;

/**
 * Machine-readable code carried by every error response next to the human message, so a client can
 * group, filter or style errors without parsing text. The set is part of the API contract: codes
 * are added, never renamed.
 */
public enum ErrorCode {
    /** The request is well-formed but asks for something that cannot be served (for example a date too far ahead). */
    INVALID_REQUEST,
    /** A parameter is missing or has the wrong format. */
    INVALID_PARAMETER,
    /** The route or stop is unknown, or there is nothing to return for it. */
    NOT_FOUND,
    /** The URL is not an endpoint of this API. */
    ENDPOINT_NOT_FOUND,
    /** The endpoint exists but not for this HTTP method. */
    METHOD_NOT_ALLOWED,
    /** No forecast is stored for the request and the ML service could not produce one. */
    FORECAST_NOT_READY,
    /** The Authorization header is missing or wrong. */
    UNAUTHORIZED,
    /** Something unexpected went wrong on the server. */
    INTERNAL_ERROR
}
