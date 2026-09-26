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

**CORS.** On the deployed stand the site and the API share one address, so no CORS is involved. For a
frontend developed on `localhost` against the remote API, the server allows the addresses listed in
`TRAM_CORS_ALLOWED_ORIGINS` (`*` for any; empty = off, the default). The browser's credential-less
preflight (`OPTIONS`) is answered before the login check, and a `401` stays readable by the page.
The methods `GET`/`HEAD`/`OPTIONS` and the headers `Authorization`, `Content-Type`, `Accept` are
allowed; `Content-Disposition` is readable (the export names its file with it). A dev-server proxy
(for example Vite's `server.proxy`) avoids CORS altogether.

**Errors.** Every error is an RFC 9457 problem document (`application/problem+json`) with the same
fields, so one error window can show them all:

| Field | Meaning |
|---|---|
| `status` | HTTP status |
| `title` | short name, fixed per kind of error |
| `detail` | a sentence that can be shown to the user as is |
| `code` | machine-readable code, see below; use it to group or style errors |
| `timestamp` | when the error happened, ISO 8601 with offset |
| `instance` | the request path that failed |

Codes (added over time, never renamed): `INVALID_REQUEST` (400), `INVALID_PARAMETER` (400),
`UNAUTHORIZED` (401), `ROUTE_NOT_FOUND` (404, no such route; `detail` lists the known routes),
`STOP_NOT_FOUND` (404, the route exists but has no such stop), `NO_DATA` (404, route and stop exist
but there is nothing to answer with, for example no history for a load matrix),
`ENDPOINT_NOT_FOUND` (404, not an endpoint), `METHOD_NOT_ALLOWED` (405), `FORECAST_NOT_READY` (503, nothing stored and ML is
unavailable: try again later), `INTERNAL_ERROR` (500, nothing internal is revealed). Samples:
[`examples/error-*.json`](examples).

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
