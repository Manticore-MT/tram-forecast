import * as React from "react";
/**
 * Metric block — big tabular number with an uppercase eyebrow label.
 */
export interface StatProps {
  label?: React.ReactNode;
  value: React.ReactNode;
  unit?: React.ReactNode;
  caption?: React.ReactNode;
  /** up renders amber (worse for load), down renders green */
  trend?: { dir: "up" | "down"; value: string };
  align?: "left" | "center";
  size?: "md" | "lg";
  style?: React.CSSProperties;
}
export declare function Stat(props: StatProps): JSX.Element;
