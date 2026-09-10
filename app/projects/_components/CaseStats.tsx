import type { Accent, Stat } from "../_data/types";
import { ACCENT_TEXT, ACCENT_HOVER_BORDER } from "./accents";
import SectionLabel from "./SectionLabel";

export default function CaseStats({
  n,
  stats,
  note,
  accent,
}: {
  n?: string;
  stats: Stat[];
  note?: string;
  accent: Accent;
}) {
  return (
    <section className="px-6 md:px-16 py-20 border-b border-border">
      <SectionLabel n={n} title="by the numbers" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-grid">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`bg-surface p-5 border border-border ${ACCENT_HOVER_BORDER[accent]} transition-colors`}
          >
            <p className={`text-2xl md:text-3xl font-bold mb-1 ${ACCENT_TEXT[accent]}`}>
              {s.value}
            </p>
            <p className="text-muted-4 text-xs leading-snug uppercase tracking-wide">
              {s.label}
            </p>
          </div>
        ))}
      </div>
      {note && (
        <p className="text-muted-4 text-sm mt-6 max-w-3xl leading-relaxed">{note}</p>
      )}
    </section>
  );
}
