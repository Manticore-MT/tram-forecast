import React from "react";
import { cn } from "@/lib/utils";

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
  /** md (48px, default) for standalone forms; sm (36px) for inline use next to h-9 controls
   *  (nav buttons, date jump, scenario multipliers) — same surface/shadow/radius, just shorter. */
  size?: "sm" | "md";
  /** text alignment inside the field — right for numeric/tabular entry (e.g. scenario multipliers) */
  align?: "left" | "right";
  /** bounds for type="date"/"number" */
  min?: string;
  max?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  "aria-label"?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  style?: React.CSSProperties;
}

/** Single-line text field, dark inset surface with a hairline that turns cyan on focus and red on error. */
export function Input({ label, hint, error, value, defaultValue, placeholder, type = "text", prefix, suffix, disabled = false, size = "md", align = "left", onChange, id, style, ...rest }: InputProps) {
  return (
    <label htmlFor={id} className="flex flex-col gap-2" style={style}>
      {label && <span className="text-ui-s text-text-secondary">{label}</span>}
      <div
        className={cn(
          "flex items-center gap-2 rounded-md bg-(--control-surface,var(--bg-surface-2)) shadow-(--inset-hairline-strong) transition-ui",
          size === "sm" ? "h-9 px-3" : "h-12 px-4",
          "focus-within:shadow-[inset_0_0_0_2px_var(--focus-ring)]",
          error && "shadow-[inset_0_0_0_2px_var(--status-danger)]",
          disabled && "opacity-45"
        )}
      >
        {prefix && <span className="flex text-text-muted">{prefix}</span>}
        <input
          id={id}
          type={type}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={disabled}
          onChange={onChange}
          className={cn(
            "h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-text-primary shadow-none outline-none scheme-dark placeholder:text-text-muted disabled:pointer-events-none disabled:cursor-not-allowed",
            size === "sm" ? "text-ui-s" : "text-body-s",
            align === "right" && "text-right"
          )}
          {...rest}
        />
        {suffix && <span className="flex text-text-muted">{suffix}</span>}
      </div>
      {(error || hint) && (
        <span className={cn("text-caption", error ? "text-status-danger" : "text-text-muted")}>
          {error || hint}
        </span>
      )}
    </label>
  );
}
