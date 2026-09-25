package ru.tramforecast.api.infrastructure.ml;

import java.net.http.HttpClient;
import java.time.Clock;
import java.time.ZoneId;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import ru.tramforecast.api.domain.port.MlForecastClient;
import ru.tramforecast.api.infrastructure.config.TramProperties;

/**
 * Chooses how forecasts are obtained: synthetic (default, works with no ML service) or the real
 * service over HTTP, selected by {@code tram.ml.mode}.
 */
@Configuration
public class MlConfig {

    /**
     * Synthetic forecasts, active unless {@code tram.ml.mode=http}.
     *
     * @param properties application settings
     * @param clock      source of the generation time
     * @param zone       API zone
     * @return the stub client
     */
    @Bean
    @ConditionalOnProperty(name = "tram.ml.mode", havingValue = "stub", matchIfMissing = true)
    public MlForecastClient stubMlForecastClient(TramProperties properties, Clock clock, ZoneId zone) {
        TramProperties.Stub stub = properties.ml().stub();
        return new StubMlForecastClient(stub.routes(), stub.stopsPerRoute(), clock, zone);
    }

    /**
     * The real ML service, active with {@code tram.ml.mode=http}. Timeouts bound how long a
     * request can be held up by a slow model.
     *
     * @param properties application settings
     * @return the HTTP client
     */
    @Bean
    @ConditionalOnProperty(name = "tram.ml.mode", havingValue = "http")
    public MlForecastClient httpMlForecastClient(TramProperties properties) {
        TramProperties.Ml ml = properties.ml();
        HttpClient httpClient = HttpClient.newBuilder().connectTimeout(ml.connectTimeout()).build();
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(httpClient);
        factory.setReadTimeout(ml.readTimeout());
        RestClient client = RestClient.builder().baseUrl(ml.baseUrl()).requestFactory(factory).build();
        return new HttpMlForecastClient(client);
    }
}
