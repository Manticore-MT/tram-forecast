# ai-map

React + TypeScript + Vite app for **Хакатон Московского транспорта** (25.09–03.10.2026) and team **Manticore**'s track-02 product **«Поток»** — a tram passenger-load forecasting dashboard. See `README.md` for the full design spec (brand voice, color, type, spacing).

**Before asking what the product should do, read `DOC.md` first** — decisions already made, rationale, and open questions are tracked there. Don't re-litigate something it already settled.

## Stack

- Vite + React 18 + TypeScript, real ES module imports (no Babel-in-browser, no `window` globals).
- `src/components/` — 19 shared components (Button, Card, Icon, LoadMeter, etc.), each a typed `.tsx` file exporting a named function + `Props` interface. Import from `../../components` (barrel at `src/components/index.ts`).
- `src/products/forecast-dashboard/` — the actual product (5 screens, real Leaflet/OSM map).

## Running it

```
npm install
npm run dev
```

## History

This started as a Claude Agent Skill / design-system sync package (`SKILL.md`, `_ds_bundle.js`, per-component `.jsx`+`.d.ts`+`.prompt.md` triples, driven by `/design-sync`). That machinery was deliberately dropped — this is now a normal app, not a skill or a sync target. Don't reintroduce `window.DesignSystem_*` globals, `.prompt.md` files, or a `_ds_manifest.json`.

## Conventions

- Russian-language UI only; see `README.md` § CONTENT FUNDAMENTALS for voice/tone rules (вы-form, sentence case, no emoji, «guillemets»).
- One accent color (signal red `#F0392B`); the five-step `--load-*` ramp is the only sanctioned load-color scale.
- Icons: Lucide only, inlined as real SVG via `src/components/core/Icon.tsx`. Never CSS `mask-image` off the CDN.
- **Do not add `Co-Authored-By: Claude` (or similar AI attribution) to commits or PRs in this repo.**
