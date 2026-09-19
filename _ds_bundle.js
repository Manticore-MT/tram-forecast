/* @ds-bundle: {"format":4,"namespace":"DesignSystem_8e46b6","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"ICON_SET","sourcePath":"components/core/Icon.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"LoadMeter","sourcePath":"components/data/LoadMeter.jsx"},{"name":"Stat","sourcePath":"components/data/Stat.jsx"},{"name":"Timeline","sourcePath":"components/data/Timeline.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Accordion","sourcePath":"components/navigation/Accordion.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"26c908ba0ce6","components/core/Button.jsx":"b3ca258b82cc","components/core/Card.jsx":"9e68e0aa14de","components/core/Icon.jsx":"692e804c75ae","components/core/IconButton.jsx":"74c7b1c29ac3","components/core/Tag.jsx":"4d746f9f85aa","components/data/LoadMeter.jsx":"65eb60f87605","components/data/Stat.jsx":"bc28242a97f2","components/data/Timeline.jsx":"9613c37a45df","components/feedback/Dialog.jsx":"65f16ee95444","components/feedback/Toast.jsx":"b6d09687cb99","components/feedback/Tooltip.jsx":"c537741ea3d6","components/forms/Checkbox.jsx":"38ace9c9e809","components/forms/Input.jsx":"bd5b06876b56","components/forms/Radio.jsx":"fb8e414e0ae3","components/forms/Select.jsx":"04532d167795","components/forms/Switch.jsx":"6b670e6821bc","components/navigation/Accordion.jsx":"7afe5df79fd8","components/navigation/Tabs.jsx":"67ed78cf875d","ui_kits/forecast-dashboard/Charts.jsx":"0ff09bb69470","ui_kits/forecast-dashboard/DashApp.jsx":"623514aec84b","ui_kits/forecast-dashboard/MapScreens.jsx":"e9c7b45e1cb8","ui_kits/forecast-dashboard/Screens.jsx":"b1f1d420d921","ui_kits/forecast-dashboard/Shell.jsx":"8b0240972664","ui_kits/hackathon-site/App.jsx":"028d0c908046","ui_kits/hackathon-site/Sections.jsx":"de6a7771d893","ui_kits/hackathon-site/Tracks.jsx":"8b647dee3b3c"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.DesignSystem_8e46b6 = window.DesignSystem_8e46b6 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  neutral: {
    bg: "var(--glass-fill)",
    fg: "var(--text-secondary)",
    ring: "var(--border-default)"
  },
  accent: {
    bg: "var(--accent-quiet)",
    fg: "var(--text-accent)",
    ring: "rgba(240,57,43,.35)"
  },
  ok: {
    bg: "rgba(46,212,122,.14)",
    fg: "var(--status-ok)",
    ring: "rgba(46,212,122,.35)"
  },
  warn: {
    bg: "rgba(255,176,32,.14)",
    fg: "var(--status-warn)",
    ring: "rgba(255,176,32,.35)"
  },
  danger: {
    bg: "rgba(240,57,43,.14)",
    fg: "var(--status-danger)",
    ring: "rgba(240,57,43,.35)"
  },
  info: {
    bg: "rgba(34,211,238,.14)",
    fg: "var(--status-info)",
    ring: "rgba(34,211,238,.35)"
  }
};
function Badge({
  children,
  tone = "neutral",
  dot = false,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.neutral;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)",
      padding: "5px 10px",
      font: "var(--type-caption)",
      letterSpacing: "var(--tracking-tight)",
      borderRadius: "var(--radius-pill)",
      background: t.bg,
      color: t.fg,
      boxShadow: `inset 0 0 0 1px ${t.ring}`,
      ...style
    }
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "var(--radius-pill)",
      background: "currentColor"
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    h: 36,
    px: 14,
    font: "var(--type-ui-s)",
    icon: 16
  },
  md: {
    h: 44,
    px: 20,
    font: "var(--type-ui)",
    icon: 18
  },
  lg: {
    h: 56,
    px: 28,
    font: "600 16px/1 var(--font-sans)",
    icon: 20
  }
};
function variantStyle(variant) {
  switch (variant) {
    case "secondary":
      return {
        background: "var(--glass-fill)",
        color: "var(--text-primary)",
        boxShadow: "inset 0 0 0 1px var(--border-default)"
      };
    case "ghost":
      return {
        background: "transparent",
        color: "var(--text-secondary)",
        boxShadow: "none"
      };
    case "inverse":
      return {
        background: "var(--bg-inverse)",
        color: "var(--text-inverse)",
        boxShadow: "none"
      };
    default:
      return {
        background: "var(--accent)",
        color: "var(--on-accent)",
        boxShadow: "var(--shadow-accent)"
      };
  }
}
function Button({
  children,
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  disabled = false,
  block = false,
  as = "button",
  href,
  onClick,
  style,
  ...rest
}) {
  const s = SIZES[size] || SIZES.md;
  const Tag = as === "a" ? "a" : "button";
  const base = {
    display: block ? "flex" : "inline-flex",
    width: block ? "100%" : "auto",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--space-2)",
    height: s.h,
    padding: `0 ${s.px}px`,
    font: s.font,
    letterSpacing: "var(--tracking-tight)",
    border: "none",
    borderRadius: "var(--radius-pill)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.42 : 1,
    transition: "var(--transition-ui)",
    textDecoration: "none",
    whiteSpace: "nowrap",
    ...variantStyle(variant),
    ...style
  };
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const hoverStyle = disabled || !hover ? null : variant === "primary" ? {
    background: "var(--accent-hover)"
  } : variant === "ghost" ? {
    background: "var(--glass-fill)",
    color: "var(--text-primary)"
  } : variant === "secondary" ? {
    boxShadow: "inset 0 0 0 1px var(--border-strong)"
  } : {
    opacity: 0.88
  };
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href,
    onClick: disabled ? undefined : onClick,
    disabled: Tag === "button" ? disabled : undefined,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      ...base,
      ...hoverStyle,
      transform: press && !disabled ? "scale(var(--press-scale))" : "none"
    }
  }, rest), iconLeft, children, iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Card({
  children,
  tone = "surface",
  pin = false,
  padding = "var(--space-6)",
  interactive = false,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const tones = {
    surface: {
      background: "var(--bg-surface)",
      boxShadow: "var(--inset-hairline)"
    },
    raised: {
      background: "var(--bg-surface-2)",
      boxShadow: "var(--inset-hairline-strong), var(--shadow-md)"
    },
    glass: {
      background: "var(--glass-fill)",
      backdropFilter: "var(--blur-glass)",
      boxShadow: "inset 0 0 0 1px var(--glass-stroke)"
    },
    accent: {
      background: "var(--accent)",
      color: "var(--on-accent)",
      boxShadow: "none"
    },
    outline: {
      background: "transparent",
      boxShadow: "inset 0 0 0 1px var(--border-default)"
    }
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      borderRadius: pin ? "var(--radius-pin)" : "var(--radius-xl)",
      padding,
      transition: "var(--transition-ui)",
      ...(tones[tone] || tones.surface),
      ...(interactive && hover ? {
        transform: "translateY(-2px)",
        boxShadow: "var(--inset-hairline-strong), var(--shadow-lg)"
      } : null),
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
  const p = fetch(`https://unpkg.com/lucide-static@0.544.0/icons/${name}.svg`).then(r => r.ok ? r.text() : "").then(t => {
    const inner = t ? t.slice(t.indexOf(">") + 1).replace("</svg>", "").trim() : "";
    CACHE.set(name, inner);
    return inner;
  }).catch(() => {
    CACHE.set(name, "");
    return "";
  });
  WAITING.set(name, p);
  return p;
}

/** Glyphs used across this design system — warmed at load so captures aren't empty. */
const ICON_SET = ["tram-front", "train-front", "route", "map-pin", "layers", "activity", "trending-up", "brain", "refresh-cw", "download", "send", "mail", "users", "calendar", "clock", "trophy", "check", "triangle-alert", "arrow-right", "chevron-down", "messages-square", "play", "info"];
if (typeof fetch === "function") ICON_SET.forEach(load);
function Icon({
  name,
  size = 18,
  strokeAccent,
  style,
  ...rest
}) {
  const [inner, setInner] = React.useState(() => CACHE.get(name) || "");
  React.useEffect(() => {
    let live = true;
    load(name).then(h => {
      if (live && h) setInner(h);
    });
    return () => {
      live = false;
    };
  }, [name]);
  return /*#__PURE__*/React.createElement("svg", _extends({
    "aria-hidden": "true",
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    fill: "none",
    stroke: strokeAccent || "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      display: "block",
      flex: "0 0 auto",
      ...style
    },
    dangerouslySetInnerHTML: {
      __html: inner
    }
  }, rest));
}
Object.assign(__ds_scope, { ICON_SET, Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: 32,
  md: 40,
  lg: 48
};
function IconButton({
  icon,
  label,
  variant = "secondary",
  size = "md",
  disabled = false,
  onClick,
  style,
  ...rest
}) {
  const d = SIZES[size] || SIZES.md;
  const [hover, setHover] = React.useState(false);
  const skin = variant === "primary" ? {
    background: "var(--accent)",
    color: "var(--on-accent)"
  } : variant === "ghost" ? {
    background: "transparent",
    color: "var(--text-secondary)"
  } : {
    background: "var(--glass-fill)",
    color: "var(--text-primary)",
    boxShadow: "inset 0 0 0 1px var(--border-default)"
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    "aria-label": label,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: d,
      height: d,
      border: "none",
      borderRadius: "var(--radius-pill)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.42 : 1,
      transition: "var(--transition-ui)",
      ...skin,
      ...(hover && !disabled ? {
        color: variant === "primary" ? "var(--on-accent)" : "var(--text-primary)",
        background: variant === "primary" ? "var(--accent-hover)" : "rgba(255,255,255,.12)"
      } : null),
      ...style
    }
  }, rest), icon);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tag({
  children,
  selected = false,
  onClick,
  icon,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const clickable = typeof onClick === "function";
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    onClick: onClick,
    disabled: !clickable,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)",
      height: 36,
      padding: "0 16px",
      font: "var(--type-ui-s)",
      letterSpacing: "var(--tracking-tight)",
      border: "none",
      borderRadius: "var(--radius-pill)",
      cursor: clickable ? "pointer" : "default",
      transition: "var(--transition-ui)",
      background: selected ? "var(--bg-inverse)" : hover && clickable ? "rgba(255,255,255,.10)" : "var(--glass-fill)",
      color: selected ? "var(--text-inverse)" : "var(--text-secondary)",
      boxShadow: selected ? "none" : "inset 0 0 0 1px var(--border-subtle)",
      ...style
    }
  }, rest), icon, children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/data/LoadMeter.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const LEVELS = ["var(--load-1)", "var(--load-2)", "var(--load-3)", "var(--load-4)", "var(--load-5)"];
const NAMES = ["Свободно", "Комфортно", "Умеренно", "Плотно", "Перегружено"];

/** Passenger-load indicator: 5 segments on the shared load scale. */
function LoadMeter({
  value = 0,
  showLabel = true,
  segments = 5,
  width,
  style,
  ...rest
}) {
  const v = Math.max(0, Math.min(1, value));
  const lit = Math.max(1, Math.ceil(v * segments));
  const idx = Math.min(LEVELS.length - 1, Math.max(0, lit - 1));
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)",
      width,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 3
    }
  }, Array.from({
    length: segments
  }).map((_, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      flex: 1,
      height: 8,
      borderRadius: 2,
      background: i < lit ? LEVELS[Math.min(LEVELS.length - 1, i)] : "var(--ink-600)",
      transition: "background-color var(--dur-base) var(--ease-standard)"
    }
  }))), showLabel && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: "var(--space-3)",
      font: "var(--type-caption)",
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: LEVELS[idx]
    }
  }, NAMES[idx]), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontVariantNumeric: "tabular-nums"
    }
  }, Math.round(v * 100), "%")));
}
Object.assign(__ds_scope, { LoadMeter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/LoadMeter.jsx", error: String((e && e.message) || e) }); }

// components/data/Stat.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Stat({
  label,
  value,
  unit,
  caption,
  trend,
  align = "left",
  size = "md",
  style,
  ...rest
}) {
  const trendColor = trend && trend.dir === "down" ? "var(--status-ok)" : trend && trend.dir === "up" ? "var(--status-warn)" : "var(--text-muted)";
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)",
      alignItems: align === "center" ? "center" : "flex-start",
      textAlign: align,
      ...style
    }
  }, rest), label && /*#__PURE__*/React.createElement("span", {
    className: "mt-eyebrow",
    style: {
      font: "var(--type-eyebrow)",
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      color: "var(--text-muted)"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 6,
      font: size === "lg" ? "var(--type-metric-xl)" : "var(--type-metric)",
      letterSpacing: "var(--tracking-tight)",
      fontVariantNumeric: "tabular-nums",
      color: "var(--text-primary)"
    }
  }, value, unit && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-h4)",
      color: "var(--text-secondary)"
    }
  }, unit)), (caption || trend) && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-2)",
      font: "var(--type-caption)",
      color: "var(--text-muted)"
    }
  }, trend && /*#__PURE__*/React.createElement("span", {
    style: {
      color: trendColor,
      fontFamily: "var(--font-mono)"
    }
  }, trend.dir === "down" ? "▼" : "▲", " ", trend.value), caption));
}
Object.assign(__ds_scope, { Stat });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Stat.jsx", error: String((e && e.message) || e) }); }

// components/data/Timeline.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Timeline({
  items = [],
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("ol", _extends({
    style: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "flex",
      flexDirection: "column",
      ...style
    }
  }, rest), items.map((it, i) => {
    const last = i === items.length - 1;
    return /*#__PURE__*/React.createElement("li", {
      key: i,
      style: {
        display: "grid",
        gridTemplateColumns: "28px 1fr",
        gap: "var(--space-5)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: it.done ? 14 : 12,
        height: it.done ? 14 : 12,
        marginTop: 6,
        borderRadius: "var(--radius-pill)",
        background: it.done ? "var(--accent)" : "transparent",
        boxShadow: it.done ? "0 0 0 4px var(--accent-quiet)" : "inset 0 0 0 2px var(--border-strong)"
      }
    }), !last && /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        width: 2,
        marginTop: 6,
        background: "var(--border-subtle)"
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        paddingBottom: last ? 0 : "var(--space-8)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: "var(--type-ui)",
        color: it.done ? "var(--text-accent)" : "var(--text-muted)",
        fontFamily: "var(--font-mono)"
      }
    }, it.date), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 6,
        font: "var(--type-body)",
        color: "var(--text-primary)"
      }
    }, it.title), it.note && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 4,
        font: "var(--type-body-s)",
        color: "var(--text-muted)"
      }
    }, it.note)));
  }));
}
Object.assign(__ds_scope, { Timeline });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Timeline.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Dialog({
  open = true,
  title,
  description,
  children,
  footer,
  onClose,
  width = 480,
  style,
  ...rest
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      display: "grid",
      placeItems: "center",
      background: "var(--overlay-scrim)",
      backdropFilter: "var(--blur-scrim)",
      zIndex: 50
    }
  }, /*#__PURE__*/React.createElement("div", _extends({
    role: "dialog",
    "aria-modal": "true",
    style: {
      width,
      maxWidth: "92%",
      background: "var(--bg-surface-2)",
      borderRadius: "var(--radius-xl)",
      boxShadow: "var(--inset-hairline-strong), var(--shadow-lg)",
      padding: "var(--space-8)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      font: "var(--type-h3)",
      letterSpacing: "var(--tracking-tight)"
    }
  }, title), onClose && /*#__PURE__*/React.createElement("button", {
    "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C",
    onClick: onClose,
    style: {
      background: "none",
      border: "none",
      color: "var(--text-muted)",
      cursor: "pointer",
      font: "20px/1 var(--font-sans)"
    }
  }, "\xD7")), description && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "var(--space-3) 0 0",
      font: "var(--type-body-s)",
      color: "var(--text-secondary)"
    }
  }, description), children && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-6)"
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "var(--space-3)",
      marginTop: "var(--space-8)"
    }
  }, footer)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONE_BAR = {
  info: "var(--status-info)",
  ok: "var(--status-ok)",
  warn: "var(--status-warn)",
  danger: "var(--status-danger)"
};
function Toast({
  title,
  description,
  tone = "info",
  icon,
  onClose,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "status",
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: "var(--space-3)",
      width: 360,
      maxWidth: "100%",
      padding: "var(--space-4)",
      background: "var(--bg-elevated)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--inset-hairline-strong), var(--shadow-lg)",
      position: "relative",
      overflow: "hidden",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
      background: TONE_BAR[tone] || TONE_BAR.info
    }
  }), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      color: TONE_BAR[tone] || TONE_BAR.info,
      display: "flex",
      marginTop: 1
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-ui)",
      color: "var(--text-primary)"
    }
  }, title), description && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      font: "var(--type-body-s)",
      color: "var(--text-secondary)"
    }
  }, description)), onClose && /*#__PURE__*/React.createElement("button", {
    "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C",
    onClick: onClose,
    style: {
      background: "none",
      border: "none",
      color: "var(--text-muted)",
      cursor: "pointer",
      font: "16px/1 var(--font-sans)"
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tooltip({
  children,
  content,
  placement = "top",
  style,
  ...rest
}) {
  const [on, setOn] = React.useState(false);
  const pos = placement === "bottom" ? {
    top: "calc(100% + 8px)"
  } : {
    bottom: "calc(100% + 8px)"
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      position: "relative",
      display: "inline-flex",
      ...style
    },
    onMouseEnter: () => setOn(true),
    onMouseLeave: () => setOn(false)
  }, rest), children, on && /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    style: {
      position: "absolute",
      left: "50%",
      transform: "translateX(-50%)",
      ...pos,
      padding: "8px 10px",
      whiteSpace: "nowrap",
      font: "var(--type-caption)",
      color: "var(--text-primary)",
      background: "var(--bg-elevated)",
      borderRadius: "var(--radius-sm)",
      boxShadow: "var(--inset-hairline-strong), var(--shadow-md)",
      zIndex: 40,
      pointerEvents: "none"
    }
  }, content));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Checkbox({
  label,
  checked = false,
  onChange,
  disabled = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-3)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.45 : 1,
      font: "var(--type-body-s)",
      color: "var(--text-secondary)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    checked: checked,
    onChange: onChange,
    disabled: disabled,
    style: {
      position: "absolute",
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 20,
      height: 20,
      flex: "0 0 auto",
      borderRadius: "var(--radius-xs)",
      transition: "var(--transition-ui)",
      background: checked ? "var(--accent)" : "transparent",
      boxShadow: checked ? "none" : "inset 0 0 0 1.5px var(--border-strong)"
    }
  }, checked && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 6,
      marginTop: -3,
      borderLeft: "2px solid var(--on-accent)",
      borderBottom: "2px solid var(--on-accent)",
      transform: "rotate(-45deg)"
    }
  })), label);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input({
  label,
  hint,
  error,
  value,
  defaultValue,
  placeholder,
  type = "text",
  prefix,
  suffix,
  disabled = false,
  onChange,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const ringColor = error ? "var(--status-danger)" : focus ? "var(--focus-ring)" : "var(--border-default)";
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: id,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)",
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-ui-s)",
      color: "var(--text-secondary)"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-2)",
      height: 48,
      padding: "0 16px",
      background: "var(--bg-surface-2)",
      borderRadius: "var(--radius-md)",
      boxShadow: `inset 0 0 0 ${focus || error ? 2 : 1}px ${ringColor}`,
      opacity: disabled ? 0.45 : 1,
      transition: "var(--transition-ui)"
    }
  }, prefix && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)",
      display: "flex"
    }
  }, prefix), /*#__PURE__*/React.createElement("input", _extends({
    id: id,
    type: type,
    value: value,
    defaultValue: defaultValue,
    placeholder: placeholder,
    disabled: disabled,
    onChange: onChange,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      background: "transparent",
      border: "none",
      outline: "none",
      color: "var(--text-primary)",
      font: "var(--type-body-s)"
    }
  }, rest)), suffix && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)",
      display: "flex"
    }
  }, suffix)), (error || hint) && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      color: error ? "var(--status-danger)" : "var(--text-muted)"
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Radio({
  label,
  checked = false,
  onChange,
  disabled = false,
  name,
  value,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-3)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.45 : 1,
      font: "var(--type-body-s)",
      color: "var(--text-secondary)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "radio",
    name: name,
    value: value,
    checked: checked,
    onChange: onChange,
    disabled: disabled,
    style: {
      position: "absolute",
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 20,
      height: 20,
      flex: "0 0 auto",
      borderRadius: "var(--radius-pill)",
      transition: "var(--transition-ui)",
      boxShadow: checked ? "inset 0 0 0 6px var(--accent)" : "inset 0 0 0 1.5px var(--border-strong)"
    }
  }), label);
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Select({
  label,
  hint,
  options = [],
  value,
  onChange,
  disabled = false,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: id,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)",
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-ui-s)",
      color: "var(--text-secondary)"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "block"
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: id,
    value: value,
    onChange: onChange,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: "100%",
      height: 48,
      padding: "0 44px 0 16px",
      appearance: "none",
      background: "var(--bg-surface-2)",
      color: "var(--text-primary)",
      font: "var(--type-body-s)",
      border: "none",
      borderRadius: "var(--radius-md)",
      outline: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      boxShadow: `inset 0 0 0 ${focus ? 2 : 1}px ${focus ? "var(--focus-ring)" : "var(--border-default)"}`,
      opacity: disabled ? 0.45 : 1,
      transition: "var(--transition-ui)"
    }
  }, rest), options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value,
    style: {
      color: "#000"
    }
  }, o.label))), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: "absolute",
      right: 16,
      top: "50%",
      width: 10,
      height: 10,
      marginTop: -7,
      borderRight: "2px solid var(--text-muted)",
      borderBottom: "2px solid var(--text-muted)",
      transform: "rotate(45deg)",
      pointerEvents: "none"
    }
  })), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-caption)",
      color: "var(--text-muted)"
    }
  }, hint));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Switch({
  label,
  checked = false,
  onChange,
  disabled = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-3)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.45 : 1,
      font: "var(--type-body-s)",
      color: "var(--text-secondary)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    role: "switch",
    checked: checked,
    onChange: onChange,
    disabled: disabled,
    style: {
      position: "absolute",
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: "relative",
      width: 44,
      height: 26,
      flex: "0 0 auto",
      borderRadius: "var(--radius-pill)",
      background: checked ? "var(--accent)" : "var(--ink-600)",
      boxShadow: checked ? "none" : "inset 0 0 0 1px var(--border-default)",
      transition: "background-color var(--dur-fast) var(--ease-standard)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 3,
      left: checked ? 21 : 3,
      width: 20,
      height: 20,
      borderRadius: "var(--radius-pill)",
      background: "var(--white)",
      transition: "left var(--dur-fast) var(--ease-standard)"
    }
  })), label);
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Accordion.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Accordion({
  items = [],
  defaultOpen = -1,
  style,
  ...rest
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)",
      ...style
    }
  }, rest), items.map((it, i) => {
    const on = i === open;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        background: on ? "var(--bg-surface-2)" : "var(--bg-surface)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--inset-hairline)",
        transition: "var(--transition-ui)"
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setOpen(on ? -1 : i),
      "aria-expanded": on,
      style: {
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--space-4)",
        padding: "20px 24px",
        background: "none",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        font: "var(--type-h4)",
        color: "var(--text-primary)"
      }
    }, it.question, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
      style: {
        width: 10,
        height: 10,
        flex: "0 0 auto",
        marginTop: on ? 4 : -4,
        borderRight: "2px solid var(--text-muted)",
        borderBottom: "2px solid var(--text-muted)",
        transform: on ? "rotate(-135deg)" : "rotate(45deg)",
        transition: "transform var(--dur-base) var(--ease-standard)"
      }
    })), on && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "0 24px 24px",
        font: "var(--type-body-s)",
        color: "var(--text-secondary)",
        maxWidth: 720
      }
    }, it.answer));
  }));
}
Object.assign(__ds_scope, { Accordion });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Accordion.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tabs({
  items = [],
  value,
  onChange,
  variant = "pill",
  style,
  ...rest
}) {
  const active = value ?? items[0]?.value;
  if (variant === "underline") {
    return /*#__PURE__*/React.createElement("div", _extends({
      role: "tablist",
      style: {
        display: "flex",
        gap: "var(--space-6)",
        boxShadow: "inset 0 -1px 0 var(--border-subtle)",
        ...style
      }
    }, rest), items.map(it => {
      const on = it.value === active;
      return /*#__PURE__*/React.createElement("button", {
        key: it.value,
        role: "tab",
        "aria-selected": on,
        onClick: () => onChange && onChange(it.value),
        style: {
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0 0 14px",
          font: "var(--type-ui)",
          whiteSpace: "nowrap",
          color: on ? "var(--text-primary)" : "var(--text-muted)",
          transition: "var(--transition-ui)",
          boxShadow: on ? "inset 0 -2px 0 var(--accent)" : "none"
        }
      }, it.label);
    }));
  }
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "tablist",
    style: {
      display: "inline-flex",
      gap: "var(--space-1)",
      padding: 4,
      background: "var(--bg-surface-2)",
      borderRadius: "var(--radius-pill)",
      boxShadow: "var(--inset-hairline)",
      ...style
    }
  }, rest), items.map(it => {
    const on = it.value === active;
    return /*#__PURE__*/React.createElement("button", {
      key: it.value,
      role: "tab",
      "aria-selected": on,
      onClick: () => onChange && onChange(it.value),
      style: {
        height: 36,
        padding: "0 18px",
        border: "none",
        borderRadius: "var(--radius-pill)",
        cursor: "pointer",
        font: "var(--type-ui-s)",
        whiteSpace: "nowrap",
        transition: "var(--transition-ui)",
        background: on ? "var(--bg-inverse)" : "transparent",
        color: on ? "var(--text-inverse)" : "var(--text-muted)"
      }
    }, it.label);
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/forecast-dashboard/Charts.jsx
try { (() => {
// Lightweight SVG charts. Data is synthetic but shaped like tram validation counts.
function seedSeries(seed, n, base, amp) {
  const out = [];
  let x = seed;
  for (let i = 0; i < n; i++) {
    x = (x * 9301 + 49297) % 233280;
    const hour = i / n * 24;
    const peak = Math.exp(-Math.pow((hour - 8.5) / 2, 2)) + 0.92 * Math.exp(-Math.pow((hour - 18.5) / 2.2, 2));
    out.push(Math.max(0, base + amp * peak + (x / 233280 - 0.5) * amp * 0.18));
  }
  return out;
}
function path(points, w, h, max) {
  return points.map((v, i) => `${i === 0 ? "M" : "L"}${i / (points.length - 1) * w},${h - v / max * h}`).join(" ");
}
function ForecastChart({
  actual,
  forecast,
  band,
  height = 260
}) {
  const w = 1000,
    h = height - 28;
  const max = Math.max(...actual, ...forecast) * 1.12;
  const upper = band ? forecast.map((v, i) => v * (1 + band[i])) : null;
  const lower = band ? forecast.map((v, i) => v * (1 - band[i])) : null;
  const split = actual.length / (actual.length + forecast.length);
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${w} ${height}`,
    preserveAspectRatio: "none",
    style: {
      width: "100%",
      height,
      display: "block"
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "fg",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "var(--cyan-500)",
    stopOpacity: "0.28"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "var(--cyan-500)",
    stopOpacity: "0"
  }))), [0.25, 0.5, 0.75, 1].map(g => /*#__PURE__*/React.createElement("line", {
    key: g,
    x1: "0",
    x2: w,
    y1: h * g,
    y2: h * g,
    stroke: "var(--border-subtle)",
    strokeWidth: "1"
  })), /*#__PURE__*/React.createElement("g", {
    transform: `translate(${w * split},0)`
  }, /*#__PURE__*/React.createElement("line", {
    x1: "0",
    x2: "0",
    y1: "0",
    y2: h,
    stroke: "var(--border-strong)",
    strokeDasharray: "4 4"
  }), /*#__PURE__*/React.createElement("text", {
    x: "8",
    y: "14",
    fill: "var(--text-muted)",
    style: {
      font: "11px var(--font-mono)"
    }
  }, "\u0441\u0435\u0439\u0447\u0430\u0441")), /*#__PURE__*/React.createElement("g", {
    transform: `translate(0,0)`
  }, /*#__PURE__*/React.createElement("path", {
    d: path(actual, w * split, h, max) + ` L${w * split},${h} L0,${h} Z`,
    fill: "url(#fg)"
  }), /*#__PURE__*/React.createElement("path", {
    d: path(actual, w * split, h, max),
    fill: "none",
    stroke: "var(--cyan-500)",
    strokeWidth: "2.5"
  })), /*#__PURE__*/React.createElement("g", {
    transform: `translate(${w * split},0)`
  }, upper && /*#__PURE__*/React.createElement("path", {
    d: `${path(upper, w * (1 - split), h, max)} L${w * (1 - split)},${h - lower[lower.length - 1] / max * h} ${lower.slice().reverse().map((v, i) => `L${w * (1 - split) - i / (lower.length - 1) * w * (1 - split)},${h - v / max * h}`).join(" ")} Z`,
    fill: "var(--accent)",
    fillOpacity: "0.14"
  }), /*#__PURE__*/React.createElement("path", {
    d: path(forecast, w * (1 - split), h, max),
    fill: "none",
    stroke: "var(--accent)",
    strokeWidth: "2.5",
    strokeDasharray: "6 5"
  })), /*#__PURE__*/React.createElement("g", null, ["06:00", "10:00", "14:00", "18:00", "22:00"].map((t, i) => /*#__PURE__*/React.createElement("text", {
    key: t,
    x: i / 4 * (w - 40) + 4,
    y: height - 6,
    fill: "var(--text-muted)",
    style: {
      font: "11px var(--font-mono)"
    }
  }, t))));
}
function Sparkline({
  data,
  color = "var(--cyan-500)",
  height = 36
}) {
  const max = Math.max(...data) * 1.1;
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 200 ${height}`,
    preserveAspectRatio: "none",
    style: {
      width: "100%",
      height,
      display: "block"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: path(data, 200, height, max),
    fill: "none",
    stroke: color,
    strokeWidth: "2"
  }));
}
const LOAD_VARS = ["var(--load-1)", "var(--load-2)", "var(--load-3)", "var(--load-4)", "var(--load-5)"];
function Heatmap({
  rows,
  cols = 24
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 3
    }
  }, rows.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "grid",
      gridTemplateColumns: `120px repeat(${cols},1fr)`,
      gap: 3,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-mono-s)",
      color: "var(--text-muted)"
    }
  }, r.label), r.values.slice(0, cols).map((v, j) => /*#__PURE__*/React.createElement("span", {
    key: j,
    title: `${r.label} · ${j}:00 · ${Math.round(v * 100)}%`,
    style: {
      height: 18,
      borderRadius: 2,
      background: LOAD_VARS[Math.min(4, Math.floor(v * 5))],
      opacity: 0.35 + v * 0.65
    }
  })))));
}

/** Schematic route strip — deliberately NOT a geographic map: no real geometry was supplied. */
function RouteStrip({
  stops,
  active,
  onPick
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 0,
      overflowX: "auto",
      padding: "var(--space-6) 0"
    }
  }, stops.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: s.name,
    style: {
      flex: 1,
      minWidth: 96,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      cursor: "pointer"
    },
    onClick: () => onPick && onPick(i)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 3,
      background: i === 0 ? "transparent" : LOAD_VARS[Math.min(4, Math.floor(stops[i - 1].load * 5))]
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: i === active ? 18 : 12,
      height: i === active ? 18 : 12,
      borderRadius: "var(--radius-pill)",
      background: LOAD_VARS[Math.min(4, Math.floor(s.load * 5))],
      boxShadow: i === active ? "0 0 0 4px var(--accent-quiet)" : "none",
      transition: "var(--transition-ui)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 3,
      background: i === stops.length - 1 ? "transparent" : LOAD_VARS[Math.min(4, Math.floor(s.load * 5))]
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      marginTop: 10,
      font: "var(--type-caption)",
      color: i === active ? "var(--text-primary)" : "var(--text-muted)",
      textAlign: "center",
      maxWidth: 96
    }
  }, s.name), /*#__PURE__*/React.createElement("span", {
    style: {
      marginTop: 4,
      font: "var(--type-mono-s)",
      color: "var(--text-muted)"
    }
  }, Math.round(s.load * 100), "%"))));
}
Object.assign(window, {
  seedSeries,
  ForecastChart,
  Sparkline,
  Heatmap,
  RouteStrip,
  LOAD_VARS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/forecast-dashboard/Charts.jsx", error: String((e && e.message) || e) }); }

// ui_kits/forecast-dashboard/DashApp.jsx
try { (() => {
const {
  Toast,
  Icon
} = window.DesignSystem_8e46b6;
function DashApp() {
  const [view, setView] = React.useState("map");
  const [horizon, setHorizon] = React.useState("day");
  const [route, setRoute] = React.useState("17");
  const [toast, setToast] = React.useState(false);
  const full = view === "map";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      height: "100vh",
      background: "var(--bg-page)",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(Sidebar, {
    view: view,
    onView: setView
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    horizon: horizon,
    onHorizon: setHorizon,
    route: route,
    onRoute: setRoute,
    onExport: () => {
      setToast(true);
      setTimeout(() => setToast(false), 3500);
    }
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      minHeight: 0,
      overflowY: full ? "hidden" : "auto",
      padding: full ? "var(--space-5) var(--space-6)" : "var(--space-6) var(--space-8) var(--space-10)"
    }
  }, view === "map" && /*#__PURE__*/React.createElement(MapView, {
    route: route
  }), view === "overview" && /*#__PURE__*/React.createElement(Overview, {
    horizon: horizon,
    route: route
  }), view === "route" && /*#__PURE__*/React.createElement(RouteView, {
    route: route
  }), view === "model" && /*#__PURE__*/React.createElement(ModelView, null), view === "data" && /*#__PURE__*/React.createElement(IngestView, null))), toast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      right: 24,
      bottom: 24,
      zIndex: 600
    }
  }, /*#__PURE__*/React.createElement(Toast, {
    tone: "ok",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 16
    }),
    title: "\u0412\u044B\u0433\u0440\u0443\u0437\u043A\u0430 \u0433\u043E\u0442\u043E\u0432\u0430",
    description: `Маршрут ${route} · горизонт ${horizon} · CSV 2.4 МБ`,
    onClose: () => setToast(false)
  })));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(DashApp, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/forecast-dashboard/DashApp.jsx", error: String((e && e.message) || e) }); }

// ui_kits/forecast-dashboard/MapScreens.jsx
try { (() => {
const {
  Card,
  Badge,
  Button,
  Icon,
  Stat,
  LoadMeter,
  Switch,
  Tabs,
  Tag,
  Tooltip
} = window.DesignSystem_8e46b6;

/** Real OSM basemap of Moscow. Stop positions are approximate coordinates of the named
 *  landmarks; the connector line is a straight-segment stand-in, NOT surveyed track geometry.
 *  Replace GEO with real route geometry when ЕДЦ provides it. */
const GEO = [{
  name: "Метро Сокольники",
  ll: [55.7893, 37.6797],
  load: 0.34
}, {
  name: "Стромынка",
  ll: [55.7867, 37.6945],
  load: 0.52
}, {
  name: "Матросская Тишина",
  ll: [55.7842, 37.7000],
  load: 0.61
}, {
  name: "Электрозаводская",
  ll: [55.7820, 37.7053],
  load: 0.86
}, {
  name: "Площадь Журавлёва",
  ll: [55.7789, 37.7085],
  load: 0.74
}, {
  name: "Госпитальный Вал",
  ll: [55.7735, 37.7010],
  load: 0.48
}, {
  name: "Лефортово",
  ll: [55.7660, 37.7050],
  load: 0.29
}];
const LOAD_HEX = ["#2ED47A", "#A3E635", "#FFB020", "#FB7B3C", "#F0392B"];
const hexFor = v => LOAD_HEX[Math.min(4, Math.floor(v * 5))];
function MapCanvas({
  hour,
  onPick,
  active
}) {
  const ref = React.useRef(null);
  const mapRef = React.useRef(null);
  const layerRef = React.useRef(null);
  React.useEffect(() => {
    if (mapRef.current || !window.L || !ref.current) return;
    const el = ref.current;
    const map = window.L.map(el, {
      zoomControl: false,
      attributionControl: true
    }).setView([55.779, 37.699], 13);
    window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors"
    }).addTo(map);
    window.L.control.zoom({
      position: "bottomright"
    }).addTo(map);
    mapRef.current = map;
    // The container is absolutely positioned, so its height can still be 0 at mount —
    // Leaflet would cache a 0×0 size and never draw tiles or overlays.
    const sync = () => {
      map.invalidateSize(false);
    };
    requestAnimationFrame(sync);
    setTimeout(sync, 0);
    const started = Date.now();
    const poll = setInterval(() => {
      sync();
      if (map.getSize().x > 0 && map.getSize().y > 0) clearInterval(poll);else if (Date.now() - started > 4000) clearInterval(poll);
    }, 120);
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(sync) : null;
    if (ro) {
      ro.observe(el);
      if (el.parentElement) ro.observe(el.parentElement);
    }
    window.addEventListener("resize", sync);
    return () => {
      clearInterval(poll);
      if (ro) ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, []);
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.L) return;
    if (layerRef.current) layerRef.current.remove();
    const g = window.L.layerGroup();
    const shift = Math.exp(-Math.pow((hour - 8.5) / 3, 2)) + 0.9 * Math.exp(-Math.pow((hour - 18.5) / 3.2, 2));
    const pts = GEO.map(s => ({
      ...s,
      v: Math.max(0.05, Math.min(1, s.load * (0.35 + 0.8 * shift)))
    }));
    for (let i = 0; i < pts.length - 1; i++) {
      window.L.polyline([pts[i].ll, pts[i + 1].ll], {
        color: hexFor(pts[i].v),
        weight: 6,
        opacity: 0.85,
        dashArray: "1 0"
      }).addTo(g);
    }
    pts.forEach((s, i) => {
      window.L.circleMarker(s.ll, {
        radius: i === active ? 11 : 7,
        color: "#0E1113",
        weight: 2,
        fillColor: hexFor(s.v),
        fillOpacity: 1
      }).bindTooltip(`${s.name} · ${Math.round(s.v * 100)} %`, {
        direction: "top"
      }).on("click", () => onPick && onPick(i)).addTo(g);
    });
    g.addTo(map);
    layerRef.current = g;
  }, [hour, active]);
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      position: "absolute",
      inset: 0,
      background: "var(--ink-800)"
    }
  });
}
function MapView({
  route
}) {
  const [hour, setHour] = React.useState(18);
  const [active, setActive] = React.useState(3);
  const [live, setLive] = React.useState(true);
  const s = GEO[active];
  const label = `${String(Math.floor(hour)).padStart(2, "0")}:${hour % 1 ? "30" : "00"}`;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      height: "100%",
      minHeight: 620,
      borderRadius: "var(--radius-xl)",
      overflow: "hidden",
      boxShadow: "var(--inset-hairline)"
    }
  }, /*#__PURE__*/React.createElement(MapCanvas, {
    hour: hour,
    active: active,
    onPick: setActive
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 16,
      left: 16,
      width: 320,
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)",
      zIndex: 500
    }
  }, /*#__PURE__*/React.createElement(Card, {
    tone: "glass",
    padding: "var(--space-5)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "mt-eyebrow"
  }, "\u041C\u0430\u0440\u0448\u0440\u0443\u0442 ", route, " \xB7 \u043F\u0440\u043E\u0433\u043D\u043E\u0437"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      font: "var(--type-h3)"
    }
  }, label)), /*#__PURE__*/React.createElement(Badge, {
    tone: live ? "ok" : "neutral",
    dot: true
  }, live ? "live" : "пауза")), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "5",
    max: "23.5",
    step: "0.5",
    value: hour,
    onChange: e => setHour(+e.target.value),
    style: {
      width: "100%",
      marginTop: "var(--space-4)",
      accentColor: "var(--accent)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      font: "var(--type-mono-s)",
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "05:00"), /*#__PURE__*/React.createElement("span", null, "23:30")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement(Switch, {
    checked: live,
    onChange: () => setLive(!live),
    label: "\u041E\u0431\u043D\u043E\u0432\u043B\u044F\u0442\u044C \u0432 \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u043C \u0432\u0440\u0435\u043C\u0435\u043D\u0438"
  }))), /*#__PURE__*/React.createElement(Card, {
    tone: "glass",
    padding: "var(--space-5)"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mt-eyebrow"
  }, "\u041E\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0430"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      font: "var(--type-h4)"
    }
  }, s.name), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement(LoadMeter, {
    value: s.load
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-4)",
      display: "flex",
      gap: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "\u0412\u0445\u043E\u0434/\u0447\u0430\u0441",
    value: "1 240"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "\u0418\u043D\u0442\u0435\u0440\u0432\u0430\u043B",
    value: "6.5",
    unit: "\u043C\u0438\u043D"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: 16,
      left: 16,
      zIndex: 500
    }
  }, /*#__PURE__*/React.createElement(Card, {
    tone: "glass",
    padding: "var(--space-4)"
  }, /*#__PURE__*/React.createElement(LoadLegend, null))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 16,
      right: 16,
      zIndex: 500
    }
  }, /*#__PURE__*/React.createElement(Card, {
    tone: "glass",
    padding: "var(--space-4)",
    style: {
      maxWidth: 260
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-caption)",
      color: "var(--text-secondary)"
    }
  }, "\u0413\u0435\u043E\u043C\u0435\u0442\u0440\u0438\u044F \u0442\u0440\u0430\u0441\u0441\u044B \u2014 \u043F\u0440\u044F\u043C\u044B\u0435 \u043E\u0442\u0440\u0435\u0437\u043A\u0438 \u043C\u0435\u0436\u0434\u0443 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0430\u043C\u0438. \u041F\u043E\u0434\u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u0440\u0435\u0430\u043B\u044C\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435 \u0415\u0414\u0426."))));
}
function IngestView() {
  const jobs = [["validations_hourly", "валидации · Кафка → ClickHouse", "ok", "12 с", "4.2 млрд строк"], ["telematics_stream", "телематика ГЛОНАСС · Netty", "ok", "4 с", "118 млн/сут"], ["weather_enrich", "погода · внешний API", "warn", "18 мин", "1.2 млн"], ["events_calendar", "события в городе", "ok", "1 ч", "48 тыс."], ["feature_store_build", "построение признаков", "ok", "04:00", "2 700 признаков"]];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement(Card, {
    tone: "surface"
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "\u0412\u0430\u043B\u0438\u0434\u0430\u0446\u0438\u0439 \u0432 \u0431\u0430\u0437\u0435",
    value: "4.2",
    unit: "\u043C\u043B\u0440\u0434",
    caption: "2022 \u2014 2026"
  })), /*#__PURE__*/React.createElement(Card, {
    tone: "surface"
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "\u0421\u0442\u0440\u043E\u043A \u0437\u0430 \u0441\u0443\u0442\u043A\u0438",
    value: "118",
    unit: "\u043C\u043B\u043D",
    trend: {
      dir: "up",
      value: "3.1 %"
    }
  })), /*#__PURE__*/React.createElement(Card, {
    tone: "surface"
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "\u0417\u0430\u0434\u0435\u0440\u0436\u043A\u0430 \u043F\u043E\u0442\u043E\u043A\u0430",
    value: "12",
    unit: "\u0441",
    trend: {
      dir: "down",
      value: "4 с"
    }
  })), /*#__PURE__*/React.createElement(Card, {
    tone: "surface"
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "\u041F\u043E\u043B\u043D\u043E\u0442\u0430 \u0434\u0430\u043D\u043D\u044B\u0445",
    value: "99.4",
    unit: "%",
    caption: "\u0437\u0430 24 \u0447\u0430\u0441\u0430"
  }))), /*#__PURE__*/React.createElement(Panel, {
    title: "\u041F\u0430\u0439\u043F\u043B\u0430\u0439\u043D\u044B",
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "refresh-cw",
        size: 14
      })
    }, "\u041F\u0435\u0440\u0435\u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u044C")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)"
    }
  }, jobs.map(([id, desc, tone, lag, vol]) => /*#__PURE__*/React.createElement("div", {
    key: id,
    style: {
      display: "grid",
      gridTemplateColumns: "220px 1fr 110px 90px 140px",
      alignItems: "center",
      gap: "var(--space-4)",
      padding: "var(--space-4)",
      background: "var(--bg-surface-2)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--inset-hairline)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-mono-s)",
      color: "var(--text-primary)"
    }
  }, id), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-body-s)",
      color: "var(--text-secondary)"
    }
  }, desc), /*#__PURE__*/React.createElement(Badge, {
    tone: tone,
    dot: true
  }, tone === "ok" ? "в работе" : "отставание"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-mono-s)",
      color: "var(--text-muted)"
    }
  }, lag), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-mono-s)",
      color: "var(--text-secondary)",
      textAlign: "right"
    }
  }, vol))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "\u041A\u0430\u0447\u0435\u0441\u0442\u0432\u043E \u0434\u0430\u043D\u043D\u044B\u0445"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)"
    }
  }, [["Пропуски валидаций", 0.006], ["Дубли транзакций", 0.002], ["Остановки без привязки", 0.014], ["Выбросы телематики", 0.021]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 120px 60px",
      alignItems: "center",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-body-s)",
      color: "var(--text-secondary)"
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      height: 8,
      borderRadius: 2,
      background: "var(--ink-600)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      width: `${Math.min(100, v * 2000)}%`,
      height: "100%",
      background: v > 0.015 ? "var(--status-warn)" : "var(--status-ok)"
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-mono-s)",
      color: "var(--text-muted)",
      textAlign: "right"
    }
  }, (v * 100).toFixed(2), " %"))))), /*#__PURE__*/React.createElement(Panel, {
    title: "API \u043F\u0440\u043E\u0433\u043D\u043E\u0437\u0430",
    action: /*#__PURE__*/React.createElement(Badge, {
      tone: "info"
    }, "Spring Boot \xB7 Netty")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)",
      font: "var(--type-mono-s)"
    }
  }, [["GET", "/api/v1/forecast?route=17&horizon=day", "p95 84 мс"], ["GET", "/api/v1/forecast/stop/{id}?from&to", "p95 61 мс"], ["GET", "/api/v1/routes", "p95 12 мс"], ["POST", "/api/v1/model/retrain", "async"]].map(([m, p, l]) => /*#__PURE__*/React.createElement("div", {
    key: p,
    style: {
      display: "grid",
      gridTemplateColumns: "56px 1fr 90px",
      alignItems: "center",
      gap: "var(--space-3)",
      padding: "var(--space-3) var(--space-4)",
      background: "var(--bg-surface-2)",
      borderRadius: "var(--radius-sm)",
      boxShadow: "var(--inset-hairline)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: m === "POST" ? "var(--text-accent)" : "var(--status-info)"
    }
  }, m), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-primary)",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, p), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)",
      textAlign: "right"
    }
  }, l)))))));
}
Object.assign(window, {
  MapView,
  IngestView,
  GEO
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/forecast-dashboard/MapScreens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/forecast-dashboard/Screens.jsx
try { (() => {
const {
  Button,
  Icon,
  Badge,
  Stat,
  LoadMeter,
  Switch,
  Select,
  Card,
  Tabs,
  Tooltip
} = window.DesignSystem_8e46b6;
const STOPS = [{
  name: "Метро Сокольники",
  load: 0.34
}, {
  name: "Стромынка",
  load: 0.52
}, {
  name: "Матросская Тишина",
  load: 0.61
}, {
  name: "Электрозаводская",
  load: 0.86
}, {
  name: "Площадь Журавлёва",
  load: 0.74
}, {
  name: "Госпитальный Вал",
  load: 0.48
}, {
  name: "Лефортово",
  load: 0.29
}];
function Overview({
  horizon,
  route
}) {
  const [band, setBand] = React.useState(true);
  const actual = seedSeries(11, 60, 120, 480);
  const forecast = seedSeries(29, 40, 130, 520);
  const conf = forecast.map((_, i) => 0.04 + i / forecast.length * 0.16);
  const routes = [["3", 0.58], ["17", 0.86], ["27", 0.41], ["А", 0.72], ["10", 0.33], ["7", 0.65]];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement(Card, {
    tone: "surface"
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "\u041F\u0430\u0441\u0441\u0430\u0436\u0438\u0440\u043E\u0432 \u0432 \u0447\u0430\u0441",
    value: "18 420",
    trend: {
      dir: "up",
      value: "6.2 %"
    },
    caption: "\u043A \u043F\u0440\u043E\u0448\u043B\u043E\u0439 \u043D\u0435\u0434\u0435\u043B\u0435"
  })), /*#__PURE__*/React.createElement(Card, {
    tone: "surface"
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "\u041F\u0438\u043A\u043E\u0432\u0430\u044F \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0430",
    value: "86",
    unit: "%",
    caption: "\u042D\u043B\u0435\u043A\u0442\u0440\u043E\u0437\u0430\u0432\u043E\u0434\u0441\u043A\u0430\u044F \xB7 18:40"
  })), /*#__PURE__*/React.createElement(Card, {
    tone: "surface"
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "MAPE \u043C\u043E\u0434\u0435\u043B\u0438",
    value: "7.4",
    unit: "%",
    trend: {
      dir: "down",
      value: "1.8 п.п."
    },
    caption: "\u0437\u0430 30 \u0434\u043D\u0435\u0439"
  })), /*#__PURE__*/React.createElement(Card, {
    tone: "surface"
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "\u041C\u0430\u0440\u0448\u0440\u0443\u0442\u043E\u0432 \u0432 \u043C\u043E\u0434\u0435\u043B\u0438",
    value: "168",
    caption: "\u0432\u0430\u043B\u0438\u0434\u0430\u0446\u0438\u0438 \u0437\u0430 4 \u0433\u043E\u0434\u0430"
  }))), /*#__PURE__*/React.createElement(Panel, {
    title: `Прогноз загрузки · маршрут ${route} · горизонт ${horizon === "day" ? "1 день" : horizon === "month" ? "1 месяц" : "1 год"}`,
    action: /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "var(--space-5)"
      }
    }, /*#__PURE__*/React.createElement(Switch, {
      checked: band,
      onChange: () => setBand(!band),
      label: "\u0414\u043E\u0432\u0435\u0440\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0438\u043D\u0442\u0435\u0440\u0432\u0430\u043B"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        font: "var(--type-caption)",
        color: "var(--text-muted)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 14,
        height: 2,
        background: "var(--cyan-500)"
      }
    }), "\u0444\u0430\u043A\u0442"), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        font: "var(--type-caption)",
        color: "var(--text-muted)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 14,
        height: 2,
        background: "var(--accent)"
      }
    }), "\u043F\u0440\u043E\u0433\u043D\u043E\u0437"))
  }, /*#__PURE__*/React.createElement(ForecastChart, {
    actual: actual,
    forecast: forecast,
    band: band ? conf : null,
    height: 280
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.6fr 1fr",
      gap: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043F\u043E \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0430\u043C",
    action: /*#__PURE__*/React.createElement(LoadLegend, null)
  }, /*#__PURE__*/React.createElement(RouteStrip, {
    stops: STOPS,
    active: 3
  })), /*#__PURE__*/React.createElement(Panel, {
    title: "\u041C\u0430\u0440\u0448\u0440\u0443\u0442\u044B \u0441\u0435\u0442\u0438",
    action: /*#__PURE__*/React.createElement(Badge, {
      tone: "info"
    }, "\u043F\u043E \u043F\u0438\u043A\u043E\u0432\u043E\u0439 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0435")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)"
    }
  }, routes.map(([r, v]) => /*#__PURE__*/React.createElement("div", {
    key: r,
    style: {
      display: "grid",
      gridTemplateColumns: "56px 1fr",
      gap: "var(--space-4)",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      font: "var(--type-ui-s)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "tram-front",
    size: 14
  }), r), /*#__PURE__*/React.createElement(LoadMeter, {
    value: v
  })))))));
}
function RouteView({
  route
}) {
  const rows = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d, i) => ({
    label: d,
    values: seedSeries(7 + i, 24, 0.1, i > 4 ? 0.5 : 0.85).map(v => Math.min(1, v))
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement(Card, {
    tone: "surface"
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "\u0418\u043D\u0442\u0435\u0440\u0432\u0430\u043B",
    value: "6.5",
    unit: "\u043C\u0438\u043D",
    caption: "\u0432 \u0447\u0430\u0441 \u043F\u0438\u043A"
  })), /*#__PURE__*/React.createElement(Card, {
    tone: "surface"
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "\u0412\u0430\u0433\u043E\u043D\u043E\u0432 \u043D\u0430 \u043B\u0438\u043D\u0438\u0438",
    value: "24",
    trend: {
      dir: "up",
      value: "+3"
    },
    caption: "\u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u044F \u043C\u043E\u0434\u0435\u043B\u0438"
  })), /*#__PURE__*/React.createElement(Card, {
    tone: "surface"
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "\u041A\u0440\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0445 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043E\u043A",
    value: "2",
    caption: "\u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0430 > 80 %"
  }))), /*#__PURE__*/React.createElement(Panel, {
    title: `Матрица загрузки · маршрут ${route} · день × час`,
    action: /*#__PURE__*/React.createElement(LoadLegend, null)
  }, /*#__PURE__*/React.createElement(Heatmap, {
    rows: rows
  })), /*#__PURE__*/React.createElement(Panel, {
    title: "\u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u0438 \u0434\u0438\u0441\u043F\u0435\u0442\u0447\u0435\u0440\u0443"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)"
    }
  }, [["danger", "Электрозаводская, 18:30–19:10", "Прогноз 86 % — добавить 2 вагона на выпуск"], ["warn", "Площадь Журавлёва, 08:10–08:50", "Прогноз 74 % — сократить интервал до 5 мин"], ["ok", "Лефортово, весь день", "Резерв: можно снять 1 вагон после 20:00"]].map(([tone, t, d]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)",
      padding: "var(--space-4)",
      background: "var(--bg-surface-2)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--inset-hairline)"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: tone
  }, tone === "danger" ? "Пик" : tone === "warn" ? "Внимание" : "Резерв"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-ui-s)",
      fontFamily: "var(--font-mono)",
      color: "var(--text-primary)"
    }
  }, t), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-body-s)",
      color: "var(--text-secondary)"
    }
  }, d))))));
}
function ModelView() {
  const hist = seedSeries(3, 30, 6, 4);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: "var(--space-5)"
    }
  }, [["MAPE", "7.4", "%"], ["RMSE", "48.2", ""], ["R²", "0.91", ""], ["Обучение", "14", "мин"]].map(([l, v, u]) => /*#__PURE__*/React.createElement(Card, {
    key: l,
    tone: "surface"
  }, /*#__PURE__*/React.createElement(Stat, {
    label: l,
    value: v,
    unit: u
  }), /*#__PURE__*/React.createElement(Sparkline, {
    data: hist
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "\u0412\u043A\u043B\u0430\u0434 \u043F\u0440\u0438\u0437\u043D\u0430\u043A\u043E\u0432"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)"
    }
  }, [["Час суток", 0.94], ["День недели", 0.71], ["Погода", 0.48], ["События в городе", 0.35], ["Интервал движения", 0.62]].map(([f, v]) => /*#__PURE__*/React.createElement("div", {
    key: f,
    style: {
      display: "grid",
      gridTemplateColumns: "180px 1fr 48px",
      gap: "var(--space-4)",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-body-s)",
      color: "var(--text-secondary)"
    }
  }, f), /*#__PURE__*/React.createElement("span", {
    style: {
      height: 8,
      borderRadius: 2,
      background: "var(--ink-600)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      width: `${v * 100}%`,
      height: "100%",
      background: "var(--cyan-500)"
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-mono-s)",
      color: "var(--text-muted)",
      textAlign: "right"
    }
  }, v.toFixed(2)))))), /*#__PURE__*/React.createElement(Panel, {
    title: "\u041E\u0431\u0443\u0447\u0435\u043D\u0438\u044F",
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "secondary",
      iconLeft: /*#__PURE__*/React.createElement(Icon, {
        name: "refresh-cw",
        size: 14
      })
    }, "\u041F\u0435\u0440\u0435\u043E\u0431\u0443\u0447\u0438\u0442\u044C")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)"
    }
  }, [["v14", "13.09 04:00", "ok", "7.4 %"], ["v13", "06.09 04:00", "ok", "8.1 %"], ["v12", "30.08 04:00", "warn", "9.6 %"]].map(([v, d, tone, m]) => /*#__PURE__*/React.createElement("div", {
    key: v,
    style: {
      display: "grid",
      gridTemplateColumns: "60px 1fr 90px 70px",
      alignItems: "center",
      gap: "var(--space-3)",
      padding: "var(--space-3) var(--space-4)",
      background: "var(--bg-surface-2)",
      borderRadius: "var(--radius-sm)",
      boxShadow: "var(--inset-hairline)",
      font: "var(--type-mono-s)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-primary)"
    }
  }, v), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)"
    }
  }, d), /*#__PURE__*/React.createElement(Badge, {
    tone: tone
  }, tone === "ok" ? "в проде" : "архив"), /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: "right",
      color: "var(--text-secondary)"
    }
  }, m)))))));
}
Object.assign(window, {
  Overview,
  RouteView,
  ModelView,
  STOPS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/forecast-dashboard/Screens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/forecast-dashboard/Shell.jsx
try { (() => {
const {
  Button,
  IconButton,
  Icon,
  Badge,
  Tabs,
  Tag,
  Card,
  Tooltip
} = window.DesignSystem_8e46b6;
const NAV = [["map", "map-pin", "Карта загрузки"], ["overview", "activity", "Обзор сети"], ["route", "route", "Маршрут"], ["model", "brain", "Модель"], ["data", "layers", "Данные"]];
function Sidebar({
  view,
  onView
}) {
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 232,
      flex: "0 0 auto",
      background: "var(--bg-surface)",
      boxShadow: "inset -1px 0 0 var(--border-subtle)",
      display: "flex",
      flexDirection: "column",
      padding: "var(--space-6) var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)",
      padding: "0 var(--space-3) var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/mark-pin-white.svg",
    alt: "",
    style: {
      height: 26
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-h4)",
      letterSpacing: "var(--tracking-tight)"
    }
  }, "\u041F\u043E\u0442\u043E\u043A"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-caption)",
      color: "var(--text-muted)"
    }
  }, "Manticore \xB7 \u0442\u0440\u0435\u043A 02"))), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-1)"
    }
  }, NAV.map(([id, ic, label]) => {
    const on = id === view;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      onClick: () => onView(id),
      style: {
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        height: 44,
        padding: "0 var(--space-3)",
        border: "none",
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        font: "var(--type-ui-s)",
        textAlign: "left",
        background: on ? "var(--accent-quiet)" : "transparent",
        color: on ? "var(--text-accent)" : "var(--text-secondary)",
        transition: "var(--transition-ui)"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: ic,
      size: 18
    }), label);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "auto",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement(Card, {
    tone: "outline",
    padding: "var(--space-4)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-2)"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "ok",
    dot: true
  }, "\u041F\u043E\u0442\u043E\u043A \u0434\u0430\u043D\u043D\u044B\u0445")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-3)",
      font: "var(--type-mono-s)",
      color: "var(--text-muted)"
    }
  }, "\u0432\u0430\u043B\u0438\u0434\u0430\u0446\u0438\u0438 \xB7 12 \u0441 \u043D\u0430\u0437\u0430\u0434", /*#__PURE__*/React.createElement("br", null), "\u0442\u0435\u043B\u0435\u043C\u0430\u0442\u0438\u043A\u0430 \xB7 4 \u0441 \u043D\u0430\u0437\u0430\u0434"))));
}
function TopBar({
  horizon,
  onHorizon,
  route,
  onRoute,
  onExport
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)",
      padding: "var(--space-5) var(--space-8)",
      boxShadow: "inset 0 -1px 0 var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-2)"
    }
  }, ["3", "17", "27", "А"].map(r => /*#__PURE__*/React.createElement(Tag, {
    key: r,
    selected: r === route,
    onClick: () => onRoute(r),
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "tram-front",
      size: 14
    })
  }, r))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    value: horizon,
    onChange: onHorizon,
    items: [{
      value: "day",
      label: "1 день"
    }, {
      value: "month",
      label: "1 месяц"
    }, {
      value: "year",
      label: "1 год"
    }]
  }), /*#__PURE__*/React.createElement(Tooltip, {
    content: "\u0412\u044B\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043F\u0440\u043E\u0433\u043D\u043E\u0437 \u0432 CSV"
  }, /*#__PURE__*/React.createElement(IconButton, {
    label: "\u042D\u043A\u0441\u043F\u043E\u0440\u0442",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "download",
      size: 18
    }),
    onClick: onExport
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: "var(--radius-pill)",
      background: "var(--ink-600)",
      boxShadow: "var(--inset-hairline-strong)",
      display: "grid",
      placeItems: "center",
      font: "var(--type-ui-s)"
    }
  }, "\u0415\u0414")));
}
function Panel({
  title,
  action,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement(Card, {
    tone: "surface",
    padding: "var(--space-6)",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-5)",
      ...style
    }
  }, (title || action) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-h4)"
    }
  }, title), action), children);
}
function LoadLegend() {
  const labels = ["Свободно", "Комфортно", "Умеренно", "Плотно", "Перегружено"];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-4)",
      flexWrap: "wrap"
    }
  }, labels.map((l, i) => /*#__PURE__*/React.createElement("span", {
    key: l,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      font: "var(--type-caption)",
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: 2,
      background: LOAD_VARS[i]
    }
  }), l)));
}
Object.assign(window, {
  Sidebar,
  TopBar,
  Panel,
  LoadLegend,
  NAV
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/forecast-dashboard/Shell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/hackathon-site/App.jsx
try { (() => {
const {
  Dialog,
  Button,
  Input,
  Select,
  Checkbox,
  Radio,
  Toast,
  Icon
} = window.DesignSystem_8e46b6;
function RegisterDialog({
  open,
  onClose,
  onDone
}) {
  const [track, setTrack] = React.useState("02");
  const [agree, setAgree] = React.useState(false);
  return /*#__PURE__*/React.createElement(Dialog, {
    open: open,
    onClose: onClose,
    width: 520,
    title: "\u0417\u0430\u044F\u0432\u043A\u0430 \u043D\u0430 \u0445\u0430\u043A\u0430\u0442\u043E\u043D",
    description: "\u041F\u0440\u0438\u0451\u043C \u0437\u0430\u044F\u0432\u043E\u043A \u0434\u043E 22 \u0441\u0435\u043D\u0442\u044F\u0431\u0440\u044F. \u041A\u043E\u043C\u0430\u043D\u0434\u0430 \u2014 \u043E\u0442 3 \u0434\u043E 5 \u0447\u0435\u043B\u043E\u0432\u0435\u043A.",
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: onClose
    }, "\u041E\u0442\u043C\u0435\u043D\u0430"), /*#__PURE__*/React.createElement(Button, {
      disabled: !agree,
      onClick: onDone
    }, "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u044F\u0432\u043A\u0443"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043A\u043E\u043C\u0430\u043D\u0434\u044B",
    defaultValue: "Manticore"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "\u041F\u043E\u0447\u0442\u0430 \u043A\u0430\u043F\u0438\u0442\u0430\u043D\u0430",
    defaultValue: "captain@manticore.dev",
    prefix: /*#__PURE__*/React.createElement(Icon, {
      name: "mail",
      size: 16
    })
  }), /*#__PURE__*/React.createElement(Select, {
    label: "\u0420\u0430\u0437\u043C\u0435\u0440 \u043A\u043E\u043C\u0430\u043D\u0434\u044B",
    options: [{
      value: "3",
      label: "3 человека"
    }, {
      value: "4",
      label: "4 человека"
    }, {
      value: "5",
      label: "5 человек"
    }]
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-ui-s)",
      color: "var(--text-secondary)",
      marginBottom: "var(--space-3)"
    }
  }, "\u0422\u0440\u0435\u043A"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)"
    }
  }, TRACKS.map(t => /*#__PURE__*/React.createElement(Radio, {
    key: t.n,
    name: "track",
    checked: track === t.n,
    onChange: () => setTrack(t.n),
    label: t.title
  })))), /*#__PURE__*/React.createElement(Checkbox, {
    checked: agree,
    onChange: () => setAgree(!agree),
    label: "\u0421\u043E\u0433\u043B\u0430\u0441\u0435\u043D \u0441 \u043F\u043E\u043B\u0438\u0442\u0438\u043A\u043E\u0439 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0438 \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0445 \u0434\u0430\u043D\u043D\u044B\u0445"
  })));
}
function App() {
  const [dialog, setDialog] = React.useState(false);
  const [toast, setToast] = React.useState(false);
  const open = () => setDialog(true);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      minHeight: "100vh"
    }
  }, /*#__PURE__*/React.createElement(Nav, null), /*#__PURE__*/React.createElement(Hero, {
    onRegister: open
  }), /*#__PURE__*/React.createElement(About, null), /*#__PURE__*/React.createElement(Tracks, null), /*#__PURE__*/React.createElement(Prizes, {
    onRegister: open
  }), /*#__PURE__*/React.createElement(Schedule, null), /*#__PURE__*/React.createElement(Faq, null), /*#__PURE__*/React.createElement(Experts, null), /*#__PURE__*/React.createElement(Organizers, null), /*#__PURE__*/React.createElement(SiteFooter, {
    onRegister: open
  }), /*#__PURE__*/React.createElement(RegisterDialog, {
    open: dialog,
    onClose: () => setDialog(false),
    onDone: () => {
      setDialog(false);
      setToast(true);
      setTimeout(() => setToast(false), 4000);
    }
  }), toast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      right: 24,
      bottom: 24,
      zIndex: 60
    }
  }, /*#__PURE__*/React.createElement(Toast, {
    tone: "ok",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 16
    }),
    title: "\u0417\u0430\u044F\u0432\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0430",
    description: "\u041C\u044B \u043D\u0430\u043F\u0438\u0441\u0430\u043B\u0438 \u043D\u0430 \u043F\u043E\u0447\u0442\u0443 \u043A\u0430\u043F\u0438\u0442\u0430\u043D\u0430 \u043A\u043E\u043C\u0430\u043D\u0434\u044B Manticore.",
    onClose: () => setToast(false)
  })));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/hackathon-site/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/hackathon-site/Sections.jsx
try { (() => {
const {
  Button,
  Card,
  Badge,
  Tag,
  Icon,
  IconButton,
  Stat,
  Timeline,
  Accordion,
  Tabs
} = window.DesignSystem_8e46b6;
const siteShell = {
  wrap: {
    maxWidth: "var(--container-max)",
    margin: "0 auto",
    padding: "0 var(--gutter)"
  }
};
function Nav() {
  const links = [["#about", "О хакатоне"], ["#task", "Задачи"], ["#prize", "Призы"], ["#faq", "Ответы на вопросы"]];
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 30,
      background: "rgba(14,17,19,.78)",
      backdropFilter: "var(--blur-glass)",
      boxShadow: "inset 0 -1px 0 var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...siteShell.wrap,
      display: "flex",
      alignItems: "center",
      gap: "var(--space-8)",
      height: 76
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-mttech-white.svg",
    alt: "\u041C\u0422\u0422\u0415\u0425",
    style: {
      height: 30
    }
  }), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      gap: "var(--space-6)",
      marginLeft: "auto"
    }
  }, links.map(([h, l]) => /*#__PURE__*/React.createElement("a", {
    key: h,
    href: h,
    style: {
      font: "var(--type-ui-s)",
      color: "var(--text-secondary)",
      textDecoration: "none"
    }
  }, l))), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    as: "a",
    href: "#reg"
  }, "\u041F\u0440\u0438\u043D\u044F\u0442\u044C \u0443\u0447\u0430\u0441\u0442\u0438\u0435")));
}
function Hero({
  onRegister
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: "relative",
      overflow: "hidden",
      padding: "var(--space-24) 0 var(--space-20)"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/mark-pin-white.svg",
    alt: "",
    style: {
      position: "absolute",
      right: -60,
      top: -40,
      height: 560,
      opacity: 0.05,
      pointerEvents: "none"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      ...siteShell.wrap,
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-12)",
      marginBottom: "var(--space-10)"
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "\u0414\u0430\u0442\u044B \u043F\u0440\u043E\u0432\u0435\u0434\u0435\u043D\u0438\u044F",
    value: "25.09 \u2014 03.10"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "\u041F\u0440\u0438\u0437\u043E\u0432\u043E\u0439 \u0444\u043E\u043D\u0434",
    value: "4 000 000",
    unit: "\u20BD"
  })), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: "var(--type-display-xl)",
      letterSpacing: "var(--tracking-display)",
      maxWidth: 980
    }
  }, "\u0425\u0430\u043A\u0430\u0442\u043E\u043D \u041C\u043E\u0441\u043A\u043E\u0432\u0441\u043A\u043E\u0433\u043E", /*#__PURE__*/React.createElement("br", null), "\u0442\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442\u0430"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "var(--space-6) 0 var(--space-10)",
      font: "var(--type-body-l)",
      color: "var(--text-secondary)",
      maxWidth: 560
    }
  }, "\u0420\u0435\u0448\u0430\u0439\u0442\u0435 \u0440\u0435\u0430\u043B\u044C\u043D\u044B\u0435 \u0437\u0430\u0434\u0430\u0447\u0438 \u0434\u043B\u044F \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u044F \u043C\u0435\u0433\u0430\u043F\u043E\u043B\u0438\u0441\u0430"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-5)",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    onClick: onRegister,
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 18
    })
  }, "\u041F\u0440\u0438\u043D\u044F\u0442\u044C \u0443\u0447\u0430\u0441\u0442\u0438\u0435"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-body-s)",
      color: "var(--text-muted)"
    }
  }, "\u041F\u0440\u0438\u0451\u043C \u0437\u0430\u044F\u0432\u043E\u043A \u0434\u043E 22 \u0441\u0435\u043D\u0442\u044F\u0431\u0440\u044F"))));
}
function SectionHead({
  eyebrow,
  title,
  lead,
  id
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "var(--space-12)"
    },
    id: id
  }, eyebrow && /*#__PURE__*/React.createElement("div", {
    className: "mt-eyebrow",
    style: {
      marginBottom: "var(--space-4)"
    }
  }, eyebrow), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      font: "var(--type-display-m)",
      letterSpacing: "var(--tracking-display)"
    }
  }, title), lead && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "var(--space-4) 0 0",
      font: "var(--type-body-l)",
      color: "var(--text-secondary)",
      maxWidth: 620
    }
  }, lead));
}
function About() {
  const facts = [["Даты", "25 сентября — 3 октября"], ["Формат", "Онлайн с финалом в Москве"], ["Задачи", "4 трека"], ["Команда", "От 3 до 5 человек"], ["Призовой фонд", "4 000 000 ₽"]];
  const why = [["route", "Решайте задачи мегаполиса", "Создавайте решения, которыми смогут пользоваться миллионы людей"], ["users", "Попади в команду Московского транспорта", "Получите возможность попасть в ИТ-команду, которая приводит целый город в движение"], ["messages-square", "Развивайтесь вместе с экспертами", "Получайте обратную связь и усиливайте своё решение"], ["send", "Найдите своих в ИТ", "Вступайте в чат хакатона и знакомьтесь с другими участниками"], ["trophy", "Призовой фонд 4 000 000 ₽ и фирменный мерч", "Выйдите в финал и получите шанс выиграть денежный приз"]];
  return /*#__PURE__*/React.createElement("section", {
    id: "about",
    style: {
      background: "var(--bg-surface)",
      padding: "var(--space-24) 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: siteShell.wrap
  }, /*#__PURE__*/React.createElement(SectionHead, {
    title: "\u041E \u0445\u0430\u043A\u0430\u0442\u043E\u043D\u0435"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(5,1fr)",
      gap: "var(--space-4)",
      marginBottom: "var(--space-16)"
    }
  }, facts.map(([l, v]) => /*#__PURE__*/React.createElement(Card, {
    key: l,
    tone: "raised"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mt-eyebrow"
  }, l), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-3)",
      font: "var(--type-h4)"
    }
  }, v)))), /*#__PURE__*/React.createElement(SectionHead, {
    title: "\u0417\u0430\u0447\u0435\u043C \u0443\u0447\u0430\u0441\u0442\u0432\u043E\u0432\u0430\u0442\u044C?"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: "var(--space-4)"
    }
  }, why.map(([ic, t, d], i) => /*#__PURE__*/React.createElement(Card, {
    key: t,
    tone: i === 4 ? "accent" : "raised",
    interactive: true,
    pin: i === 4,
    style: {
      gridColumn: i === 4 ? "span 2" : "span 1",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    size: 24
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-h3)",
      letterSpacing: "var(--tracking-tight)"
    }
  }, t), /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-body-s)",
      color: i === 4 ? "rgba(255,255,255,.82)" : "var(--text-secondary)"
    }
  }, d))))));
}
Object.assign(window, {
  siteShell,
  Nav,
  Hero,
  SectionHead,
  About
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/hackathon-site/Sections.jsx", error: String((e && e.message) || e) }); }

// ui_kits/hackathon-site/Tracks.jsx
try { (() => {
const {
  Button,
  Card,
  Badge,
  Tag,
  Icon,
  Stat,
  Timeline,
  Accordion
} = window.DesignSystem_8e46b6;
const TRACKS = [{
  n: "01",
  title: "Резервная одометрия по модели",
  lead: "Оценка пройденного пути беспилотного трамвая без показаний датчиков.",
  tags: ["ML", "Sensor fusion", "C++/Python"]
}, {
  n: "02",
  title: "ИИ-прогноз загрузки трамвайных маршрутов",
  lead: "Краткосрочные, среднесрочные и долгосрочные прогнозы пассажиропотока с привязкой к геопозиции и времени.",
  tags: ["Time series", "Spring Boot", "React + карты"],
  featured: true
}, {
  n: "03",
  title: "Предиктор изменений в графике движения городского транспорта",
  lead: "Предсказание отклонений от расписания и их причин.",
  tags: ["ML", "Data Engineering"]
}, {
  n: "04",
  title: "Геймификация для ВСМ",
  lead: "Сценарии вовлечения пассажиров высокоскоростной магистрали.",
  tags: ["Product", "Frontend"]
}];
function Tracks() {
  const [open, setOpen] = React.useState(1);
  return /*#__PURE__*/React.createElement("section", {
    id: "task",
    style: {
      padding: "var(--space-24) 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: siteShell.wrap
  }, /*#__PURE__*/React.createElement(SectionHead, {
    title: "\u0417\u0430\u0434\u0430\u0447\u0438",
    lead: "\u0412\u044B\u0431\u0438\u0440\u0430\u0439\u0442\u0435 \u043E\u0434\u0438\u043D \u0442\u0440\u0435\u043A \u0438 \u0441\u043E\u0437\u0434\u0430\u0432\u0430\u0439\u0442\u0435 \u0440\u0435\u0448\u0435\u043D\u0438\u0435 \u0434\u043B\u044F \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u044F \u043C\u0435\u0433\u0430\u043F\u043E\u043B\u0438\u0441\u0430"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)"
    }
  }, TRACKS.map((t, i) => {
    const on = i === open;
    return /*#__PURE__*/React.createElement(Card, {
      key: t.n,
      tone: on ? "raised" : "surface",
      padding: "var(--space-6) var(--space-8)",
      style: {
        cursor: "pointer"
      },
      onClick: () => setOpen(on ? -1 : i)
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "var(--space-6)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: "var(--type-metric)",
        color: on ? "var(--text-accent)" : "var(--text-muted)"
      }
    }, t.n), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        font: "var(--type-h2)",
        letterSpacing: "var(--tracking-tight)"
      }
    }, t.title), t.featured && /*#__PURE__*/React.createElement(Badge, {
      tone: "accent"
    }, "\u0422\u0440\u0435\u043A Manticore"), /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
      style: {
        width: 12,
        height: 12,
        borderRight: "2px solid var(--text-muted)",
        borderBottom: "2px solid var(--text-muted)",
        transform: on ? "rotate(-135deg)" : "rotate(45deg)",
        transition: "transform var(--dur-base) var(--ease-standard)"
      }
    })), on && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-end",
        gap: "var(--space-8)",
        marginTop: "var(--space-6)",
        paddingLeft: 76
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        flex: 1,
        font: "var(--type-body)",
        color: "var(--text-secondary)",
        maxWidth: 640
      }
    }, t.lead), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: "var(--space-2)",
        flexWrap: "wrap"
      }
    }, t.tags.map(x => /*#__PURE__*/React.createElement(Tag, {
      key: x
    }, x)))));
  }))));
}
function Prizes({
  onRegister
}) {
  const places = [["1 место", "500 000 ₽"], ["2 место", "300 000 ₽"], ["3 место", "200 000 ₽"]];
  return /*#__PURE__*/React.createElement("section", {
    id: "prize",
    style: {
      background: "var(--bg-surface)",
      padding: "var(--space-24) 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: siteShell.wrap
  }, /*#__PURE__*/React.createElement(SectionHead, {
    title: "\u041F\u0440\u0438\u0437\u043E\u0432\u043E\u0439 \u0444\u043E\u043D\u0434"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1.2fr 1fr",
      gap: "var(--space-6)",
      alignItems: "stretch"
    }
  }, /*#__PURE__*/React.createElement(Card, {
    tone: "accent",
    pin: true,
    padding: "var(--space-10)",
    style: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "mt-eyebrow",
    style: {
      color: "rgba(255,255,255,.75)"
    }
  }, "\u041E\u0431\u0449\u0438\u0439 \u043F\u0440\u0438\u0437\u043E\u0432\u043E\u0439 \u0444\u043E\u043D\u0434"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-metric-xl)",
      letterSpacing: "var(--tracking-display)"
    }
  }, "4 000 000 \u20BD"), /*#__PURE__*/React.createElement(Button, {
    variant: "inverse",
    onClick: onRegister,
    style: {
      alignSelf: "flex-start"
    }
  }, "\u041F\u0440\u0438\u043D\u044F\u0442\u044C \u0443\u0447\u0430\u0441\u0442\u0438\u0435")), /*#__PURE__*/React.createElement(Card, {
    tone: "raised",
    padding: "var(--space-8)"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mt-eyebrow"
  }, "\u0412 \u043A\u0430\u0436\u0434\u043E\u043C \u0442\u0440\u0435\u043A\u0435"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-6)",
      display: "flex",
      flexDirection: "column"
    }
  }, places.map(([p, v], i) => /*#__PURE__*/React.createElement("div", {
    key: p,
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      padding: "var(--space-5) 0",
      boxShadow: i < 2 ? "inset 0 -1px 0 var(--border-subtle)" : "none"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-h3)",
      color: "var(--text-secondary)"
    }
  }, p), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--type-metric)"
    }
  }, v))))))));
}
function Schedule() {
  const items = [{
    date: "25 сентября",
    title: "Открытие хакатона (офлайн с трансляцией)",
    done: true
  }, {
    date: "27 сентября",
    title: "Дедлайн по загрузке решений",
    done: true
  }, {
    date: "29 сентября",
    title: "Публикация списка команд-полуфиналистов"
  }, {
    date: "30 сентября",
    title: "Полуфинал. Закрытые онлайн-питчи"
  }, {
    date: "1 октября",
    title: "Публикация списка команд-финалистов"
  }, {
    date: "3 октября",
    title: "Финал хакатона (офлайн с трансляцией)"
  }];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: "var(--space-24) 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...siteShell.wrap,
      display: "grid",
      gridTemplateColumns: "1fr 1.4fr",
      gap: "var(--space-16)"
    }
  }, /*#__PURE__*/React.createElement(SectionHead, {
    title: "\u0422\u0430\u0439\u043C\u043B\u0430\u0439\u043D",
    lead: "\u0414\u0435\u0432\u044F\u0442\u044C \u0434\u043D\u0435\u0439 \u043E\u0442 \u043E\u0442\u043A\u0440\u044B\u0442\u0438\u044F \u0434\u043E \u0444\u0438\u043D\u0430\u043B\u0430"
  }), /*#__PURE__*/React.createElement(Timeline, {
    items: items
  })));
}
function Faq() {
  const items = [{
    question: "Как будет проходить хакатон?",
    answer: "Онлайн-этап с 25 по 29 сентября, закрытые полуфинальные питчи 30 сентября и очный финал в Москве 3 октября с трансляцией."
  }, {
    question: "Сколько человек должно быть в команде?",
    answer: "От 3 до 5 человек. Рекомендуемый состав для ML-трека: 1–2 ML-инженера, backend, frontend и аналитик."
  }, {
    question: "У меня нет команды, как мне найти сокомандников?",
    answer: "Вступайте в чат хакатона в Telegram — там участники собирают команды по трекам."
  }, {
    question: "Кто может участвовать в хакатоне?",
    answer: "Разработчики, аналитики, дата-сайентисты и продакт-менеджеры от 18 лет."
  }, {
    question: "Как будет устроена коммуникация с участниками?",
    answer: "Все объявления дублируются в Telegram-чате и на почту капитана команды."
  }, {
    question: "Как я могу связаться с организаторами?",
    answer: "Напишите на ask@pgenesis.ru или в чат хакатона."
  }];
  return /*#__PURE__*/React.createElement("section", {
    id: "faq",
    style: {
      background: "var(--bg-surface)",
      padding: "var(--space-24) 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: siteShell.wrap
  }, /*#__PURE__*/React.createElement(SectionHead, {
    title: "\u041E\u0442\u0432\u0435\u0442\u044B \u043D\u0430 \u0432\u043E\u043F\u0440\u043E\u0441\u044B"
  }), /*#__PURE__*/React.createElement(Accordion, {
    defaultOpen: 1,
    items: items
  })));
}
const EXPERTS = [["Жанна Ермолина", "Генеральный директор МТТЕХ"], ["Маргарита Колосова", "Генеральный директор ООО «ВСМ-400»"], ["Анна Скобкина", "Руководитель Центра транспортных решений МТТЕХ"], ["Николай Кудашов", "Руководитель Центра наземного транспорта МТТЕХ"], ["Павел Бокша", "Руководитель Центра беспилотного транспорта МТТЕХ"], ["Гусейн Римиханов", "Руководитель Центра прикладных сервисов МТТЕХ"], ["Александр Цыпляев", "Заместитель генерального директора ООО «ВСМ-400» по обслуживанию пассажиров"], ["Сергей Марченко", "Заместитель руководителя дирекции клиентского сервиса и маркетинга «ВСМ-400»"]];
function Experts() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: "var(--space-24) 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: siteShell.wrap
  }, /*#__PURE__*/React.createElement(SectionHead, {
    title: "\u042D\u043A\u0441\u043F\u0435\u0440\u0442\u044B"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: "var(--space-4)"
    }
  }, EXPERTS.map(([n, r]) => /*#__PURE__*/React.createElement(Card, {
    key: n,
    tone: "surface",
    padding: "var(--space-5)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 132,
      borderRadius: "var(--radius-md)",
      background: "var(--ink-600)",
      boxShadow: "var(--inset-hairline)",
      display: "grid",
      placeItems: "center",
      color: "var(--slate-400)",
      font: "var(--type-caption)",
      marginBottom: "var(--space-4)"
    }
  }, "\u043F\u043E\u0440\u0442\u0440\u0435\u0442 \u043D\u0435 \u043F\u0440\u0435\u0434\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D"), /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-h4)"
    }
  }, n), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      font: "var(--type-body-s)",
      color: "var(--text-muted)"
    }
  }, r))))));
}
function Organizers() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--bg-surface)",
      padding: "var(--space-24) 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: siteShell.wrap
  }, /*#__PURE__*/React.createElement(SectionHead, {
    title: "\u041E\u0440\u0433\u0430\u043D\u0438\u0437\u0430\u0442\u043E\u0440\u044B"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement(Card, {
    tone: "raised",
    padding: "var(--space-8)"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-mttech-white.svg",
    alt: "\u041C\u0422\u0422\u0415\u0425",
    style: {
      height: 34,
      marginBottom: "var(--space-6)"
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: "var(--type-body-s)",
      color: "var(--text-secondary)"
    }
  }, "\u041C\u0422\u0422\u0415\u0425 \u2014 \u0446\u0435\u043D\u0442\u0440 \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0438 \u041C\u043E\u0441\u043A\u043E\u0432\u0441\u043A\u043E\u0433\u043E \u0442\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442\u0430, \u0441\u043E\u0437\u0434\u0430\u044E\u0449\u0438\u0439 \u0418\u0422-\u0440\u0435\u0448\u0435\u043D\u0438\u044F, \u043A\u043E\u0442\u043E\u0440\u044B\u043C\u0438 \u0435\u0436\u0435\u0434\u043D\u0435\u0432\u043D\u043E \u043F\u043E\u043B\u044C\u0437\u0443\u044E\u0442\u0441\u044F \u043C\u0438\u043B\u043B\u0438\u043E\u043D\u044B \u043F\u0430\u0441\u0441\u0430\u0436\u0438\u0440\u043E\u0432: \u043E\u0442 \u043E\u043F\u043B\u0430\u0442\u044B \u0438 \u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u043E\u0432 \u0434\u043E \u0431\u0435\u0441\u043F\u0438\u043B\u043E\u0442\u043D\u043E\u0433\u043E \u0442\u0440\u0430\u043C\u0432\u0430\u044F.")), /*#__PURE__*/React.createElement(Card, {
    tone: "raised",
    padding: "var(--space-8)"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-tim-white.svg",
    alt: "\u0422\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442\u043D\u044B\u0435 \u0418\u043D\u043D\u043E\u0432\u0430\u0446\u0438\u0438 \u041C\u043E\u0441\u043A\u0432\u044B",
    style: {
      height: 44,
      marginBottom: "var(--space-5)"
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: "var(--type-body-s)",
      color: "var(--text-secondary)"
    }
  }, "\u0424\u043E\u043D\u0434 \xAB\u0422\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442\u043D\u044B\u0435 \u0438\u043D\u043D\u043E\u0432\u0430\u0446\u0438\u0438 \u041C\u043E\u0441\u043A\u0432\u044B\xBB \u043F\u043E\u043C\u043E\u0433\u0430\u0435\u0442 \u0438\u043D\u0442\u0435\u0433\u0440\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0442\u0435\u0445\u043D\u043E\u043B\u043E\u0433\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0440\u0435\u0448\u0435\u043D\u0438\u044F \u0432 \u0442\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442\u043D\u044B\u0439 \u043A\u043E\u043C\u043F\u043B\u0435\u043A\u0441 \u041C\u043E\u0441\u043A\u0432\u044B, \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442 \u043F\u0435\u0440\u0441\u043F\u0435\u043A\u0442\u0438\u0432\u043D\u044B\u0435 \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438 \u0438 \u0441\u043E\u043F\u0440\u043E\u0432\u043E\u0436\u0434\u0430\u0435\u0442 \u043F\u0440\u043E\u0435\u043A\u0442\u044B \u043E\u0442 \u0437\u0430\u044F\u0432\u043A\u0438 \u0434\u043E \u043F\u0438\u043B\u043E\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F, \u0432\u043D\u0435\u0434\u0440\u0435\u043D\u0438\u044F \u0438 \u043C\u0430\u0441\u0448\u0442\u0430\u0431\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F.")))));
}
function SiteFooter({
  onRegister
}) {
  return /*#__PURE__*/React.createElement("footer", {
    id: "reg",
    style: {
      padding: "var(--space-20) 0 var(--space-12)",
      boxShadow: "inset 0 1px 0 var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: siteShell.wrap
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "var(--space-8)",
      flexWrap: "wrap",
      marginBottom: "var(--space-16)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--type-display-m)",
      letterSpacing: "var(--tracking-display)"
    }
  }, "\u041F\u0440\u0438\u043D\u044F\u0442\u044C \u0443\u0447\u0430\u0441\u0442\u0438\u0435"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-3)",
      font: "var(--type-body-s)",
      color: "var(--text-muted)"
    }
  }, "\u041F\u0440\u0438\u0451\u043C \u0437\u0430\u044F\u0432\u043E\u043A \u0434\u043E 22 \u0441\u0435\u043D\u0442\u044F\u0431\u0440\u044F")), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    onClick: onRegister,
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 18
    })
  }, "\u041F\u043E\u0434\u0430\u0442\u044C \u0437\u0430\u044F\u0432\u043A\u0443")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: "var(--space-8)",
      font: "var(--type-body-s)",
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "mt-eyebrow",
    style: {
      marginBottom: "var(--space-4)"
    }
  }, "\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u044B"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("a", {
    href: "mailto:ask@pgenesis.ru"
  }, "ask@pgenesis.ru")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#faq"
  }, "\u0427\u0430\u0442 \u0432 Telegram"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "mt-eyebrow",
    style: {
      marginBottom: "var(--space-4)"
    }
  }, "\u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u044B"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("a", {
    href: "#faq"
  }, "\u041F\u043E\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0445\u0430\u043A\u0430\u0442\u043E\u043D\u0430")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#faq"
  }, "\u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0430 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0438 \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0445 \u0434\u0430\u043D\u043D\u044B\u0445"))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("div", null, "\u0425\u0430\u043A\u0430\u0442\u043E\u043D \u041C\u043E\u0441\u043A\u043E\u0432\u0441\u043A\u043E\u0433\u043E \u0442\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442\u0430 \xA9 2026"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      fontFamily: "var(--font-mono)"
    }
  }, "25.09 \u2014 03.10 \xB7 \u041E\u043D\u043B\u0430\u0439\u043D + \u041C\u043E\u0441\u043A\u0432\u0430")))));
}
Object.assign(window, {
  TRACKS,
  Tracks,
  Prizes,
  Schedule,
  Faq,
  Experts,
  Organizers,
  SiteFooter
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/hackathon-site/Tracks.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.ICON_SET = __ds_scope.ICON_SET;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.LoadMeter = __ds_scope.LoadMeter;

__ds_ns.Stat = __ds_scope.Stat;

__ds_ns.Timeline = __ds_scope.Timeline;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Accordion = __ds_scope.Accordion;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
