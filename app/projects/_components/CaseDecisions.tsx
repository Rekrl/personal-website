import type { Accent, Decision } from "../_data/types";
import { ACCENT_TEXT } from "./accents";
import SectionLabel from "./SectionLabel";

export default function CaseDecisions({
  n,
  decisions,
  accent,
}: {
  n?: string;
  decisions: Decision[];
  accent: Accent;
}) {
  return (
    <section className="px-6 md:px-16 py-20 border-b border-border">
      <SectionLabel n={n} title="architectural decisions" />
      <p className="text-muted-2 leading-relaxed max-w-3xl mb-10">
        The product surface is the least interesting part of this project. What
        mattered was the set of tradeoffs made to keep the system extensible,
        correct, and honest about its own limits.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-grid">
        {decisions.map((d) => (
          <div key={d.title} className="bg-surface p-6 border border-border">
            <p className={`text-xs tracking-widest uppercase mb-3 ${ACCENT_TEXT[accent]}`}>
              {d.tag}
            </p>
            <h3 className="font-bold text-base mb-3">{d.title}</h3>
            <p className="text-muted-2 text-sm leading-relaxed mb-3">{d.decision}</p>
            <p className="text-muted-4 text-sm leading-relaxed">
              <span className="text-muted-3">Why: </span>
              {d.why}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
