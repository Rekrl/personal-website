import type { CaseStudy } from "../_data/types";
import StatusBadge from "./StatusBadge";

export default function CaseHero({ study }: { study: CaseStudy }) {
  return (
    <section className="px-6 md:px-16 pt-32 pb-16 border-b border-border">
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <StatusBadge status={study.status} />
        <span className="text-muted-6 text-xs">·</span>
        <span className="text-muted-5 text-xs tracking-[0.2em] uppercase">
          {study.role}
        </span>
      </div>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-none mb-4 uppercase">
        {study.name}
      </h1>
      <p className="text-lg md:text-xl text-muted-2 mb-6 max-w-3xl leading-relaxed">
        {study.tagline}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {study.card.stack.map((s) => (
          <span
            key={s}
            className="text-xs border border-border px-2 py-1 text-muted-4"
          >
            {s}
          </span>
        ))}
      </div>
      {study.links.length > 0 ? (
        <div className="flex flex-wrap gap-4 mt-8">
          {study.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-cyan text-cyan hover:bg-cyan hover:text-on-accent transition-all text-xs tracking-widest uppercase"
            >
              {l.label}
            </a>
          ))}
        </div>
      ) : (
        <p className="text-muted-6 text-xs mt-8 tracking-wide">
          {study.linksNote ?? "Private project — no public repository."}
        </p>
      )}
    </section>
  );
}
