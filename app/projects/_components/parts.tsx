import type { Accent, Status } from "../_data/types";
import { STATUS_LABEL } from "../_data/types";

// Small shared pieces, reused by the case-study template and the landing
// section (see docs/adr/0003-landing-projects-section.md).

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

export const ACCENT_GROUP_HOVER_TEXT: Record<Accent, string> = {
  cyan: "group-hover:text-cyan",
  magenta: "group-hover:text-magenta",
  purple: "group-hover:text-purple",
  orange: "group-hover:text-orange",
};

const STATUS_TONE: Record<Status, string> = {
  shipped: "var(--ok)",
  "in-progress": "var(--wip)",
  prototype: "var(--proto)",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.12em] uppercase text-muted-3 whitespace-nowrap">
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ background: STATUS_TONE[status] }}
      />
      {STATUS_LABEL[status]}
    </span>
  );
}

/**
 * Stack chips. Entries in `signature` render in the project accent; the rest
 * stay muted.
 */
export function StackChips({
  items,
  signature = [],
  accent,
}: {
  items: string[];
  signature?: string[];
  accent: Accent;
}) {
  const sig = new Set(signature);
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isSig = sig.has(item);
        return (
          <span
            key={item}
            className={`text-xs border px-2 py-1 ${
              isSig
                ? `${ACCENT_TEXT[accent]} border-current`
                : "text-muted-5 border-border"
            }`}
          >
            {item}
          </span>
        );
      })}
    </div>
  );
}
