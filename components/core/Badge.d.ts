import * as React from "react";
/** Small status pill: track state, model confidence, load level, live indicators. */
export interface BadgeProps {
  children?: React.ReactNode;
  tone?: "neutral" | "accent" | "ok" | "warn" | "danger" | "info";
  /** leading 6px dot — use for live/stream states */
  dot?: boolean;
  style?: React.CSSProperties;
}
export declare function Badge(props: BadgeProps): JSX.Element;
