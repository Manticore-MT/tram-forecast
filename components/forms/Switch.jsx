import React from "react";

export function Switch({ label, checked = false, onChange, disabled = false, style, ...rest }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-3)", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1, font: "var(--type-body-s)", color: "var(--text-secondary)", ...style }}>
      <input type="checkbox" role="switch" checked={checked} onChange={onChange} disabled={disabled} style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} {...rest} />
      <span aria-hidden="true" style={{
        position: "relative", width: 44, height: 26, flex: "0 0 auto", borderRadius: "var(--radius-pill)",
        background: checked ? "var(--accent)" : "var(--ink-600)",
        boxShadow: checked ? "none" : "inset 0 0 0 1px var(--border-default)",
        transition: "background-color var(--dur-fast) var(--ease-standard)",
      }}>
        <span style={{
          position: "absolute", top: 3, left: checked ? 21 : 3, width: 20, height: 20,
          borderRadius: "var(--radius-pill)", background: "var(--white)",
          transition: "left var(--dur-fast) var(--ease-standard)",
        }} />
      </span>
      {label}
    </label>
  );
}
