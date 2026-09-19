import React from "react";

export interface RadioProps {
  label?: React.ReactNode;
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  style?: React.CSSProperties;
}

/** Single-choice control; selected state is a 6px red ring-fill. */
export function Radio({ label, checked = false, onChange, disabled = false, name, value, style, ...rest }: RadioProps) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-3)", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1, font: "var(--type-body-s)", color: "var(--text-secondary)", ...style }}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} disabled={disabled} style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} {...rest} />
      <span aria-hidden="true" style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, flex: "0 0 auto",
        borderRadius: "var(--radius-pill)", transition: "var(--transition-ui)",
        boxShadow: checked ? "inset 0 0 0 6px var(--accent)" : "inset 0 0 0 1.5px var(--border-strong)",
      }} />
      {label}
    </label>
  );
}
