import React from "react";
import { cn } from "@/lib/utils";

export interface ToastProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: "info" | "ok" | "warn" | "danger";
  icon?: React.ReactNode;
  onClose?: () => void;
  style?: React.CSSProperties;
}

const TONE_COLOR: Record<string, string> = {
  info: "bg-status-info",
  ok: "bg-status-ok",
  warn: "bg-status-warn",
  danger: "bg-status-danger",
};

const TONE_TEXT: Record<string, string> = {
  info: "text-status-info",
  ok: "text-status-ok",
  warn: "text-status-warn",
  danger: "text-status-danger",
};

/** Transient notification with a 3px tone bar on the left edge. */
export function Toast({ title, description, tone = "info", icon, onClose, style, ...rest }: ToastProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-3 w-90 max-w-full",
        "px-4 py-4 bg-bg-elevated rounded-md",
        "shadow-md relative overflow-hidden"
      )}
      style={style}
      {...rest}
    >
      <span
        className={cn("absolute left-0 top-0 bottom-0 w-0.75", TONE_COLOR[tone] || TONE_COLOR.info)}
      />
      {icon && (
        <span className={cn("flex shrink-0 mt-px", TONE_TEXT[tone] || TONE_TEXT.info)}>
          {icon}
        </span>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-ui text-text-primary">{title}</div>
        {description && (
          <div className="mt-1 text-body-s text-text-secondary">{description}</div>
        )}
      </div>
      {onClose && (
        <button
          aria-label="Закрыть"
          onClick={onClose}
          className={cn(
            "shrink-0 text-text-muted hover:text-text-primary",
            "bg-none border-none cursor-pointer font-sans text-base leading-none",
            "transition-ui"
          )}
        >
          ×
        </button>
      )}
    </div>
  );
}
