package ru.tramforecast.api.domain.model;

/**
 * Identifier of a tram stop. The value comes from the stop dataset shared by frontend, ML and
 * backend; the backend never interprets it.
 *
 * @param value the raw identifier, never blank
 */
public record StopId(String value) {

    /**
     * Validates the identifier.
     */
    public StopId {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Stop id must not be blank");
        }
    }
}
