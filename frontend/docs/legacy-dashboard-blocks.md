# Legacy dashboard (`/dashboard-legacy`) — feature inventory

Source: `src/products/forecast-dashboard/{DashApp,Shell,Screens,MapScreens,Charts}.tsx`
(the pre-Tailwind, old-inline-style product — the design-system cleanup pass did not touch it).

Purpose of this doc: a block-by-block catalogue of every distinct UI feature that route
contains, independent of styling, so nothing gets lost if/when those files are deleted.
For each block: what it shows, what data shape drives it, and whether the newer
`src/mockups/dispatcherOverview/` mockup (2 screens: dispatcher + stakeholder overview)
already has an equivalent.

Legacy navigation was 5 sidebar items (`Shell.tsx:6-12`, `NAV`): **Карта загрузки** (map),
**Обзор сети** (overview), **Маршрут** (route), **Модель** (model), **Данные** (data) — i.e.
`MapView`, `Overview`, `RouteView`, `ModelView`, `IngestView`.

---

## 1. `MapView` (`MapScreens.tsx:128`) — route-level live map

- Real Leaflet/OSM map (`MapCanvas`, `MapScreens.tsx:66`) of one selected route's stops,
  colored by a load value that's modulated by a synthetic bimodal peak curve keyed to a
  time-of-day slider (`shift = exp(-((hour-8.5)/3)^2) + 0.9*exp(-((hour-18.5)/3.2)^2)`,
  `MapScreens.tsx:101`) — i.e. the map redraws stop colors as you drag the hour slider,
  simulating how load would look at that time of day.
- Floating glass card, top-left: route + time label, live/pause `Badge`, an hour range
  slider (`5`–`23.5`, step `0.5`), a "live update" `Switch`.
- Floating glass card, top-left (below): selected-stop detail — stop name, `LoadMeter`,
  two `Stat`s (entries/hour, headway).
- Floating glass card, bottom-left: `LoadLegend` (the 5-step load-color key).
- Floating glass card, top-right: a data-provenance disclaimer ("stops are real
  data.mos.ru positions; the line between them is straight, not surveyed track").
- **Status in new mockup:** superseded by `DispatcherScreen` — same real Leaflet map,
  but restructured as a 3-level drill hierarchy (network → route → stop) with breadcrumbs,
  rather than one fixed-route view with a time slider. The **time-of-day slider driving
  the map's load colors live** did not carry over — `DispatcherScreen`'s time control
  (`Tabs`: день/месяц/год) changes forecast horizon, not hour-of-day, and doesn't
  redraw the map.

## 2. `Overview` (`Screens.tsx:47`) — network-level KPI dashboard

Grid of panels, in order:

1. 4-up `Stat` cards: passengers/hour, peak load %, model MAPE, routes-in-model count.
2. **`ForecastChart`** (`Charts.tsx:25`) — SVG actual-vs-forecast line chart with an
   optional confidence band (toggled by a `Switch`), a "сейчас" (now) divider, cyan
   solid line for actual / dashed brand-red line for forecast.
3. **`RouteStrip`** (`Charts.tsx:107`) — a horizontal schematic stop-by-stop strip
   (deliberately not geographic) showing load-colored dots connected by load-colored
   segments; click a dot to select it.
4. **Route list w/ `LoadMeter`** — every route number + its `LoadMeter` bar, sorted
   implicitly by the `routes` array (`Screens.tsx:54`).
5. **12-month forecast bar chart** — hand-rolled `<div>` bars (not a shared chart
   component), current month highlighted in brand red, others cyan at reduced opacity;
   below it two `Stat`s (December forecast, YoY growth %).
6. **`DemandMap`** (`MapScreens.tsx:181`) — compact read-only `MapCanvas` variant,
   fixed hour (18.5), no active stop, captioned "Прогноз спроса · 18:30".
7. **Зоны внимания (attention zones)** — cards with name/route/note + a numeric rating
   `Badge` (danger ≥90, warn ≥80, else info). *(Superseded — see `DeviationList` below.)*
8. **Отклонение от базового уровня (baseline deviation)** — per-route horizontal
   diverging bar chart: bar grows left (green, "ok") or right (amber, "warn") from a
   center line depending on sign, `Screens.tsx:130-131`. Not a `DeviationList` — a
   different, bidirectional visualization the new mockup does not have.
9. **`PeriodCompare`**-equivalent inline (period A / period B `Select`s + a diff `Stat`).
10. **Учёт внешних факторов (external factors)** — 4-up grid of factor cards
    (Календарь/Погода/События города/ВСМ), each with an `Icon`, a status `Badge` (dot
    only, tone ok/warn/info), and a one-line note, e.g. "Осадки завтра — +6% на
    маршрутах А, 7" (`Screens.tsx:33-38`, `EXTERNAL_FACTORS`). **Distinct from**
    `FactorsCard` in the new mockup, which is a plain label+detail list with no icon,
    no status badge, no grid layout.
11. Quality metrics `Stat` trio (MAPE/RMSE/R²) + quality-history `Timeline`.

**Status in new mockup:** `OverviewScreen` reimplements #1 (as `MetricCard`), #6 (as
`MapCanvas`), #9 (`PeriodCompare`, ported as-is), and #11 (`Timeline`, ported as-is).
It replaces #7 with `DeviationList` (a cleaner single-direction rows-not-cards layout)
and folds #8 into a plain `ROUTE_BREAKDOWN` table. **Missing entirely:** #2 `ForecastChart`
with confidence band (only a bare legend remains, `OverviewScreen.tsx:58-61` — no actual
chart is rendered), #3 `RouteStrip`, #4 per-route `LoadMeter` list, #5 the 12-month bar
chart, #10 the icon+badge external-factors grid.

## 3. `RouteView` (`Screens.tsx:183`) — single-route operational detail

- 3-up `Stat` cards: headway, cars-on-line (with a trend delta + "model recommendation"
  caption), critical-stops count.
- **`Heatmap`** (`Charts.tsx:79`) — day (row) × hour (column, 24 cols) load matrix, cell
  color = the 5-step load ramp, cell opacity scaled by load value, `title` tooltip per
  cell. Fully generic component, `rows: {label, values[]}[]`.
- **Dispatcher recommendations list** — tone `Badge` (danger="Пик"/warn="Внимание"/
  ok="Резерв") + a monospace location+time string + a plain-language action, e.g.
  *"Электрозаводская, 18:30–19:10 — Прогноз 86% — добавить 2 вагона на выпуск"*
  (`Screens.tsx:186-188`). This is the one clearly-dispatcher-facing, clearly-actionable
  block in the whole legacy app that has no equivalent anywhere in the new mockup.

**Status in new mockup:** no equivalent screen or blocks at either level.

## 4. `ModelView` (`Screens.tsx:215`) — model-quality diagnostics

- 4-up `Stat` cards (MAPE/RMSE/R²/training-time), each paired with a `Sparkline`
  showing that metric's recent history.
- **Feature-importance bars** — `label | horizontal bar (width = importance*100%) | value`
  rows, e.g. "Час суток" 0.94, "Погода" 0.48 (`Screens.tsx:218,230-236`).
- **Training-run history table** — version id, timestamp, status `Badge` ("в проде"/
  "архив"), accuracy value, e.g. `v14 · 13.09 04:00 · ok · 7.4%` (`Screens.tsx:219,241-248`).
  A "Переобучить" (retrain) action button in the panel header.

**Status in new mockup:** the `OverviewScreen`'s "Качество прогноза" panel covers the
MAPE/RMSE/R² `Stat` trio (no sparklines) and quality-history `Timeline` covers a
simplified 3-row version of the run history (date/title/note only, no accuracy column,
no status badge, no retrain action). Feature-importance bars: **missing entirely.**

## 5. `IngestView` (`MapScreens.tsx:194`) — data-pipeline / ops health

- 4-up `Stat` cards: total validations in DB, rows/day, stream latency (with trend),
  data completeness %.
- **Pipeline job-status list** — job id (monospace), description, status `Badge`
  (dot, ok="в работе"/warn="отставание"), lag, volume — 5 rows covering Kafka→ClickHouse
  validations, GLONASS telematics, weather enrichment, city-events calendar, and the
  feature-store build (`MapScreens.tsx:195-201`). A "Перезапустить" (restart) action.
- **Data-quality list** — metric label + horizontal bar (color flips to warn above a
  threshold) + percentage, e.g. "Пропуски валидаций" 0.6% (`MapScreens.tsx:202,233-238`).
- **Forecast API endpoint list** — method + path + one perf figure, e.g.
  `GET /api/v1/forecast?route=17&horizon=day — p95 84 мс` (`MapScreens.tsx:203-208`),
  labeled "Spring Boot · Netty".

**Status in new mockup:** no equivalent screen or blocks at either level. This is the
only screen whose content is about the data/ops layer rather than forecasting — every
block here is missing from both `DispatcherScreen` and `OverviewScreen`.

---

## Shared chrome (not screen-specific)

- **`Sidebar`** (`Shell.tsx:19`) — 5-item nav (see above), a logo lockup, and a
  "Поток данных" (data-flow) status card pinned to the bottom showing last-sync
  timestamps for validations/telematics feeds.
- **`TopBar`** (`Shell.tsx:62`) — route-selector `Tag` row (17/27/А/7), a horizon
  `Tabs` (день/месяц/год), a CSV-export `IconButton` (fires a confirmation `Toast`,
  `DashApp.tsx:18,27-29`), and a user-initials avatar pill.
- **`Panel`** (`Shell.tsx:84`) — the card+title+action wrapper every block above sits in.
- **`LoadLegend`** (`Shell.tsx:98`) — the 5-step load-color key, reused across MapView/
  Overview/RouteView contexts. (The new mockup does not appear to render this anywhere.)

---

## Net gap summary (blocks with zero equivalent in the new mockup)

1. Time-of-day slider that live-redraws map load colors (`MapView`)
2. `ForecastChart` (actual/forecast line + confidence band) actually rendered
3. `RouteStrip` schematic stop-by-stop strip
4. Per-route `LoadMeter` list
5. 12-month long-term forecast bar chart
6. Icon+badge external-factors grid (Учёт внешних факторов)
7. `Heatmap` (day × hour load matrix)
8. Dispatcher recommendations list (the one clearly-actionable block in the app)
9. Feature-importance bars
10. Training-run history table (with accuracy + status + retrain action)
11. Pipeline job-status list
12. Data-quality list
13. Forecast API endpoint list
14. `LoadLegend` (exists as a component, just not placed in the new mockup)
