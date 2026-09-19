import React from "react";

export function Select({ label, hint, options = [], value, onChange, disabled = false, id, style, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <label htmlFor={id} style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", ...style }}>
      {label && <span style={{ font: "var(--type-ui-s)", color: "var(--text-secondary)" }}>{label}</span>}
      <span style={{ position: "relative", display: "block" }}>
        <select id={id} value={value} onChange={onChange} disabled={disabled}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            width: "100%", height: 48, padding: "0 44px 0 16px", appearance: "none",
            background: "var(--bg-surface-2)", color: "var(--text-primary)", font: "var(--type-body-s)",
            border: "none", borderRadius: "var(--radius-md)", outline: "none", cursor: disabled ? "not-allowed" : "pointer",
            boxShadow: `inset 0 0 0 ${focus ? 2 : 1}px ${focus ? "var(--focus-ring)" : "var(--border-default)"}`,
            opacity: disabled ? 0.45 : 1, transition: "var(--transition-ui)",
          }} {...rest}>
          {options.map((o) => <option key={o.value} value={o.value} style={{ color: "#000" }}>{o.label}</option>)}
        </select>
        <span aria-hidden="true" style={{
          position: "absolute", right: 16, top: "50%", width: 10, height: 10, marginTop: -7,
          borderRight: "2px solid var(--text-muted)", borderBottom: "2px solid var(--text-muted)",
          transform: "rotate(45deg)", pointerEvents: "none",
        }} />
      </span>
      {hint && <span style={{ font: "var(--type-caption)", color: "var(--text-muted)" }}>{hint}</span>}
    </label>
  );
}
