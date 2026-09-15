import SectionLabel from "../../components/SectionLabel";
import type { Milestone } from "../_data";

export default function AboutTimeline({
  n,
  milestones,
}: {
  n?: string;
  milestones: Milestone[];
}) {
  return (
    <section className="px-6 md:px-16 py-20 border-b border-border">
      <SectionLabel n={n} title="timeline" />
      <div className="font-mono text-sm space-y-6 max-w-2xl">
        {milestones.map((m) => (
          <div key={m.hash}>
            <p className="text-muted-5">
              commit <span className="text-cyan">{m.hash}</span>
            </p>
            <p className="text-muted-5 text-xs mt-1">Date: {m.date}</p>
            <p className="mt-2 text-muted-1 font-bold">{m.title}</p>
            {m.body && (
              <p className="mt-1 text-muted-3 text-xs leading-relaxed">{m.body}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
