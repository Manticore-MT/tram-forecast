package ru.tramforecast.api.web;

import java.time.ZoneId;
import java.util.Locale;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import ru.tramforecast.api.domain.model.Horizon;
import ru.tramforecast.api.domain.model.SnapshotKind;

/**
 * Web wiring: case-insensitive enum parameters ({@code horizon=day}), CORS for the separately
 * deployed frontend, and the API mapper and CSV writer beans.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * Registers the enum converters.
     *
     * @param registry the formatter registry
     */
    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(String.class, Horizon.class, horizonConverter());
        registry.addConverter(String.class, SnapshotKind.class, snapshotConverter());
    }

    /**
     * Allows the frontend, deployed on another origin, to call the API.
     *
     * @param registry the CORS registry
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**").allowedOrigins("*").allowedMethods("GET", "OPTIONS");
    }

    /**
     * Response mapper.
     *
     * @param zone API zone
     * @return the mapper
     */
    @Bean
    public ApiMapper apiMapper(ZoneId zone) {
        return new ApiMapper(zone);
    }

    /**
     * CSV renderer.
     *
     * @param zone API zone
     * @return the writer
     */
    @Bean
    public CsvForecastWriter csvForecastWriter(ZoneId zone) {
        return new CsvForecastWriter(zone);
    }

    /**
     * Converter for the {@code horizon} parameter.
     *
     * @return a case-insensitive converter
     */
    public static Converter<String, Horizon> horizonConverter() {
        return source -> Horizon.valueOf(source.trim().toUpperCase(Locale.ROOT));
    }

    /**
     * Converter for the {@code snapshot} parameter.
     *
     * @return a case-insensitive converter
     */
    public static Converter<String, SnapshotKind> snapshotConverter() {
        return source -> SnapshotKind.valueOf(source.trim().toUpperCase(Locale.ROOT));
    }
}
