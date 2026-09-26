# Integrating a frontend with the backend

The frontend draws the map and the routes/stops from its own static data (OpenData mos.ru). The
backend never returns geometry, only values keyed by `routeId` and `stopId`, so those IDs must match
the ones used by the ML service and the backend.

**Authentication.** When access control is on (the deployed stand), every request under `/api/**`
must carry `Authorization: Basic base64(user:password)`. There is no login endpoint and no
session: send the header on each request. A missing or wrong credential gives `401` with the
usual problem document (`title: "Unauthorized"`) and **no `WWW-Authenticate` header**, so the
browser does not open its own login dialog. Only `/api/**` is protected; `/actuator/health`,
`/v3/api-docs` and the static frontend stay open. Locally (`docker compose up` or the backend run
by hand) access control is off and no header is needed. The user name and password of the stand
are not in the repository: ask the person who runs the server.

The formal contract is [`openapi.json`](openapi.json) (OpenAPI 3.1). It is generated from the
backend code, and a CI test fails when the file is out of date, so it always matches what the
backend really does. With the backend running there is also an interactive page at
<http://localhost:8080/swagger-ui.html>. To generate TypeScript types from it, for example:

```bash
npx openapi-typescript https://raw.githubusercontent.com/Manticore-MT/tram-forecast/main/docs/openapi.json -o src/api/schema.d.ts
```

Real sample responses (one file per endpoint, including the error shapes) are in
[`examples/`](examples). They were taken from the synthetic `stub` data, so the numbers mean
nothing but the shapes are the real ones. Tell us what you want changed in the shapes. The points
that matter for the UI:

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
