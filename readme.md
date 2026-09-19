# Хакатон Московского транспорта — Design System

A dark-first, Russian-language design system for the **Хакатон Московского транспорта** (25.09 — 03.10.2026) and for the product built on its track 02, **«ИИ-прогноз загрузки трамвайных маршрутов»**, by team **Manticore**.

## Context

The hackathon is run by the **фонд «Транспортные инновации Москвы»**, the Moscow Government IT company **МТТЕХ**, and **ООО «ВСМ-400»**, with the support of the Moscow Department of Transport. МТТЕХ is the development centre behind the transport apps millions of passengers use daily — fares, journey planning, the driverless tram programme. Two surfaces are covered here:

1. **«Поток» — the product** (`ui_kits/forecast-dashboard/`). **This is the deliverable.** The track-02 dispatcher service: tram passenger-load forecasts at 1-day / 1-month / 1-year horizons, aggregated by route, stop and time window, on a real map of Moscow. Five screens: Карта загрузки, Обзор сети, Маршрут, Модель, Данные. It is a **proposal, not a recreation** — no existing product design was supplied, so it is the brand applied to the brief.
2. **Hackathon site** (`ui_kits/hackathon-site/`) — **brand source, not a deliverable.** The organizers' landing page was the only evidence of the visual identity, so it is recreated here as the reference the product's look is derived from.

### Sources given
- `uploads/Logo.svg` — the combined organizer lockup (МТТЕХ + Транспортные Инновации Москвы), white-on-dark, 657×104. Split into individual assets in `assets/`.
- Product copy pasted from the public site **https://mt-hackathon.ru/** (Tilda-hosted). All Russian strings in the kits are taken verbatim from that copy.
- The track-02 brief (dataset description, key features, recommended team roles).
- Registration flow: https://reg.mt-hackathon.ru/register · contact ask@pgenesis.ru

### What was NOT available — flagged substitutions
- **No font binaries.** Substituted **Manrope** (geometric grotesque, full Cyrillic, closest match to the wordmark's angular «М») and **JetBrains Mono** for numerics. Loaded from Google Fonts in `tokens/fonts.css`. *Please send the real brand faces.*
- **No colour specification.** The only hard evidence is the white-on-black logo. The ink scale is derived from it; the **signal red** accent and the five-step passenger-load ramp are a proposal. *Please confirm or replace the accent hex.*
- **No icon set.** Substituted **Lucide** (2 px stroke, rounded caps), pulled per-glyph from the CDN and inlined as real SVG geometry so icons inherit `currentColor`. See ICONOGRAPHY.
- **No photography or illustration.** Expert portraits and any imagery render as labelled empty plates — nothing was invented.

---

## CONTENT FUNDAMENTALS

**Language.** Russian throughout. No English UI strings, no transliteration. Latin appears only in proper nouns and tech terms the audience already reads in Latin: `MAPE`, `CSV`, `ML`, `Spring Boot`, `React`.

**Person and address.** The site speaks to the reader as **вы**, almost always in the **imperative plural**: «Решайте реальные задачи», «Создавайте решения», «Выбирайте один трек», «Получайте обратную связь», «Вступайте в чат». The organizers never say «мы» about themselves in headlines — the verbs carry the message. One notable inconsistency exists in the source copy and is preserved: «Попади в команду Московского транспорта» drops to **ты**. Follow the **вы** form for anything new.

**Headline style.** Noun phrases or imperatives, no terminal punctuation, no exclamation marks. Section headings are one or two plain words: «О хакатоне», «Задачи», «Призовой фонд», «Таймлайн», «Эксперты», «Организаторы», «Ответы на вопросы». Note «Ответы на вопросы» — not «FAQ», not «Частые вопросы».

**Label : value.** Facts are written as a short uppercase-ish label with a bare value under it, never as a sentence: «Даты / 25 сентября — 3 октября», «Формат / Онлайн с финалом в Москве», «Команда / От 3 до 5 человек». Reuse this pattern for product metrics.

**Numbers.** Thin/normal space as thousands separator, currency symbol after the number with a space: `4 000 000 ₽`, `500 000 ₽`. Dates in body copy are spelled out («25 сентября»); in compact chrome they use dotted numerals with an em-dash range: `25.09 — 03.10`. Percent takes a space: `86 %`. Decimal separator is a dot in technical metrics (`7.4 %`, `0.91`) and «п.п.» for percentage points.

**Tone.** Civic and matter-of-fact, with a scale flex — «миллионы людей», «приводит целый город в движение». It sells impact, not fun. No hype adjectives («невероятный», «крутой»), no exclamation, no second-person jokes.

**Casing.** Sentence case everywhere. ALL-CAPS is used only for the small eyebrow labels in this system (`.mt-eyebrow`), never for headlines or buttons. Buttons are sentence case: «Принять участие», «Подать заявку», «Построить прогноз».

**Emoji: never.** The source uses none. Do not introduce them.

**Quotes.** Russian guillemets: «ВСМ-400», «Транспортные инновации Москвы».

**Product voice (dashboard).** Same register, shorter. Dispatcher-facing strings are instructions with a number in them: «Добавить 2 вагона на выпуск», «Сократить интервал до 5 мин», «Прогноз 86 %». States are single words in a badge: «в проде», «архив», «Пик», «Резерв».

---

## VISUAL FOUNDATIONS

**Ground.** Dark-first and unapologetically so — the supplied logo only exists as white-on-black. `--bg-page` is `#0E1113`, near-black with a faint blue-green cast; surfaces step up through `#15191C` → `#1C2226` → `#252D33`. A `[data-theme="light"]` scope exists for print and exported reports only; it is not a first-class mode.

**Colour.** One hero accent: **signal red `#F0392B`**, used for primary CTAs, the live/now marker, reached timeline milestones, and peak load. It is scarce — at most one red element per view. Everything else is neutral until data needs a hue. The **passenger-load ramp** (`--load-1` … `--load-5`, green → lime → amber → orange → red) is the *only* sanctioned load colour scale; map, meter, heatmap and table all read from it so they can never disagree. Chart series use cyan/blue/teal/lime. **No violet, no purple, no multi-hue gradients.**

**Type.** One family does display, headings and UI (Manrope); one does every number (JetBrains Mono, tabular figures). Display is 800 weight at −0.03em tracking with leading under 1.0 — big, tight, structural. Body is 400 and never bolded for emphasis; emphasis comes from colour (`--text-primary` vs `--text-secondary`). Eyebrows are 12/700 uppercase at 0.14em, always muted grey — they label, they don't shout.

**Spacing and layout.** 4 px grid. Marketing sections breathe at `--space-section` 96 px (160 px for the hero); product UI never exceeds 32 px of internal padding. Content max width 1240 px, gutter 24 px, prose measure 760 px. The nav bar is the only fixed element on the site (sticky, translucent, blurred); the dashboard is a fixed two-pane shell — 232 px sidebar, scrolling main — with nothing else pinned.

**Backgrounds.** Flat colour. No photography was supplied and none is faked. The only decoration permitted is the **pin mark used as an oversized watermark at 5 % opacity**, bleeding off a corner of the hero. No repeating patterns, no noise, no aggressive gradients; the single gradient in the system is the soft cyan fade under the actual-data area of a chart.

**Radii and the pin.** Radii are generous: 10 / 14 / 20 / 28 / 40 px plus a pill. The identity motif is the logo's **teardrop pin**, reproduced as `--radius-pin` — three 40 px corners and one 6 px corner. Use it on at most one or two hero elements per page (the prize card, the standout benefit card); never on a whole grid, where it becomes noise.

**Cards.** Fill + hairline, no drop shadow. `surface` (`#15191C` + 1 px inset hairline) is the default; `raised` steps the fill up; `glass` is a 6 % white fill with 16 px backdrop blur and is only legal over a map, chart or coloured ground; `accent` is solid red with white copy; `outline` is transparent with a hairline. Corners 28 px by default.

**Elevation.** On dark ground, elevation is expressed as a **lighter fill plus a brighter hairline**, not shadow. Shadows appear only for things that truly float: dialogs, toasts, tooltips, map popovers (`--shadow-md`, `--shadow-lg`). One exception: primary buttons carry `--shadow-accent`, a red glow that reads as emission rather than depth.

**Transparency and blur.** Reserved for layers over content: the sticky nav (78 % page colour + blur), the dialog scrim (`--overlay-scrim` + 4 px blur), and glass panels over the schematic map. Never used for plain text on a plain background — text is always full-opacity ink.

**Borders.** Hairlines are `rgba(255,255,255,.09 / .16 / .28)` rendered as `inset box-shadow` rather than `border`, so they never change layout. 2 px borders exist only as focus rings and the active-tab underline.

**Motion.** Short and mechanical — transit signage, not a toy. 140 ms for hover/press, 220 ms for panels and accordions, 400 ms for view transitions, 640 ms for scroll reveals, all on `cubic-bezier(.2,.6,.2,1)`. Nothing bounces, nothing overshoots, nothing springs. Everything collapses to 0 ms under `prefers-reduced-motion`.

**Hover states.** Fills lighten (`rgba(255,255,255,.06→.12)`), text goes from `--text-secondary` to `--text-primary`, hairlines step one level stronger. The red primary button goes *lighter* on hover (`--red-400`), not darker. Interactive cards lift 2 px and gain a shadow. Links gain an underline at 3 px offset.

**Press states.** Uniform `scale(0.98)` plus the darker `--red-600` on primary. No colour-only press states; no ripples.

**Focus.** A 2 px cyan (`--focus-ring`) outline at 2 px offset — the one place cyan appears outside data viz, chosen so it can never be mistaken for the red accent's meaning.

**Selected states.** Selection *inverts*: the chosen chip or tab becomes a **white pill with dark text**. Red is never used to mean "selected" — only "important" or "peak".

**Imagery.** None supplied. When it arrives, expect cool, desaturated urban photography; place it full-bleed behind a scrim, never inside a rounded card without one, and keep text at full opacity on top.

**Maps.** Real geometry only — an OpenStreetMap basemap under a dark tile filter (`grayscale → invert → hue-rotate`), never a drawn city. Map overlays are `glass` cards pinned to the corners; controls sit bottom-right; attribution stays visible. Load is carried by marker fill and segment colour off `--load-*`, never by marker size alone.

**Data visualisation.** Fact is a solid 2.5 px cyan line with a soft fill; forecast is a **dashed** 2.5 px red line; the confidence band is red at 14 % opacity. A dashed vertical rule labelled «сейчас» always separates them. Grid lines are the subtle hairline colour; axis labels are 11 px mono, muted. The dashboard map is intentionally a **schematic route strip**, not a geographic map — no real geometry was supplied and none is faked.

---

## ICONOGRAPHY

- **No brand icon set exists in the supplied material** — the upload contains only the organizer lockup. **Lucide is the flagged substitute**: 1.5 px stroke, rounded caps and joins, 24 px grid, which matches the logo's even-stroke, rounded-terminal construction better than a filled set would.
- Icons are pulled per-glyph from `https://unpkg.com/lucide-static@0.544.0/icons/<name>.svg` and **inlined as real SVG geometry** by `components/core/Icon.jsx`, which renders the `<svg>` shell itself with `stroke="currentColor"` — so a glyph always takes its parent's colour and never needs a recoloured copy. Fetches are cached per name and the working set below is warmed at module load. (Do **not** revert to a CSS `mask-image` off the CDN: cross-origin mask images are dropped by some renderers and paint as solid squares.) If the project must go offline, vendor the used SVGs into `assets/icons/` and change the one URL in `Icon.jsx`.
- **Working set:** `tram-front`, `train-front`, `route`, `map-pin`, `layers`, `activity`, `trending-up`, `brain`, `refresh-cw`, `download`, `send`, `mail`, `users`, `calendar`, `clock`, `trophy`, `check`, `triangle-alert`, `arrow-right`, `chevron-down`, `messages-square`, `play`.
- **Sizes:** 14 px inside chips and badges, 16 px inline with body text, 18 px in buttons and nav, 20–24 px as a card's leading glyph. Never larger — the brand has a logo for large-scale expression, not an icon.
- **Colour:** icons inherit text colour. Only two exceptions are sanctioned: a status icon inside a Toast takes the tone colour, and load-scale swatches take `--load-*`.
- **Emoji and unicode-as-icon: never.** Two unicode characters are used as *typography*, not icons: `▲`/`▼` in `Stat` trend deltas, and `×` as the dialog/toast close glyph.
- **The logo is not an icon.** Never inline the lockup at icon scale; the pin mark (`assets/mark-pin-white.svg`) is the only mark cleared for small use, and only as an app/product mark (dashboard sidebar) or an oversized watermark.

---

## Index

**Root**
- `styles.css` — the single entry point consumers link. `@import` list only.
- `readme.md` — this file. `SKILL.md` — Agent-Skills wrapper.
- `thumbnail.html` — homepage tile.

**`tokens/`** — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `radius.css`, `elevation.css`, `motion.css`, `base.css` (element resets + `.mt-eyebrow`, `.mt-container`, `.mt-num` helpers).

**`assets/`** — `logo-lockup-white/-ink.svg` (full organizer lockup), `logo-mttech-white/-ink.svg`, `logo-tim-white/-ink.svg`, `mark-pin-white.svg`, `logo.svg` / `logo-lockup.svg` (currentColor source).

**`guidelines/`** — 17 specimen cards across Colors, Type, Spacing and Brand.

**Components** (19, each with `.jsx` + `.d.ts` + `.prompt.md`)
- `components/core/` — **Button**, **IconButton**, **Icon**, **Card**, **Badge**, **Tag**
- `components/forms/` — **Input**, **Select**, **Checkbox**, **Radio**, **Switch**
- `components/navigation/` — **Tabs**, **Accordion**
- `components/feedback/` — **Dialog**, **Toast**, **Tooltip**
- `components/data/` — **Stat**, **LoadMeter**, **Timeline**

*Intentional additions* (no source component library was supplied, so a standard set was authored; these three go beyond it for domain reasons): **LoadMeter** — the single sanctioned expression of passenger load, so every surface agrees; **Timeline** — the site's «Таймлайн» section is a first-class pattern; **Icon** — a wrapper needed because the icon set is a CDN substitute rather than a bundled font.

**UI kits**
- `ui_kits/forecast-dashboard/` — **the product.** `index.html`, `MapScreens.jsx`, `Charts.jsx`, `Shell.jsx`, `Screens.jsx`, `DashApp.jsx`. Uses Leaflet + OpenStreetMap tiles for the Moscow map (pinned, hash-verified tags; attribution retained).
- `ui_kits/hackathon-site/` — brand reference. `index.html`, `Sections.jsx`, `Tracks.jsx`, `App.jsx`.

No slide template was supplied, so no sample slides were created.
