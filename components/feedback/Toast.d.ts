import * as React from "react";
/** Transient notification with a 3px tone bar on the left edge. */
export interface ToastProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: "info" | "ok" | "warn" | "danger";
  icon?: React.ReactNode;
  onClose?: () => void;
  style?: React.CSSProperties;
}
export declare function Toast(props: ToastProps): JSX.Element;
