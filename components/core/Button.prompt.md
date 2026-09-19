Pill-shaped action control; the red `primary` variant is reserved for the single most important action on a screen.

```jsx
<Button size="lg" iconRight={<Icon name="arrow-right" />}>Принять участие</Button>
<Button variant="secondary">Подробнее о треке</Button>
<Button variant="ghost" size="sm">Сбросить фильтры</Button>
```

Variants: `primary` (signal red + red glow shadow), `secondary` (transparent with hairline), `ghost` (label only), `inverse` (white fill, dark label — for use on top of red or photography). Sizes 36 / 44 / 56px. Never place two `primary` buttons in one view.
