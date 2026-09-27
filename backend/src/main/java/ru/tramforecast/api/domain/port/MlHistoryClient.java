package ru.tramforecast.api.domain.port;

import java.time.LocalDate;
import ru.tramforecast.api.domain.model.HistoryComparison;

/** Historical comparisons provided by ML's frozen observations. */
public interface MlHistoryClient {
    HistoryComparison comparison(String routeId, LocalDate date);
}
