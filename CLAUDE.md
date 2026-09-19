# ai-map

A **Claude Agent Skill** (`mt-hackathon-design`) plus the design system it packages, built for **Хакатон Московского транспорта** (МТТЕХ / Транспортные Инновации Москвы, 25.09–03.10.2026) and team **Manticore**'s track-02 product **«Поток»** — a tram passenger-load forecasting dashboard.

## What this repo is (and isn't)

This is **not** a conventional bundled frontend app. There is no build step for the design system itself: components are plain `.jsx` files transpiled in-browser via Babel-standalone, loaded by CDN `<script>` tags, and exposed through the global `window.DesignSystem_8e46b6`. Do not propose Feature-Sliced Design / entities / features layers for the `components/`, `tokens/`, `assets/`, `guidelines/`, `ui_kits/` tree — that structure is fixed by the Skill format and by the generated bundle below.

`_ds_bundle.js` and `_ds_manifest.json` are **generated** files (format 4, namespace `DesignSystem_8e46b6`). They hardcode root-relative `sourcePath`s back to `components/**/*.jsx` and are referenced via `../../_ds_bundle.js`-style relative paths from every HTML entry point (`ui_kits/*/index.html`, `components/*/*.card.html`, `index2.html`). **Never move, rename, or hand-edit these two files or the components they reference** without regenerating them — doing so silently breaks every page that loads the bundle.

`SKILL.md` must stay at the repo root; that's how Claude Code/Desktop discovers it as an invocable skill.

## Layout

```
SKILL.md              Agent Skill manifest (name: mt-hackathon-design)
readme.md             Full design-system spec: brand voice, color, type, spacing, components index
styles.css            Single CSS entry point (@import list only)
_ds_bundle.js          GENERATED — compiled component bundle, do not hand-edit
_ds_manifest.json      GENERATED — component/card manifest consumed by tooling
index2.html            Design-system gallery shell
thumbnail.html / .thumbnail   Skill homepage tile

tokens/                fonts, colors, typography, spacing, radius, elevation, motion, base resets
guidelines/            Specimen cards (colors, type, spacing, brand) — *.card.html
assets/                Logo lockups, pin mark, currentColor sources

components/            19 components, grouped by category, each as .jsx + .d.ts + .prompt.md
  core/                Button, IconButton, Icon, Card, Badge, Tag
  forms/               Input, Select, Checkbox, Radio, Switch
  navigation/          Tabs, Accordion
  feedback/            Dialog, Toast, Tooltip
  data/                Stat, LoadMeter, Timeline

ui_kits/
  forecast-dashboard/  THE PRODUCT — «Поток» dispatcher dashboard, 5 screens
  hackathon-site/      Brand reference only — recreation of the organizers' landing page, not a deliverable

package.json, node_modules/   Vite, added only as a local static/dev server (see below)
```

## Running it

There's no app to "build." To view a prototype, serve the repo over HTTP (opening the HTML directly via `file://` breaks Babel-standalone's in-browser `.jsx` fetch under Chrome/Edge CORS rules):

```
npm install
npm run dev
```

Then open `http://localhost:<port>/ui_kits/forecast-dashboard/` (the product) or `http://localhost:<port>/ui_kits/hackathon-site/` (brand reference).

## Conventions

- Russian-language UI only; see `readme.md` § CONTENT FUNDAMENTALS for voice/tone rules (вы-form, sentence case, no emoji, «guillemets»).
- One accent color (signal red `#F0392B`), the five-step `--load-*` ramp is the only sanctioned load-color scale — see `readme.md` § VISUAL FOUNDATIONS before adding new colors.
- Icons: Lucide only, inlined as real SVG via `components/core/Icon.jsx`. Never CSS `mask-image` off the CDN (cross-origin masks paint as solid squares in some renderers).
- **Do not add `Co-Authored-By: Claude` (or similar AI attribution) to commits or PRs in this repo.**
