package ru.tramforecast.api.web;

import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.support.StaticListableBeanFactory;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.client.RestClient;
import ru.tramforecast.api.domain.port.MlHistoryClient;
import ru.tramforecast.api.infrastructure.ml.HttpMlHistoryClient;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.assertj.core.api.Assertions.assertThat;

/** Checks the UI-to-backend-to-ML history contract with a local HTTP server. */
class HistoryControllerTest {
    @Test
    void proxiesHistoryAndPreservesUnknownValues() throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/history/comparison", exchange -> {
            assertThat(exchange.getRequestURI().getQuery()).contains("routeId=50", "date=2025-11-01");
            byte[] body = """
                {"date":"2025-11-01","routeIds":["50"],"historyThrough":"2025-10-31",
                 "lastWeek":{"date":"2025-10-25","available":false,"points":[{"hour":0,"value":null}]},
                 "lastMonth":{"date":"2025-10-01","available":true,"points":[{"hour":0,"value":0}]},
                 "typicalWeek":{"start":"2025-09-06","end":"2025-10-31","days":[]},"note":"Observed history"}
                """.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, body.length);
            exchange.getResponseBody().write(body);
            exchange.close();
        });
        server.start();
        try {
            var beans = new StaticListableBeanFactory();
            beans.addBean("history", new HttpMlHistoryClient(RestClient.builder()
                    .baseUrl("http://127.0.0.1:" + server.getAddress().getPort()).build()));
            var mvc = MockMvcBuilders.standaloneSetup(new HistoryController(beans.getBeanProvider(MlHistoryClient.class)))
                    .setControllerAdvice(new GlobalExceptionHandler(ZoneId.of("Europe/Moscow"))).build();
            mvc.perform(get("/api/history/comparison").param("date", "2025-11-01").param("routeId", "50"))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.lastWeek.available").value(false))
                    .andExpect(jsonPath("$.lastWeek.points[0].value").value(org.hamcrest.Matchers.nullValue()))
                    .andExpect(jsonPath("$.lastMonth.points[0].value").value(0));
            mvc.perform(get("/api/history/comparison").param("date", "2025-11-01").param("routeId", "unknown"))
                    .andExpect(status().isBadRequest());
        } finally { server.stop(0); }
    }
}
