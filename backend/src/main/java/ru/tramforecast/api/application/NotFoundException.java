package ru.tramforecast.api.application;

import java.util.Collection;
import java.util.Comparator;
import java.util.stream.Collectors;
import ru.tramforecast.api.domain.model.RouteId;
import ru.tramforecast.api.domain.model.StopId;

/**
 * The request names something that cannot be served. The {@link Reason} says what exactly is
 * missing, so the client can tell an unknown route from an unknown stop from a lack of data.
 */
public class NotFoundException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /** What is missing. */
    public enum Reason {
        /** There is no such route. */
        ROUTE,
        /** The route exists but has no such stop. */
        STOP,
        /** The route and stop exist but there is no data to answer with. */
        NO_DATA
    }

    private final Reason reason;

    private NotFoundException(Reason reason, String message) {
        super(message);
        this.reason = reason;
    }

    /**
     * An unknown route.
     *
     * @param routeId the route that was asked for
     * @param known   the routes the service does know
     * @return the exception
     */
    public static NotFoundException route(RouteId routeId, Collection<RouteId> known) {
        String list = known.stream()
                .map(RouteId::value)
                .sorted(Comparator.comparingInt(String::length).thenComparing(Comparator.naturalOrder()))
                .collect(Collectors.joining(", "));
        return new NotFoundException(
                Reason.ROUTE, "There is no route '" + routeId.value() + "'. Known routes: " + list);
    }

    /**
     * A stop that is not on an existing route.
     *
     * @param routeId the route
     * @param stopId  the stop that was asked for
     * @return the exception
     */
    public static NotFoundException stop(RouteId routeId, StopId stopId) {
        return new NotFoundException(
                Reason.STOP, "Route '" + routeId.value() + "' has no stop '" + stopId.value() + "'");
    }

    /**
     * Nothing to answer with, although the route and stop exist.
     *
     * @param message user-facing explanation
     * @return the exception
     */
    public static NotFoundException noData(String message) {
        return new NotFoundException(Reason.NO_DATA, message);
    }

    /**
     * What is missing.
     *
     * @return the reason
     */
    public Reason reason() {
        return reason;
    }
}
