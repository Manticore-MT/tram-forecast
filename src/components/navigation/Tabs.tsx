import React from "react";

export interface TabsProps {
  items: { value: string; label: React.ReactNode }[];
  value?: string;
  variant?: "pill" | "underline";
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
}

/** Section switcher. Pill variant for compact in-panel switching, underline for page-level sections. */
export function Tabs({ items = [], value, onChange, variant = "pill", style, ...rest }: TabsProps) {
  const active = value ?? items[0]?.value;
  if (variant === "underline") {
    return (
      <div role="tablist" style={{ display: "flex", gap: "var(--space-6)", boxShadow: "inset 0 -1px 0 var(--border-subtle)", ...style }} {...rest}>
        {items.map((it) => {
          const on = it.value === active;
          return (
            <button key={it.value} role="tab" aria-selected={on} onClick={() => onChange && onChange(it.value)}
              style={{
                background: "none", border: "none", cursor: "pointer", padding: "0 0 14px", font: "var(--type-ui)", whiteSpace: "nowrap",
                color: on ? "var(--text-primary)" : "var(--text-muted)", transition: "var(--transition-ui)",
                boxShadow: on ? "inset 0 -2px 0 var(--accent)" : "none",
              }}>{it.label}</button>
          );
        })}
      </div>
    );
  }
  return (
    <div role="tablist" style={{ display: "inline-flex", gap: "var(--space-1)", padding: 4, background: "var(--bg-surface-2)", borderRadius: "var(--radius-pill)", boxShadow: "var(--inset-hairline)", ...style }} {...rest}>
      {items.map((it) => {
        const on = it.value === active;
        return (
          <button key={it.value} role="tab" aria-selected={on} onClick={() => onChange && onChange(it.value)}
            style={{
              height: 36, padding: "0 18px", border: "none", borderRadius: "var(--radius-pill)", cursor: "pointer",
              font: "var(--type-ui-s)", whiteSpace: "nowrap", transition: "var(--transition-ui)",
              background: on ? "var(--bg-inverse)" : "transparent", color: on ? "var(--text-inverse)" : "var(--text-muted)",
            }}>{it.label}</button>
        );
      })}
    </div>
  );
}
