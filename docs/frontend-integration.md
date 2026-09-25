# Integrating a frontend with the backend

The frontend draws the map and the routes/stops from its own static data (OpenData mos.ru). The
backend never returns geometry, only values keyed by `routeId` and `stopId`, so those IDs must match
the ones used by the ML service and the backend.

The endpoint list and parameters are in the [README](../README.md#эндпоинты); real sample responses
(one file per endpoint, including the error shapes) are in [`examples/`](examples). They were taken
from the synthetic `stub` data, so the numbers mean nothing but the shapes are the real ones. A
formal API description (field-by-field contract) is still to be written, tell us what you need
changed in the shapes. The points that matter for the UI:

- **One request per view, then the slider is local.** Every forecast response contains the whole
  horizon (24 hours for a day, the days of a month, the 12 months of a year). Moving the time slider
  must not call the API: read the point out of the array you already have.
- **Steps follow the horizon**: day = hourly, month = daily, year = monthly.
- **Time**: ISO 8601 with an explicit offset, e.g. `2026-09-25T09:00:00+03:00`. Dates are
  `YYYY-MM-DD`. Do not use unix timestamps.
- **Refresh**: use `refetchInterval` (React Query) only on the day view (30-60 s). Month and year
  change rarely, refetch them on tab switch.
- **Correction coefficients** (`weather`, `event`, `season`, each 0.1-3.0, default 1) can be sent on
  every forecast endpoint; the response already contains the corrected forecast.
- **Was / will be**: the `lastYear` array holds the facts of the same period one year earlier,
  already aligned to the current periods.
- **Export**: `GET /api/export?...` returns a CSV attachment for the same parameters as the screen.

CORS is open for `GET` on `/api/**`.
