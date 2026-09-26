# Contract with the ML service

What the backend expects from the ML service and what the real service (`ml/`, built by the ML
engineer) actually does. This document pins the interface; the model, its code and its numbers belong
to the ML side. The backend never touches raw telemetry.

## How it is wired

- The ML service is a separate container (FastAPI, `ml/Dockerfile`), image `.../tram-forecast/ml`,
  reachable only from the backend at `http://ml:8000` (no published port). The production compose file
  always runs the backend with `TRAM_ML_MODE=http`.
- `TRAM_ML_MODE=stub` (the default outside production compose) serves deterministic synthetic
  forecasts from inside the backend, for local development. Its `modelVersion` is `stub`.
- The backend reads forecasts from its own storage and asks ML **only when storage has nothing** for
  the request; it stores the answer (append-only). The read timeout is 10 s (`tram.ml.read-timeout`).
- The contract is pinned by `HttpMlForecastClientTest` (request, response, refusals, error status,
  malformed body, timeout).

## `POST /predict` (what the backend calls)

The backend asks for the forecast of the **whole network** for one horizon and anchor date.

```json
{ "horizon": "day", "date": "2025-11-05" }
```

- `horizon`: `day` (24 hourly points), `week` (7 daily points), `month` (daily points),
  `year` (12 monthly points).
- `date`: anchor date `YYYY-MM-DD`. For `day` it is the day; for `week` it is the **first of seven
  days** (a sliding window that starts at `date`, not a calendar week); for `month` any day inside the
  month; for `year` any day inside the calendar year. Days begin at **Europe/Moscow** midnight.
- The service also accepts an optional `routeIds` list; the backend does not send it.

Response:

```json
{
  "generatedAt": "2026-09-26T20:18:44+03:00",
  "modelVersion": "<model>-uniform-stops-demo-<hash>",
  "forecasts": [
    {
      "routeId": "17",
      "stopId": "2594",
      "points": [{ "periodStart": "2025-11-05T08:00:00+03:00", "baseline": 1750.4, "forecast": 1980.2 }],
      "factors": ["Календарь: дни недели, праздники, сокращённые дни", "ДЕМО ОСТАНОВОК: ..."]
    }
  ]
}
```

- The unit is **boardings per period** (the target is successful validations per route and hour).
- `routeId` is the route number as a string (`1, 7, 11, 12, 17, 25, 26, 28, 50`); `stopId` is the
  `stopCode` from `shared/tram-stops.json`.
- **Stop values are a demonstration, not a measurement.** The dataset has no stops, the model forecasts
  a route per hour, and `POST /predict` splits the route total **equally** among its stops (the
  backend sums the stops back into the route total). The service marks this in `factors` ("ДЕМО
  ОСТАНОВОК") and in `modelVersion` (`-uniform-stops-demo-<hash>`). Forecasts after 2025-12-31 are a
  **scenario** (`-scenario` in `modelVersion`, a "СЦЕНАРИЙ" factor): their quality is not measured.
- `baseline` is the "usual level": the median of the 56 days before 2025-11-01 for the route, the
  effective weekday and the hour (holidays count as Sunday). The backend takes it as is and computes
  the deviation, attention zones and recommendations from `baseline` and `forecast`.
- Weather, event and season corrections are **multipliers applied by the backend**; ML does not apply
  them again.

## The period the model covers

The model covers **2025-11-01 .. 2026-12-31** (2026 is a scenario); a `year` request must be a whole
calendar year inside that range, so only 2026. The backend knows the range from configuration
(`TRAM_FORECAST_FROM`, `TRAM_FORECAST_TO`, defaults in the production compose file) and:

- refuses a period that is not entirely inside it **before** calling ML, with `400` and the code
  `PERIOD_NOT_SUPPORTED` and the range in the message;
- reports it to clients in `GET /api/meta` (`forecastFrom`, `forecastTo`; `latestDate` is the end of it).

## Errors

- A `422` from ML is a **refusal of this request**, not an outage. The service explains it as
  `{"detail": {"code": ..., "message": ...}}`: `UNSUPPORTED_PERIOD` and `SCENARIO_DISABLED` become
  `PERIOD_NOT_SUPPORTED` (400) with ML's message; other codes (for example `UNSUPPORTED_ROUTE`) become
  `INVALID_REQUEST` (400). A validation error of the framework (a list under `detail`) is treated the
  same way.
- Any other non-2xx status, a malformed body or a timeout is "ML unavailable": the backend keeps serving
  what it has stored and answers `503 FORECAST_NOT_READY` only when it has nothing.

## Other endpoints of the ML service

| Endpoint | What it gives | Used by the backend |
|---|---|---|
| `POST /predict/routes` | the route totals with baseline, without the stop split (the real values) | no |
| `GET /metadata` | model version, baseline method, corrections note, limitations, sources, supported routes | no |
| `GET /metrics?origin=2025-07-01\|2025-09-01` | WAPE and score overall, by route and by day on the two historical 61-day backtest blocks | **yes**: `GET /api/model/stats` (default block 2025-09-01; per day `absoluteError` and `actualSum` are combined into an exact WAPE; `platform.score` is passed on as a separate `platformScore`) |
| `GET /health` | liveness and the model version (the container health check) | Deploy checks it |

## Status of the earlier open questions

1. **Unit of `baseline` / `forecast`**: boardings per period (answered above).
2. **Which day counts as the norm**: the median of the 56 days before 2025-11-01 per route, effective
   weekday and hour (answered above; `GET /metadata` documents it).
3. **Quality metric**: WAPE-score `max(0, 1 - Σ|y-ŷ|/Σy)`. The ML service reports it from its backtests
   (`GET /metrics`) and `GET /api/model/stats` passes it on (the backend has no facts to compute it
   itself). If the ML service cannot be asked, the backend falls back to comparing its own stored forecasts
   with the facts (empty today), and `source` says which one it is.
4. **Facts for the dashboard**: not loaded into the backend (`actual_value` is empty), so `actual` is
   absent and the load matrix has no data. The organizers' labels are available in `ml/data/`.
