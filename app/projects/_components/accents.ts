import type { Accent } from "../_data/types";

// Per-project accent → Tailwind classes. Written out as literals so Tailwind's
// scanner keeps them.

export const ACCENT_TEXT: Record<Accent, string> = {
  cyan: "text-cyan",
  magenta: "text-magenta",
  purple: "text-purple",
  orange: "text-orange",
};

export const ACCENT_HOVER_BORDER: Record<Accent, string> = {
  cyan: "hover:border-cyan",
  magenta: "hover:border-magenta",
  purple: "hover:border-purple",
  orange: "hover:border-orange",
};

// title colour on card hover
export const ACCENT_GROUP_HOVER_TEXT: Record<Accent, string> = {
  cyan: "group-hover:text-cyan",
  magenta: "group-hover:text-magenta",
  purple: "group-hover:text-purple",
  orange: "group-hover:text-orange",
};

// signature stack chip: accent border + text
export const ACCENT_CHIP: Record<Accent, string> = {
  cyan: "border-cyan text-cyan",
  magenta: "border-magenta text-magenta",
  purple: "border-purple text-purple",
  orange: "border-orange text-orange",
};
