package ru.tramforecast.api.web;

import java.time.LocalDate;
import java.util.Set;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.tramforecast.api.application.ForecastUnavailableException;
import ru.tramforecast.api.application.InvalidRequestException;
import ru.tramforecast.api.domain.model.HistoryComparison;
import ru.tramforecast.api.domain.port.MlHistoryClient;
import ru.tramforecast.api.domain.port.MlUnavailableException;

/** History is never passed through forecast date restrictions or scenario coefficients. */
@RestController
public class HistoryController {
    private final ObjectProvider<MlHistoryClient> clients;
    public HistoryController(ObjectProvider<MlHistoryClient> clients) { this.clients = clients; }

    @GetMapping("/api/history/comparison")
    public HistoryComparison comparison(@RequestParam LocalDate date,
            @RequestParam(defaultValue = "all") String routeId) {
        if (!Set.of("all", "1", "7", "11", "12", "17", "25", "26", "28", "50").contains(routeId)
                || date.isBefore(LocalDate.of(2025, 1, 1)) || date.isAfter(LocalDate.of(2026, 12, 31))) {
            throw new InvalidRequestException("Unsupported history route or date");
        }
        MlHistoryClient client = clients.getIfAvailable();
        if (client == null) throw new ForecastUnavailableException("История недоступна в stub-режиме", null);
        try {
            return client.comparison(routeId, date);
        } catch (MlUnavailableException e) {
            throw new ForecastUnavailableException("Не удалось загрузить исторические данные", e);
        }
    }
}
