import type { StackLayer } from "../_data/types";
import SectionLabel from "./SectionLabel";

export default function CaseStack({
  n,
  layers,
}: {
  n?: string;
  layers: StackLayer[];
}) {
  return (
    <section className="px-6 md:px-16 py-20 border-b border-border">
      <SectionLabel n={n} title="stack by layer" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {layers.map((s) => (
          <div key={s.layer}>
            <p className="text-muted-4 text-xs tracking-widest uppercase mb-3">
              {s.layer}
            </p>
            <div className="flex flex-wrap gap-2">
              {s.items.map((it) => (
                <span
                  key={it}
                  className="text-xs border border-border px-2 py-1 text-muted-3"
                >
                  {it}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
