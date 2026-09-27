package ru.tramforecast.api.infrastructure.ml;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import ru.tramforecast.api.domain.model.ForecastPoint;
import ru.tramforecast.api.domain.model.Horizon;
import ru.tramforecast.api.domain.model.RouteForecast;
import ru.tramforecast.api.domain.model.RouteId;
import ru.tramforecast.api.domain.port.MlForecastClient;

/**
 * Serves deterministic synthetic forecasts so the whole system (frontend, exports, attention
 * zones) runs before the real model exists, and so the demo works offline. The numbers carry no
 * meaning; the shape (two daily peaks, some routes far from their baseline) is only there to
 * exercise the screens. Every response is labelled with model version {@code stub}.
 */
public class StubMlForecastClient implements MlForecastClient {

    private static final String MODEL_VERSION = "stub";

    private final int routes;
    private final Clock clock;
    private final ZoneId zone;

    /**
     * Creates the stub.
     *
     * @param routes number of synthetic routes
     * @param clock  source of the generation time
     * @param zone   zone in which days, months and years begin
     */
    public StubMlForecastClient(int routes, Clock clock, ZoneId zone) {
        this.routes = routes;
        this.clock = clock;
        this.zone = zone;
    }

    @Override
    public List<RouteForecast> predict(Horizon horizon, LocalDate date) {
        Instant generatedAt = clock.instant();
        List<RouteForecast> result = new ArrayList<>();
        for (int r = 1; r <= routes; r++) {
            String route = "R" + r;
            result.add(new RouteForecast(
                    new RouteId(route),
                    horizon,
                    date,
                    generatedAt,
                    MODEL_VERSION,
                    points(horizon, date, route, 1900.0 + 400.0 * r),
                    factors(date)));
        }
        return result;
    }

    private List<ForecastPoint> points(Horizon horizon, LocalDate date, String route, double base) {
        int seed = Objects.hash(route, date.getMonthValue(), date.getDayOfMonth());
        double shock = ((seed & 0xFF) / 255.0 - 0.5) * 0.9;
        List<ForecastPoint> points = new ArrayList<>();
        switch (horizon) {
            case DAY -> {
                ZonedDateTime start = date.atStartOfDay(zone);
                for (int hour = 0; hour < 24; hour++) {
                    double baseline = base * dailyProfile(hour);
                    double rush = Math.exp(-Math.pow(hour - 8.5, 2) / 6.0) + Math.exp(-Math.pow(hour - 18.0, 2) / 8.0);
                    points.add(point(start.plusHours(hour), baseline, shock * rush, seed + hour));
                }
            }
            case WEEK -> {
                for (int day = 0; day < 7; day++) {
                    LocalDate d = date.plusDays(day);
                    double weekend = d.getDayOfWeek() == DayOfWeek.SATURDAY || d.getDayOfWeek() == DayOfWeek.SUNDAY
                            ? 0.7 : 1.0;
                    points.add(point(d.atStartOfDay(zone), base * 12 * weekend, shock, seed + day));
                }
            }
            case MONTH -> {
                LocalDate first = date.withDayOfMonth(1);
                for (int day = 0; day < first.lengthOfMonth(); day++) {
                    LocalDate d = first.plusDays(day);
                    double weekend = d.getDayOfWeek() == DayOfWeek.SATURDAY || d.getDayOfWeek() == DayOfWeek.SUNDAY
                            ? 0.7 : 1.0;
                    points.add(point(d.atStartOfDay(zone), base * 12 * weekend, shock, seed + day));
                }
            }
            default -> {
                LocalDate first = date.withDayOfYear(1);
                for (int month = 0; month < 12; month++) {
                    double season = 1.0 + 0.15 * Math.cos((month - 9) / 12.0 * 2 * Math.PI);
                    points.add(point(first.plusMonths(month).atStartOfDay(zone), base * 12 * 30 * season, shock,
                            seed + month));
                }
            }
        }
        return points;
    }

    private static ForecastPoint point(ZonedDateTime start, double baseline, double shock, int noiseSeed) {
        double noise = 0.04 * Math.sin(noiseSeed);
        return new ForecastPoint(start.toInstant(), round(baseline), round(baseline * (1 + shock + noise)), null);
    }

    private static double dailyProfile(int hour) {
        return 0.15 + 0.85 * Math.exp(-Math.pow(hour - 8.5, 2) / 6.0) + 0.75 * Math.exp(-Math.pow(hour - 18.0, 2) / 8.0);
    }

    private static List<String> factors(LocalDate date) {
        boolean weekend = date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY;
        return weekend ? List.of("weekend") : List.of("working day");
    }

    private static double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
