import React from "react";

export function Checkbox({ label, checked = false, onChange, disabled = false, style, ...rest }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-3)", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1, font: "var(--type-body-s)", color: "var(--text-secondary)", ...style }}>
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} {...rest} />
      <span aria-hidden="true" style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, flex: "0 0 auto",
        borderRadius: "var(--radius-xs)", transition: "var(--transition-ui)",
        background: checked ? "var(--accent)" : "transparent",
        boxShadow: checked ? "none" : "inset 0 0 0 1.5px var(--border-strong)",
      }}>
        {checked && <span style={{ width: 10, height: 6, marginTop: -3, borderLeft: "2px solid var(--on-accent)", borderBottom: "2px solid var(--on-accent)", transform: "rotate(-45deg)" }} />}
      </span>
      {label}
    </label>
  );
}
