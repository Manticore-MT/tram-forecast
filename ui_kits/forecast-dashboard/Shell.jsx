const { Button, IconButton, Icon, Badge, Tabs, Tag, Card, Tooltip } = window.DesignSystem_8e46b6;

const NAV = [
  ["map", "map-pin", "Карта загрузки"],
  ["overview", "activity", "Обзор сети"],
  ["route", "route", "Маршрут"],
  ["model", "brain", "Модель"],
  ["data", "layers", "Данные"],
];

function Sidebar({ view, onView }) {
  return (
    <aside style={{ width: 232, flex: "0 0 auto", background: "var(--bg-surface)", boxShadow: "inset -1px 0 0 var(--border-subtle)", display: "flex", flexDirection: "column", padding: "var(--space-6) var(--space-4)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", padding: "0 var(--space-3) var(--space-8)" }}>
        <img src="../../assets/mark-pin-white.svg" alt="" style={{ height: 26 }} />
        <div>
          <div style={{ font: "var(--type-h4)", letterSpacing: "var(--tracking-tight)" }}>Поток</div>
          <div style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>Manticore · трек 02</div>
        </div>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        {NAV.map(([id, ic, label]) => {
          const on = id === view;
          return (
            <button key={id} onClick={() => onView(id)} style={{
              display: "flex", alignItems: "center", gap: "var(--space-3)", height: 44, padding: "0 var(--space-3)",
              border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", font: "var(--type-ui-s)", textAlign: "left",
              background: on ? "var(--accent-quiet)" : "transparent", color: on ? "var(--text-accent)" : "var(--text-secondary)",
              transition: "var(--transition-ui)",
            }}><Icon name={ic} size={18} />{label}</button>
          );
        })}
      </nav>
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <Card tone="outline" padding="var(--space-4)">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <Badge tone="ok" dot>Поток данных</Badge>
          </div>
          <div style={{ marginTop: "var(--space-3)", font: "var(--type-mono-s)", color: "var(--text-muted)" }}>валидации · 12 с назад<br />телематика · 4 с назад</div>
        </Card>
      </div>
    </aside>
  );
}

function TopBar({ horizon, onHorizon, route, onRoute, onExport }) {
  return (
    <header style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", padding: "var(--space-5) var(--space-8)", boxShadow: "inset 0 -1px 0 var(--border-subtle)" }}>
      <div style={{ display: "flex", gap: "var(--space-2)" }}>
        {["3", "17", "27", "А"].map((r) => <Tag key={r} selected={r === route} onClick={() => onRoute(r)} icon={<Icon name="tram-front" size={14} />}>{r}</Tag>)}
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        <Tabs value={horizon} onChange={onHorizon} items={[{ value: "day", label: "1 день" }, { value: "month", label: "1 месяц" }, { value: "year", label: "1 год" }]} />
        <Tooltip content="Выгрузить прогноз в CSV"><IconButton label="Экспорт" icon={<Icon name="download" size={18} />} onClick={onExport} /></Tooltip>
        <div style={{ width: 36, height: 36, borderRadius: "var(--radius-pill)", background: "var(--ink-600)", boxShadow: "var(--inset-hairline-strong)", display: "grid", placeItems: "center", font: "var(--type-ui-s)" }}>ЕД</div>
      </div>
    </header>
  );
}

function Panel({ title, action, children, style }) {
  return (
    <Card tone="surface" padding="var(--space-6)" style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)", ...style }}>
      {(title || action) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-4)" }}>
          <div style={{ font: "var(--type-h4)" }}>{title}</div>
          {action}
        </div>
      )}
      {children}
    </Card>
  );
}

function LoadLegend() {
  const labels = ["Свободно", "Комфортно", "Умеренно", "Плотно", "Перегружено"];
  return (
    <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
      {labels.map((l, i) => (
        <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 6, font: "var(--type-caption)", color: "var(--text-muted)" }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: LOAD_VARS[i] }} />{l}
        </span>
      ))}
    </div>
  );
}

Object.assign(window, { Sidebar, TopBar, Panel, LoadLegend, NAV });
