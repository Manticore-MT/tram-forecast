/**
 * Lucide glyph inlined as real SVG geometry (fetched + cached) so it inherits currentColor.
 * SUBSTITUTION: the brand ships no icon set; Lucide (1.5px stroke, rounded caps) is the stand-in.
 */
export interface IconProps {
  /** Lucide icon id, e.g. "tram-front", "arrow-right", "calendar" */
  name: string;
  size?: number;
  /** override the fill; defaults to currentColor */
  strokeAccent?: string;
  style?: React.CSSProperties;
}
export declare function Icon(props: IconProps): JSX.Element;
