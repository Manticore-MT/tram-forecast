import * as React from "react";
/**
 * Rounded container. The dark system expresses elevation as a lighter fill + hairline, not shadow.
 */
export interface CardProps {
  children?: React.ReactNode;
  tone?: "surface" | "raised" | "glass" | "accent" | "outline";
  /** use the pin silhouette: three 40px corners + one 6px corner */
  pin?: boolean;
  padding?: string;
  /** lift 2px on hover */
  interactive?: boolean;
  style?: React.CSSProperties;
}
export declare function Card(props: CardProps): JSX.Element;
