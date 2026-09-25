# Product decisions (from Nastya's analysis)

Distilled from the full product/analyst doc (personas, business case, Miro board) into what actually
constrains implementation. Read the source doc for the *why*; this file only tracks *what was decided*
and what's still open.

## Attention zones: "+1 / без изменений / −1 трамвай" recommendation

`GET /api/attention` should carry a capacity-based recommendation, not just percent deviation.

- **Metric**: `load ratio = forecast passengers / vehicle capacity * 100%`.
- **Thresholds**: `> 80%` → `+1 tram`; `40–80%` → no change; `< 40%` → `−1 tram`.
  - 80% has a methodological basis (Ministry of Transport guidance on max occupancy).
  - 40% is a product hypothesis for MVP, meant to be calibrated later against real dispatcher
    decisions — treat it as a config value, not a constant.
- **Anti-flapping**: a threshold must hold for **2 consecutive intervals** before the recommendation
  changes (e.g. two consecutive 30-min points above 80%, not one).
- **UI**: recommendation shown inside the attention zone card with its justification, e.g.
  "+1 трамвай — прогнозируемая загрузка 86%, порог 80%". Final call stays with the dispatcher.
- **Open**: vehicle capacity per route/vehicle type isn't in the current data model — needs a source.

## Scope cuts

- **US5 (scenario comparison, base vs. "what-if")**: cancelled on the 2026-09-19 call. The model
  returns one forecast, not two parallel scenarios — do not build a compare view for this.
- **US8 (period-over-period comparison, e.g. August vs. September)**: wanted, but the request shape
  (`date=A&date=B`?) is unresolved. Don't build against a guessed contract; confirm shape first.

## ВСМ (high-speed rail) impact — new scope, conditional

- New screen/endpoint, e.g. `GET /api/hsr/{nodeId}/impact?date&horizon`, for the 4 Moscow HSR nodes
  (Зеленоград-Крюково, Петровско-Разумовская, Рижская, Ленинградский вокзал).
- ML consumes HSR schedule/passenger data directly from the dataset — the backend does **not** pass
  it in the request, only asks for forecast + impact on connected stops.
- **Conditional on the organizers' dataset actually containing HSR data.** Don't commit to this until
  that's confirmed.

## Historical accuracy (US9)

- Comparing forecast vs. fact requires the **originally stored** forecast for a past date, not a
  recomputation. This already matches the backend's append-only forecast design (see root
  `README.md` § "Ключевые решения") — no new work needed here, just don't break that property.

## Dashboards (reference for frontend scope)

Two dashboards were spec'd: dispatcher (map, attention zones, deviation, load ratio, recommendation +
justification, peak time, drill-down, fact→forecast, filters, factors) and stakeholder/management
(network-level forecast, period comparison, top routes/stops, forecast quality, "seamlessness index").

- **Seamlessness index (0-100)** for the stakeholder dashboard is a proposed aggregate metric, not
  yet defined in the API contract — treat as future scope, not MVP-blocking.
