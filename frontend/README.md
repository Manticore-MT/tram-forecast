# Поток

A dark-first, Russian-language React + TypeScript app for the **Хакатон Московского транспорта** (25.09 — 03.10.2026) and for the product built on its track 02, **«ИИ-прогноз загрузки трамвайных маршрутов»**, by team **Manticore**.

## Context

The hackathon is run by the **фонд «Транспортные инновации Москвы»**, the Moscow Government IT company **МТТЕХ**, and **ООО «ВСМ-400»**, with the support of the Moscow Department of Transport. МТТЕХ is the development centre behind the transport apps millions of passengers use daily — fares, journey planning, the driverless tram programme. Two surfaces are covered here:

1. **«Поток» — the product** (`src/products/forecast-dashboard/`). **This is the deliverable.** The track-02 dispatcher service: tram passenger-load forecasts at 1-day / 1-month / 1-year horizons, aggregated by route, stop and time window, on a real map of Moscow. Five screens: Карта загрузки, Обзор сети, Маршрут, Модель, Данные. It is a **proposal, not a recreation** — no existing product design was supplied, so it is the brand applied to the brief.
2. **Hackathon site** (`src/products/hackathon-site/`) — **brand source, not a deliverable.** The organizers' landing page was the only evidence of the visual identity, so it is recreated here as the reference the product's look is derived from.

### What was NOT available — flagged substitutions
- **No font binaries.** Substituted **Manrope** (geometric grotesque, full Cyrillic, closest match to the wordmark's angular «М») and **JetBrains Mono** for numerics. Loaded from Google Fonts in `src/styles/tokens/fonts.css`.
- **No colour specification.** The only hard evidence is the white-on-black logo. The ink scale is derived from it; the **signal red** accent and the five-step passenger-load ramp are a proposal.
- **No icon set.** Substituted **Lucide** (2 px stroke, rounded caps), pulled per-glyph from the CDN and inlined as real SVG geometry so icons inherit `currentColor`.
- **No photography or illustration.** Expert portraits and any imagery render as labelled empty plates — nothing was invented.

## Running it

```
npm install
npm run dev
```

Open `http://localhost:5173/` for the dashboard (default route), or `http://localhost:5173/#/hackathon-site` for the brand-reference landing page.

## Structure

```
src/
  main.tsx, App.tsx        entry point + route switch between the two products
  styles/
    index.css              single CSS entry point (@import list)
    tokens/                 fonts, colors, typography, spacing, radius, elevation, motion, base resets
  assets/                   logo lockups, pin mark (SVG)
  components/               19 shared components, typed, grouped by category
    core/                   Button, IconButton, Icon, Card, Badge, Tag
    forms/                  Input, Select, Checkbox, Radio, Switch
    navigation/             Tabs, Accordion
    feedback/               Dialog, Toast, Tooltip
    data/                   Stat, LoadMeter, Timeline
  products/
    forecast-dashboard/     THE PRODUCT — «Поток» dispatcher dashboard, 5 screens, real Leaflet/OSM map
    hackathon-site/         brand reference only — recreation of the organizers' landing page
```

## CONTENT FUNDAMENTALS

**Language.** Russian throughout. No English UI strings, no transliteration. Latin appears only in proper nouns and tech terms the audience already reads in Latin: `MAPE`, `CSV`, `ML`, `Spring Boot`, `React`.

**Person and address.** The site speaks to the reader as **вы**, almost always in the **imperative plural**: «Решайте реальные задачи», «Создавайте решения», «Выбирайте один трек», «Получайте обратную связь», «Вступайте в чат». The organizers never say «мы» about themselves in headlines — the verbs carry the message.

**Headline style.** Noun phrases or imperatives, no terminal punctuation, no exclamation marks. Section headings are one or two plain words: «О хакатоне», «Задачи», «Призовой фонд», «Таймлайн», «Эксперты», «Организаторы», «Ответы на вопросы» — not «FAQ».

**Label : value.** Facts are written as a short uppercase-ish label with a bare value under it, never as a sentence: «Даты / 25 сентября — 3 октября», «Формат / Онлайн с финалом в Москве», «Команда / От 3 до 5 человек».

**Numbers.** Thin/normal space as thousands separator, currency symbol after the number with a space: `4 000 000 ₽`. Percent takes a space: `86 %`. Decimal separator is a dot in technical metrics (`7.4 %`, `0.91`) and «п.п.» for percentage points.

**Tone.** Civic and matter-of-fact, with a scale flex — «миллионы людей», «приводит целый город в движение». No hype adjectives, no exclamation.

**Casing.** Sentence case everywhere. ALL-CAPS only for the small eyebrow labels (`.mt-eyebrow`), never headlines or buttons.

**Emoji: never.**

**Quotes.** Russian guillemets: «ВСМ-400», «Транспортные инновации Москвы».

## VISUAL FOUNDATIONS

**Ground.** Dark-first — `--bg-page` is `#0E1113`; surfaces step up through `#15191C` → `#1C2226` → `#252D33`. A `[data-theme="light"]` scope exists for print/export only.

**Colour.** One hero accent: **signal red `#F0392B`** — primary CTAs, live/now marker, reached timeline milestones, peak load. Scarce: at most one red element per view. The **passenger-load ramp** (`--load-1` … `--load-5`, green → lime → amber → orange → red) is the *only* sanctioned load colour scale. Chart series use cyan/blue/teal/lime. **No violet, no multi-hue gradients.**

**Type.** Manrope for display/headings/UI; JetBrains Mono (tabular) for every number. Display is 800 weight at −0.03em tracking, leading under 1.0. Body is 400, never bolded for emphasis.

**Spacing.** 4 px grid. Marketing sections breathe at `--space-section` 96 px (160 px hero); product UI never exceeds 32 px internal padding. Content max width 1240 px.

**Cards.** Fill + hairline, no drop shadow. `surface` is default; `raised` steps the fill up; `glass` (6% white fill + 16px blur) only legal over map/chart/coloured ground; `accent` solid red; `outline` transparent hairline.

**Radii and the pin.** Generous: 10 / 14 / 20 / 28 / 40 px plus a pill. `--radius-pin` (three 40px corners, one 6px corner) on at most one or two hero elements per page.

**Maps.** Real geometry only — OSM basemap under a dark tile filter, never a drawn city. Load carried by marker fill and segment colour off `--load-*`.

**Data visualisation.** Fact is a solid 2.5px cyan line with soft fill; forecast is a **dashed** 2.5px red line; confidence band is red at 14% opacity. A dashed vertical rule labelled «сейчас» separates them.

**Icons.** Lucide (1.5px stroke, rounded caps), fetched per-glyph and inlined as real SVG via `src/components/core/Icon.tsx` so glyphs inherit `currentColor`. Sizes: 14px in chips/badges, 16px inline, 18px in buttons/nav, 20–24px as a card's leading glyph.

**Synthetic data.** All numbers in the dashboard are generated by `seedSeries` with a двухпиковый (morning/evening) shape. Nothing is a real measurement. Map stop positions are approximate coordinates of named landmarks; connectors are straight segments, not surveyed track geometry.
