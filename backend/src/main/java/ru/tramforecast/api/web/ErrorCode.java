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
    /** There is no such route. */
    ROUTE_NOT_FOUND,
    /** The route exists but has no such stop. */
    STOP_NOT_FOUND,
    /** The route and stop exist but there is no data to answer with (no history, nothing to export). */
    NO_DATA,
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
