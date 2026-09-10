import type { Accent, CaseStudy } from "../_data/types";
import { ACCENT_TEXT } from "./accents";
import SectionLabel from "./SectionLabel";

export default function CaseReality({
  n,
  reality,
  accent,
}: {
  n?: string;
  reality: NonNullable<CaseStudy["reality"]>;
  accent: Accent;
}) {
  const accentText = ACCENT_TEXT[accent];
  return (
    <section className="px-6 md:px-16 py-20 border-b border-border">
      <SectionLabel n={n} title="what's real" />
      {reality.intro && (
        <p className="text-muted-2 leading-relaxed max-w-3xl mb-10">{reality.intro}</p>
      )}
      <div className="grid grid-cols-1 gap-px bg-grid max-w-4xl">
        {reality.rows.map((r) => (
          <div
            key={r.claim}
            className="bg-surface p-6 border border-border grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-2 md:gap-6"
          >
            <p className="text-muted-3 text-sm leading-relaxed">
              <span className={accentText}>&ldquo;</span>
              {r.claim}
              <span className={accentText}>&rdquo;</span>
            </p>
            <p className="text-muted-2 text-sm leading-relaxed">{r.reality}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
