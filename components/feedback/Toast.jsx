import React from "react";

const TONE_BAR = { info: "var(--status-info)", ok: "var(--status-ok)", warn: "var(--status-warn)", danger: "var(--status-danger)" };

export function Toast({ title, description, tone = "info", icon, onClose, style, ...rest }) {
  return (
    <div role="status" style={{
      display: "flex", alignItems: "flex-start", gap: "var(--space-3)", width: 360, maxWidth: "100%",
      padding: "var(--space-4)", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)",
      boxShadow: "var(--inset-hairline-strong), var(--shadow-lg)", position: "relative", overflow: "hidden", ...style,
    }} {...rest}>
      <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: TONE_BAR[tone] || TONE_BAR.info }} />
      {icon && <span style={{ color: TONE_BAR[tone] || TONE_BAR.info, display: "flex", marginTop: 1 }}>{icon}</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: "var(--type-ui)", color: "var(--text-primary)" }}>{title}</div>
        {description && <div style={{ marginTop: 4, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{description}</div>}
      </div>
      {onClose && <button aria-label="Закрыть" onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", font: "16px/1 var(--font-sans)" }}>×</button>}
    </div>
  );
}
