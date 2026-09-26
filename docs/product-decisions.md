# Product decisions (from Nastya's analysis)

Distilled from the full product/analyst doc (personas, business case, Miro board) into what actually
constrains implementation. Read the source doc for the *why*; this file only tracks *what was decided*
and what's still open.

## Map interaction

- Route **segments between stops must be clickable, same as stops themselves** — not just the stop
  markers. Lets the dispatcher inspect a stretch of a route, not only discrete points.

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
- **TODO (backend, not frontend)**: vehicle capacity per route/vehicle type isn't in the current data
  model — the backend computes this recommendation, so this is Kirill's/backend's item, not frontend's.
  Confirmed from the organizers' `spravochniki` (`Наряд`/`Расписание` sheets): the dataset only gives
  vehicle **class** (`ОБК`/`БК`) and **model** (e.g. `71-931М`, `71-911ЕМ`), not a passenger-count
  number. A real capacity figure would need to come from external manufacturer/passport data per
  model, with a working link (see Official grading criteria below) — not yet found or sourced.

## Scope cuts

- **US5 (scenario comparison, base vs. "what-if")**: cancelled on the 2026-09-19 call. The model
  returns one forecast, not two parallel scenarios — do not build a compare view for this.
- **US8 (period-over-period comparison, e.g. August vs. September)**: wanted, but the request shape
  (`date=A&date=B`?) is unresolved. Don't build against a guessed contract; confirm shape first.

## ВСМ (high-speed rail) impact — conditional, unconfirmed

- New screen/endpoint, e.g. `GET /api/hsr/{nodeId}/impact?date&horizon`, for the 4 Moscow HSR nodes
  (Зеленоград-Крюково, Петровско-Разумовская, Рижская, Ленинградский вокзал).
- ML consumes HSR schedule/passenger data directly from the dataset — the backend does **not** pass
  it in the request, only asks for forecast + impact on connected stops.
- **Conditional on the organizers' dataset actually containing HSR data. Don't commit to this until
  that's confirmed by the team.** A code-side check of the README and `spravochniki` files found no
  HSR mention, which suggests it's absent — but that's a preliminary read, not a team decision. See
  [`open-questions.md`](open-questions.md) § «ВСМ: данные отсутствуют?».

## Historical accuracy (US9)

- Comparing forecast vs. fact requires the **originally stored** forecast for a past date, not a
  recomputation. This already matches the backend's append-only forecast design (see root
  `README.md` § "Ключевые решения") — no new work needed here, just don't break that property.

## Organizer constraints (from the 2026-09-25 Q&A call with orgs)

Not our decisions — official rules/answers from the organizers. Hard constraints, not up for debate.

- **9 routes, not 10.** Route 5 was dropped from the dataset by the organizers: the live set is
  `1, 7, 11, 12, 17, 25, 26, 28, 50` (verified against `labels_day_train.csv`/`labels_day_test.csv` —
  route 5 is absent from both, despite the dataset's own README calling it "rare" rather than absent).
  Don't build against "10 routes" anywhere (README, sample data, UI assumptions).
- **Forecast granularity: route × hour, nothing finer.** The organizers' README states stop-level
  detail is an optional bonus, not the graded target ("остановочная детализация — необязательный
  бонус, основная метрика считается по маршрут × час"). The `spravochniki` stop-coordinate tables also
  only cover routes `{1, 5, 7, 11, 12}` of the dataset's 9 — even where stop data exists, it isn't all
  routes. This settles the former open question of "route vs. stop aggregation" for attention zones:
  there's no per-stop forecast to aggregate, so the route section of an attention zone *is* the
  forecast; a stop-level view is bonus scope, not MVP.
- **Dataset window** (an ML-data fact, not a runtime requirement): train = Jan–Aug 2025, test =
  Sep–Oct 2025, forecast target = **Nov–Dec 2025**. This describes what the model was trained/
  evaluated on and what it predicts for `submission.csv` — it does **not** mean the live service's
  clock or demo has to sit inside this window. Whether to align the backend's clock
  (`TRAM_CLOCK_FIXED_INSTANT`) to this range for a realistic demo is a separate, later call.
- **Basic auth required.** Credentials go in a separate file, never in the README or committed docs.
  Frontend needs a **login screen (username/password) and a logout action**, not just the backend
  challenge — someone has to design/build that flow, it's not free with basic auth alone.
- **Prediction must be an integer**, rounded to the nearest whole number.
- **Quality bar**: score must be `> 0.75` to count (WAPE-score, see `ml-contract.md`). ⚠️ Conflicts
  with the official brief's table (see below), which scores WAPE-score ≥ 0.48 as "better than
  baseline" starting at 1/5 points, not a hard 0.75 cutoff — reconcile with Nikita before treating
  either number as gospel.
- **Time granularity, confirmed**: hour is the minimum quantum within a day; week and month are by
  day. Bonus points for the year horizon specifically.
- **Long-horizon (365-day) prediction can run asynchronously** — it does not have to compute in lockstep
  with the short-horizon prediction.
- **Data leakage isn't penalized** in this hackathon's scoring — don't burn time guarding against it.
- **Passenger counts**: only successfully validated transactions count (any payment type, not just
  "Тройка"); failed-code transactions are excluded from the source data already.
- **Card hash codes**: stable for bank cards; can vary for some phone/NFC payments depending on device
  vendor. Don't assume a hash uniquely identifies a rider across all payment methods.
- **Schedules**: open-source/public schedules are fine to use as a data source.
- **Test containers will have internet access.**
- **Filling data gaps (e.g. from maintenance/equipment outages) with a justified explanation earns
  bonus points** — worth doing if there's time, not required for MVP.
- **UI**: must support wide/ultrawide dispatcher displays and split-screen layouts; minimize clicks
  and "parasitic" actions to reach information; don't lose object context when drilling down;
  minimize movement between the control area and the action area. Color scheme is our call, but
  organizers recommend dark backgrounds — "too much white hurts." Adaptive/responsive design is
  explicitly "not a minus."
- **AI-assisted ("vibecoded") code is not penalized by itself** — but if the team can't explain the
  result at the presentation, that costs points.
- **Pitch format**: 5 min presentation + 5 min jury Q&A; should concisely cover stack, architecture,
  and achieved/verified results.

## Official grading criteria (from the organizers' PDF brief)

Full text archived in [`hackathon-brief-full.md`](hackathon-brief-full.md). Max 39 points across
stages 1-2 (29 for the solution + 10 for the pitch). Breakdown:

| Criterion | Points | Notes |
| --- | --- | --- |
| Forecast quality (WAPE-score) | 0–10 (weight ×2 on a 0–5 scale) | baseline ≈ 0.48 is the floor to beat; > 0.88 → max 5/5 (10 weighted) |
| Data, external sources, applicability | 0–8 | 4 for sourced external factors (**each needs a working link or it doesn't count**), 2 for stated model validity/adaptation boundaries, 2 for in-UI correction coefficients with live recompute |
| Architecture & performance | 0–5 | judged on the team's own reported latency/RPS in README, no separate load test by the jury; **a non-runnable service tanks this score** |
| Feature completeness | 0–4 | day/month/year horizons (day mandatory, others can be "qualitative"), drill-down, map dashboard, CSV/XLSX export |
| Business value | 0–2 | clear framing of use (fleet allocation, overcrowding reduction, schedule tuning) |
| Pitch (separate stage) | 0–10 | depth (0–4), Q&A quality (0–3), delivery/demo quality (0–3) |

Directly actionable pieces:

- **README must state performance numbers** (latency/RPS) — conflicts with the current root
  `README.md`, which explicitly says "цифр здесь нет намеренно" (no numbers on purpose, pre-real-data).
  This has to change before submission, even if the numbers come from synthetic-data testing.
- **Every external data source needs a working link/access method in the submission**, or it scores
  zero for that source — applies to weather, traffic, calendar/holidays, and any "other" factor
  (events, roadworks, news).
- **Correction coefficients must visibly and instantly affect the forecast in the UI** (weather/event/
  season sliders) — worth 1 of the 8 data-criterion points. Done on the frontend (панель «Сценарий»,
  see § Frontend UX below).
- **Required submission artifacts** (links, filled on the hackathon platform): ML model + training
  code + README; all external data sources used; runnable service (Docker Compose) with API entry
  points and jury instructions; architecture/module diagram + model validity/adaptation description;
  performance measurements + list of extra features; limitations + post-hackathon roadmap.
- **Submission mechanics**: two required uploads — a CSV in the "Data Science" section (36 attempts/day
  total, 24 successful/day, best result counts) and a form with links (updatable until the deadline,
  final version is what's graded). Both close **2026-09-27 23:59 MSK**.
- Dataset: `dataset.zip` at <https://disk.yandex.ru/d/DiFwlfMOauxjBg> (per the brief; the org call
  said 9 routes after route 5 was dropped — confirm the zip matches).

## Frontend UX (решения фронта — Адис, 2026-09-26; не с общего созвона)

Decided by the frontend owner while building the dispatcher screen. Not team-call decisions — raise
on a call if anyone disagrees. Implementation: `frontend/src/features/dispatcher/`.

- **Time control = scale + cursor** (calendar model, like Google/Apple Calendar): scales
  «Год | Месяц | 7 дней | День», shown coarse → fine like the breadcrumbs, **День by default**.
  «7 дней» is the API's `week` horizon (7 days from the cursor, not a calendar week) — a sibling of
  «Месяц», not its child. `<` `>`, date picker, «Сегодня».
- **Gestures on the time strip**: click = focus a period; drag across ≥ 2 bars = time interval
  (`from`/`to`, like Grafana/Kibana); double click = go one scale down; click on empty strip = one
  scale up (mirrors «click on empty map = one level up»). No continuous scrubbing — it had no real
  dispatcher task behind it. A one-bar interval isn't created (it would repeat the focus).
- **«Сейчас»**: bars sit edge to edge (time is continuous, histogram-style); the current period is
  marked on its bar at every scale; a precise «сейчас» line only on «День». Research:
  `docs/research/now-marker-bars.md`.
- **Correction coefficients**: slider 0.1–3.0 with **1.0 exactly in the middle** (0.1→1 on the left
  half, 1→3 on the right) + a numeric field; the request goes on release / after 300 ms. Result shown
  as «было → стало» at the focused period + an outline of the uncorrected forecast on the strip +
  a «Сценарий изменён» badge. (See open question on US5.)
- **Errors**: shown inside the card of the widget that failed, with «Повторить» where a retry makes
  sense; toasts only for actions without a card; `FORECAST_NOT_READY` is retried automatically.
- **Map**: click on empty map = one level up; zoom `− +` and «вписать» in a pill next to the
  breadcrumbs (kept apart from them: breadcrumbs = where you are, the pill = camera only).
- **Load colors** on the map and the strip are relative to the window's peak until vehicle capacity
  exists (see the recommendation TODO above).

## Dashboards (reference for frontend scope)

Two dashboards were spec'd: dispatcher (map, attention zones, deviation, load ratio, recommendation +
justification, peak time, drill-down, fact→forecast, filters, factors) and stakeholder/management
(network-level forecast, period comparison, top routes/stops, forecast quality, "seamlessness index").

- **Seamlessness index (0-100)** for the stakeholder dashboard is a proposed aggregate metric, not
  yet defined in the API contract — treat as future scope, not MVP-blocking.
