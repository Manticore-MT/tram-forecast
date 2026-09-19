import * as React from "react";
/** Square-footprint circular button holding one glyph. Always give it an aria label. */
export interface IconButtonProps {
  icon: React.ReactNode;
  /** accessible name — required */
  label: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
