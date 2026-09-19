import React from "react";

export function Timeline({ items = [], style, ...rest }) {
  return (
    <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", ...style }} {...rest}>
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <li key={i} style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: "var(--space-5)" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ width: it.done ? 14 : 12, height: it.done ? 14 : 12, marginTop: 6, borderRadius: "var(--radius-pill)", background: it.done ? "var(--accent)" : "transparent", boxShadow: it.done ? "0 0 0 4px var(--accent-quiet)" : "inset 0 0 0 2px var(--border-strong)" }} />
              {!last && <span style={{ flex: 1, width: 2, marginTop: 6, background: "var(--border-subtle)" }} />}
            </div>
            <div style={{ paddingBottom: last ? 0 : "var(--space-8)" }}>
              <div style={{ font: "var(--type-ui)", color: it.done ? "var(--text-accent)" : "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{it.date}</div>
              <div style={{ marginTop: 6, font: "var(--type-body)", color: "var(--text-primary)" }}>{it.title}</div>
              {it.note && <div style={{ marginTop: 4, font: "var(--type-body-s)", color: "var(--text-muted)" }}>{it.note}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
