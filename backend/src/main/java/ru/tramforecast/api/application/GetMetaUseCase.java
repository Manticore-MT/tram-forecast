package ru.tramforecast.api.application;

/**
 * Use case: service metadata for the client (current moment, date range, data source).
 */
public interface GetMetaUseCase {

    /**
     * Returns the metadata.
     *
     * @return the metadata
     */
    ServiceMeta get();
}
