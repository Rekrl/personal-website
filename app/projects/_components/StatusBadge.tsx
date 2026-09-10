import type { Status } from "../_data/types";

const LABEL: Record<Status, string> = {
  shipped: "shipped",
  "in-progress": "in progress",
  prototype: "prototype",
};

const TONE: Record<Status, string> = {
  shipped: "var(--ok)",
  "in-progress": "var(--wip)",
  prototype: "var(--proto)",
};

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.12em] uppercase text-muted-3 whitespace-nowrap">
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ background: TONE[status] }}
      />
      {LABEL[status]}
    </span>
  );
}
