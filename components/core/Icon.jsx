import React from "react";

/**
 * Lucide glyph inlined as real SVG geometry so it inherits currentColor.
 * The source SVG is fetched once per name and cached; no CSS mask is involved
 * (cross-origin mask images are dropped by some renderers, which painted solid squares).
 */
const CACHE = new Map();
const WAITING = new Map();

function load(name) {
  if (CACHE.has(name)) return Promise.resolve(CACHE.get(name));
  if (WAITING.has(name)) return WAITING.get(name);
  const p = fetch(`https://unpkg.com/lucide-static@0.544.0/icons/${name}.svg`)
    .then((r) => (r.ok ? r.text() : ""))
    .then((t) => {
      const inner = t ? t.slice(t.indexOf(">") + 1).replace("</svg>", "").trim() : "";
      CACHE.set(name, inner);
      return inner;
    })
    .catch(() => { CACHE.set(name, ""); return ""; });
  WAITING.set(name, p);
  return p;
}

/** Glyphs used across this design system — warmed at load so captures aren't empty. */
export const ICON_SET = ["tram-front", "train-front", "route", "map-pin", "layers", "activity", "trending-up", "brain", "refresh-cw", "download", "send", "mail", "users", "calendar", "clock", "trophy", "check", "triangle-alert", "arrow-right", "chevron-down", "messages-square", "play", "info"];
if (typeof fetch === "function") ICON_SET.forEach(load);

export function Icon({ name, size = 18, strokeAccent, style, ...rest }) {
  const [inner, setInner] = React.useState(() => CACHE.get(name) || "");
  React.useEffect(() => {
    let live = true;
    load(name).then((h) => { if (live && h) setInner(h); });
    return () => { live = false; };
  }, [name]);
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} fill="none"
      stroke={strokeAccent || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ display: "block", flex: "0 0 auto", ...style }}
      dangerouslySetInnerHTML={{ __html: inner }} {...rest} />
  );
}
