import * as React from "react";
/**
 * Primary call-to-action pill. "Принять участие" on marketing, "Построить прогноз" in product.
 */
export interface ButtonProps {
  children?: React.ReactNode;
  /** primary = signal red; secondary = hairline glass; ghost = text only; inverse = white on dark */
  variant?: "primary" | "secondary" | "ghost" | "inverse";
  size?: "sm" | "md" | "lg";
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  disabled?: boolean;
  /** full-width — used in mobile sticky footers */
  block?: boolean;
  as?: "button" | "a";
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}
export declare function Button(props: ButtonProps): JSX.Element;
