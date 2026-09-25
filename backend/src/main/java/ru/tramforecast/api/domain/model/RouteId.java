package ru.tramforecast.api.domain.model;

/**
 * Identifier of a tram route. The value comes from the route dataset shared by frontend, ML and
 * backend; the backend never interprets it.
 *
 * @param value the raw identifier, never blank
 */
public record RouteId(String value) {

    /**
     * Validates the identifier.
     */
    public RouteId {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Route id must not be blank");
        }
    }
}
