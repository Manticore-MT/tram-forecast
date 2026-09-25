package ru.tramforecast.api.domain.model;

/**
 * Planning horizon of a forecast. The horizon fixes the step of the returned points: a day is
 * forecast by hours, a month by days, a year by months.
 */
public enum Horizon {
    /** Short term: one day, hourly points. */
    DAY(Granularity.HOUR),
    /** Medium term: one month, daily points. */
    MONTH(Granularity.DAY),
    /** Long term: one year, monthly points. */
    YEAR(Granularity.MONTH);

    private final Granularity granularity;

    Horizon(Granularity granularity) {
        this.granularity = granularity;
    }

    /**
     * Returns the step between consecutive points for this horizon.
     *
     * @return the point granularity
     */
    public Granularity granularity() {
        return granularity;
    }
}
