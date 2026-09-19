import React from "react";

export interface InputProps {
  label?: string;
  hint?: string;
  /** error message — replaces hint and reddens the ring */
  error?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  style?: React.CSSProperties;
}

/** Single-line text field, 48px tall, dark inset surface with a hairline that turns cyan on focus and red on error. */
export function Input({ label, hint, error, value, defaultValue, placeholder, type = "text", prefix, suffix, disabled = false, onChange, id, style, ...rest }: InputProps) {
  const [focus, setFocus] = React.useState(false);
  const ringColor = error ? "var(--status-danger)" : focus ? "var(--focus-ring)" : "var(--border-default)";
  return (
    <label htmlFor={id} style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", ...style }}>
      {label && <span style={{ font: "var(--type-ui-s)", color: "var(--text-secondary)" }}>{label}</span>}
      <span style={{
        display: "flex", alignItems: "center", gap: "var(--space-2)", height: 48, padding: "0 16px",
        background: "var(--bg-surface-2)", borderRadius: "var(--radius-md)",
        boxShadow: `inset 0 0 0 ${focus || error ? 2 : 1}px ${ringColor}`,
        opacity: disabled ? 0.45 : 1, transition: "var(--transition-ui)",
      }}>
        {prefix && <span style={{ color: "var(--text-muted)", display: "flex" }}>{prefix}</span>}
        <input id={id} type={type} value={value} defaultValue={defaultValue} placeholder={placeholder} disabled={disabled}
          onChange={onChange} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", color: "var(--text-primary)", font: "var(--type-body-s)" }} {...rest} />
        {suffix && <span style={{ color: "var(--text-muted)", display: "flex" }}>{suffix}</span>}
      </span>
      {(error || hint) && <span style={{ font: "var(--type-caption)", color: error ? "var(--status-danger)" : "var(--text-muted)" }}>{error || hint}</span>}
    </label>
  );
}
