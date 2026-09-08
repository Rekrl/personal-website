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
