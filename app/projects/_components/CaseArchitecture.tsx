import type { CaseStudy } from "../_data/types";
import SectionLabel from "./SectionLabel";
import ArchitectureDiagram from "./ArchitectureDiagram";

export default function CaseArchitecture({
  n,
  slug,
  architecture,
}: {
  n?: string;
  slug: string;
  architecture: CaseStudy["architecture"];
}) {
  return (
    <section className="px-6 md:px-16 py-20 border-b border-border">
      <SectionLabel n={n} title="architecture" />
      <div className="space-y-5 text-muted-2 leading-relaxed max-w-3xl mb-10">
        {architecture.intro.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="space-y-12">
        {architecture.figures.map((fig, i) => (
          <figure key={i} className="m-0">
            <div className="bg-surface border border-border p-5 md:p-8">
              <ArchitectureDiagram spec={fig.diagram} idPrefix={`${slug}-fig${i}`} />
            </div>
            <figcaption className="text-muted-4 text-sm mt-3 max-w-3xl leading-relaxed">
              {fig.caption}
            </figcaption>
            {fig.ascii && (
              <details className="mt-2 max-w-3xl">
                <summary className="text-muted-5 text-xs tracking-widest uppercase cursor-pointer hover:text-cyan transition-colors">
                  view as text
                </summary>
                <pre className="mt-2 text-muted-3 text-xs leading-relaxed overflow-x-auto border border-border p-4 bg-surface">
                  {fig.ascii}
                </pre>
              </details>
            )}
          </figure>
        ))}
      </div>

      {architecture.notes && architecture.notes.length > 0 && (
        <div className="mt-8 space-y-2 max-w-3xl">
          {architecture.notes.map((note, i) => (
            <p key={i} className="text-muted-4 text-sm leading-relaxed">
              {note}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
