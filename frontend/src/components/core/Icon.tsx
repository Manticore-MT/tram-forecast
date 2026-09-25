import React from "react";
import {
  Activity,
  ArrowRight,
  Brain,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  CloudRain,
  Download,
  Info,
  Layers,
  Mail,
  MapPin,
  MessagesSquare,
  PartyPopper,
  Play,
  RefreshCw,
  Route,
  Send,
  TrainFront,
  TramFront,
  TrendingUp,
  TriangleAlert,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface IconProps {
  /** Lucide icon id, e.g. "tram-front", "arrow-right", "calendar" */
  name: string;
  size?: number;
  /** override the fill; defaults to currentColor */
  strokeAccent?: string;
  style?: React.CSSProperties;
}

/** Glyphs used across this design system — bundled at build time, keyed by the same
 *  kebab-case ids Lucide's own icon-name convention uses. */
const GLYPHS: Record<string, LucideIcon> = {
  "tram-front": TramFront,
  "train-front": TrainFront,
  route: Route,
  "map-pin": MapPin,
  layers: Layers,
  activity: Activity,
  "trending-up": TrendingUp,
  brain: Brain,
  "refresh-cw": RefreshCw,
  download: Download,
  send: Send,
  mail: Mail,
  users: Users,
  calendar: Calendar,
  clock: Clock,
  trophy: Trophy,
  check: Check,
  "triangle-alert": TriangleAlert,
  "arrow-right": ArrowRight,
  "chevron-down": ChevronDown,
  "chevron-right": ChevronRight,
  "messages-square": MessagesSquare,
  play: Play,
  info: Info,
  "cloud-rain": CloudRain,
  "party-popper": PartyPopper,
};

export const ICON_SET = Object.keys(GLYPHS);

export function Icon({ name, size = 18, strokeAccent, style, ...rest }: IconProps) {
  const Glyph = GLYPHS[name];
  if (!Glyph) return null;
  return (
    <Glyph
      aria-hidden="true"
      size={size}
      stroke={strokeAccent || "currentColor"}
      style={{ display: "block", flex: "0 0 auto", ...style }}
      {...rest}
    />
  );
}
