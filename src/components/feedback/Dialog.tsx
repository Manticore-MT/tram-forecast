import React from "react";

export interface DialogProps {
  open?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
  onClose?: () => void;
  style?: React.CSSProperties;
}

/** Modal over a blurred scrim. Positioned absolutely — give the mount an explicit position:relative. */
export function Dialog({ open = true, title, description, children, footer, onClose, width = 480, style, ...rest }: DialogProps) {
  if (!open) return null;
  return (
    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "var(--overlay-scrim)", backdropFilter: "var(--blur-scrim)", zIndex: 50 }}>
      <div role="dialog" aria-modal="true" style={{ width, maxWidth: "92%", background: "var(--bg-surface-2)", borderRadius: "var(--radius-xl)", boxShadow: "var(--inset-hairline-strong), var(--shadow-lg)", padding: "var(--space-8)", ...style }} {...rest}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-4)" }}>
          <h3 style={{ margin: 0, font: "var(--type-h3)", letterSpacing: "var(--tracking-tight)" }}>{title}</h3>
          {onClose && <button aria-label="Закрыть" onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", font: "20px/1 var(--font-sans)" }}>×</button>}
        </div>
        {description && <p style={{ margin: "var(--space-3) 0 0", font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{description}</p>}
        {children && <div style={{ marginTop: "var(--space-6)" }}>{children}</div>}
        {footer && <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-3)", marginTop: "var(--space-8)" }}>{footer}</div>}
      </div>
    </div>
  );
}
