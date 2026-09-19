import React from "react";

export function Accordion({ items = [], defaultOpen = -1, style, ...rest }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", ...style }} {...rest}>
      {items.map((it, i) => {
        const on = i === open;
        return (
          <div key={i} style={{ background: on ? "var(--bg-surface-2)" : "var(--bg-surface)", borderRadius: "var(--radius-lg)", boxShadow: "var(--inset-hairline)", transition: "var(--transition-ui)" }}>
            <button onClick={() => setOpen(on ? -1 : i)} aria-expanded={on}
              style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", gap: "var(--space-4)", padding: "20px 24px", background: "none", border: "none", cursor: "pointer", textAlign: "left", font: "var(--type-h4)", color: "var(--text-primary)" }}>
              {it.question}
              <span aria-hidden="true" style={{ width: 10, height: 10, flex: "0 0 auto", marginTop: on ? 4 : -4, borderRight: "2px solid var(--text-muted)", borderBottom: "2px solid var(--text-muted)", transform: on ? "rotate(-135deg)" : "rotate(45deg)", transition: "transform var(--dur-base) var(--ease-standard)" }} />
            </button>
            {on && <div style={{ padding: "0 24px 24px", font: "var(--type-body-s)", color: "var(--text-secondary)", maxWidth: 720 }}>{it.answer}</div>}
          </div>
        );
      })}
    </div>
  );
}
