# ai-map

React + TypeScript + Vite app for **Хакатон Московского транспорта** (25.09–03.10.2026) and team **Manticore**'s track-02 product **«Поток»** — a tram passenger-load forecasting dashboard. See `README.md` for the full design spec (brand voice, color, type, spacing).

**Before asking what the product should do, read `DOC.md` first** — decisions already made, rationale, and open questions are tracked there. Don't re-litigate something it already settled.

## Stack

- Vite + React 18 + TypeScript, real ES module imports (no Babel-in-browser, no `window` globals).
- `src/components/` — 19 shared components (Button, Card, Icon, LoadMeter, etc.), each a typed `.tsx` file exporting a named function + `Props` interface. Import from `../../components` (barrel at `src/components/index.ts`).
- `src/features/dispatcher/` — **the product**, mounted at `*` in `src/App.tsx`. Two screens: `DispatcherScreen` (full-screen map + floating panels, US1-6) and `OverviewScreen` (stakeholder grid, US7-10).
  - `store.ts` — zustand store with the UI state only: picked object (`place`), time (`scale` + `cursor` + `focus`), scenario `corrections`. Server data stays in React Query; never copy it into the store.
  - `forecast.ts` — hooks that join the store with the API (`useCurrentSeries`, `useUncorrectedSeries`, `useFocusIndex`, …). Panels read data through these instead of building params themselves.
  - `time.ts` — pure time model: scale (= API horizon: day / week / month / year) + cursor date → window, labels, shifting, drill-down.
  - `panels/` — one file per floating panel; `map/` — Leaflet canvas (forecast-agnostic, colors via props) and its store wiring.
- `src/features/login/` — basic-auth login screen.
- `src/shared/` — app-wide pieces: `Floating` (panel placement slots over the map — the one place for layout), charts, notices, load ramp + legend.
- `src/network/` — static tram geometry (data.mos.ru) for the 9 dataset routes.
- The old dashboard is gone; everything useful was ported. Blocks still waiting for data are listed in `docs/open-questions.md` § «Блоки старого дашборда, которые ждут данных», with the git tags (`legacy-dashboard`, `legacy-dashboard-mock`) to recover their code from.

## Running it

```
npm install
npm run dev
```

Against the prod backend: `VITE_API_BASE_URL=https://24manticore.ru` in `.env.local` (CORS allows `localhost:5173`; log in with the stand's basic-auth credentials). The file must be UTF-8 — PowerShell's `echo … >` writes UTF-16, which Vite silently ignores; use `Set-Content .env.local "VITE_API_BASE_URL=https://24manticore.ru" -Encoding ascii`. Restart `npm run dev` after changing it.

Regenerate API types after the backend changes the contract: `npx openapi-typescript ../docs/openapi.json -o src/api/schema.d.ts`.

## History

This started as a Claude Agent Skill / design-system sync package (`SKILL.md`, `_ds_bundle.js`, per-component `.jsx`+`.d.ts`+`.prompt.md` triples, driven by `/design-sync`). That machinery was deliberately dropped — this is now a normal app, not a skill or a sync target. Don't reintroduce `window.DesignSystem_*` globals, `.prompt.md` files, or a `_ds_manifest.json`.

## Conventions

- Russian-language UI only; see `README.md` § CONTENT FUNDAMENTALS for voice/tone rules (вы-form, sentence case, no emoji, «guillemets»).
- One accent color (signal red `#F0392B`); the five-step `--load-*` ramp is the only sanctioned load-color scale.
- Icons: Lucide only, inlined as real SVG via `src/components/core/Icon.tsx`. Never CSS `mask-image` off the CDN.
- **Do not add `Co-Authored-By: Claude` (or similar AI attribution) to commits or PRs in this repo.**
