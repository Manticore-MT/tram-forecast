# Contract with the ML service

What the backend expects from the ML service. The ML side (model, code, container) is owned and
built by the ML engineer; this document only pins the interface. The backend never touches raw
telemetry.

The backend has two modes, set by `TRAM_ML_MODE`:

- `stub` (default): the backend serves deterministic synthetic forecasts itself, so everything
  else can be built and demoed before the model exists. Responses carry `modelVersion = "stub"`.
- `http`: the backend calls the ML service at `TRAM_ML_BASE_URL` (default `http://ml:8000`) using
  the contract below. The contract is pinned by a test on the backend side
  (`HttpMlForecastClientTest`), which also covers error status, malformed body and timeout.

## What the backend expects: `POST /predict`

The backend asks for the forecast of the **whole network** for one horizon and anchor date. It asks
only when its own storage has nothing for that request, and stores what it gets (append-only), so
recomputing is cheap for the backend and slow calls are fine as long as they finish within the
read timeout (10 s by default, `tram.ml.read-timeout`).

Request:

```json
{ "horizon": "day", "date": "2026-09-25" }
```

- `horizon`: `day`, `month` or `year`. It fixes the step of the points: **day = hourly, month =
  daily, year = monthly**.
- `date`: anchor date `YYYY-MM-DD`. For `day` it is the day, for `month`/`year` any day inside
  the month/year. Days, months and years begin at **Europe/Moscow** midnight.

Response:

```json
{
  "generatedAt": "2026-09-25T12:00:00+03:00",
  "modelVersion": "v0.3",
  "forecasts": [
    {
      "routeId": "5",
      "stopId": "1023",
      "points": [
        { "periodStart": "2026-09-25T09:00:00+03:00", "baseline": 900.0, "forecast": 1240.0 }
      ],
      "factors": ["weekend", "rain"]
    }
  ]
}
```

- One entry per stop **of a route** (a stop served by several routes appears once per route).
- `baseline` is the "usual level" for the same period; `forecast` is the model's value. The backend
  computes the deviation (absolute and percent), the attention zones and the recommendations
  itself, so these two numbers are all it needs.
- `factors` lists what the model took into account (calendar, weather, events ...), shown to the
  dispatcher. May be empty or omitted.
- All timestamps ISO 8601 with an explicit offset.
- IDs (`routeId`, `stopId`) must be the ones from the route/stop dataset the frontend draws the map
  from; the backend stores them as-is.

Errors: any non-2xx status or a timeout is treated as "ML unavailable": the backend keeps serving
what it has stored and returns 503 only when it has nothing.

## Open questions for the model (need answers before the contract is final)

1. **Unit of `baseline`/`forecast`**: passengers per period, or load ratio? The dispatcher screens
   show "1 240 passengers, usually 900, +340 / +37.8%", which needs absolute values.
2. **Which day counts as "the norm" for the baseline** (same weekday average over N weeks?). It must
   be documented: the judging asks for the domain of applicability.
3. **Quality metric**: the challenge is judged on WAPE-score `max(0, 1 - Σ|y-ŷ|/Σy)`. The backend
   reports the same metric from stored initial forecasts versus facts (`GET /api/model/stats`).
4. **Facts for the dashboard**: the backend needs observed values aggregated to stop and hour
   (table `actual_value`, see `backend/src/main/resources/db/migration/V1__init.sql`). Who produces
   the aggregate from the organizers' dataset, and in what format?
