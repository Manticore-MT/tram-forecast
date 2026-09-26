package ru.tramforecast.api.domain.model;

/**
 * Planning horizon of a forecast. The horizon fixes the step of the returned points: a day is
 * forecast by hours, a week and a month by days, a year by months. A week is seven days starting at
 * the requested date (not a calendar week), so the operator chooses the first day.
 */
public enum Horizon {
    /** Short term: one day, hourly points. */
    DAY(Granularity.HOUR),
    /** Short to medium term: seven days starting at the anchor date, daily points. */
    WEEK(Granularity.DAY),
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
