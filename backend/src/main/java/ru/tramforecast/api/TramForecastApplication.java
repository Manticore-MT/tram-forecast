package ru.tramforecast.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point of the tram ridership forecast backend.
 */
@SpringBootApplication
public class TramForecastApplication {

    /**
     * Starts the Spring application.
     *
     * @param args command-line arguments
     */
    public static void main(String[] args) {
        SpringApplication.run(TramForecastApplication.class, args);
    }
}
