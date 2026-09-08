import Link from "next/link";
import ThemeToggle from "../../components/ThemeToggle";
import type { CaseStudy } from "../_data/types";
import { ACCENT_TEXT, ACCENT_HOVER_BORDER, StatusBadge } from "./parts";
import CaseArchitecture from "./CaseArchitecture";

function SectionLabel({ n, title }: { n?: string; title: string }) {
  return (
    <p className="text-muted-5 text-xs tracking-[0.3em] mb-8 uppercase">
      {n ? `${n} / ` : ""}
      {title}
    </p>
  );
}

export default function CaseStudyPage({ study }: { study: CaseStudy }) {
  const accentText = ACCENT_TEXT[study.accent];

  // Fixed section order; optional sections just absent. Numbering skips the
  // hero and CTA and counts only the numbered content sections that exist.
  const numbered: string[] = ["overview", "architecture", "decisions", "stack"];
  if (study.stats) numbered.push("stats");
  if (study.reality) numbered.push("reality");
  if (study.media && study.media.length > 0) numbered.push("media");
  const num = (key: string) => {
    const i = numbered.indexOf(key);
    return i === -1 ? undefined : String(i + 1).padStart(2, "0");
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-mono">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 px-6 md:px-16 py-4 flex items-center justify-between border-b border-border bg-nav backdrop-blur-sm">
        <Link
          href="/"
          className="text-muted-3 hover:text-cyan transition-colors text-sm tracking-widest uppercase"
        >
          ← nuno santos
        </Link>
        <div className="flex items-center gap-6">
          <span className="text-cyan font-bold text-sm tracking-widest uppercase hidden sm:inline">
            case study
          </span>
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-16 pt-32 pb-16 border-b border-border">
        <div className="flex items-center gap-4 mb-6">
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
                className={`px-6 py-3 border border-cyan text-cyan hover:bg-cyan hover:text-on-accent transition-all text-xs tracking-widest uppercase`}
              >
                {l.label}
              </a>
            ))}
          </div>
        ) : (
          <p className="text-muted-6 text-xs mt-8 tracking-wide">
            Private project — no public repository.
          </p>
        )}
      </section>

      {/* Overview */}
      <section className="px-6 md:px-16 py-20 max-w-4xl border-b border-border">
        <SectionLabel n={num("overview")} title="overview" />
        <div className="space-y-5 text-muted-2 leading-relaxed">
          {study.overview.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* Architecture */}
      <section className="px-6 md:px-16 py-20 border-b border-border">
        <SectionLabel n={num("architecture")} title="architecture" />
        <div className="space-y-5 text-muted-2 leading-relaxed max-w-3xl mb-10">
          {study.architecture.intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="space-y-12">
          {study.architecture.figures.map((fig, i) => (
            <figure key={i} className="m-0">
              <div className="bg-surface border border-border p-5 md:p-8">
                <CaseArchitecture spec={fig.diagram} idPrefix={`${study.slug}-fig${i}`} />
              </div>
              <figcaption className="text-muted-4 text-sm mt-3 max-w-3xl leading-relaxed">
                {fig.caption}
              </figcaption>
            </figure>
          ))}
        </div>
        {study.architecture.notes && study.architecture.notes.length > 0 && (
          <div className="mt-8 space-y-2 max-w-3xl">
            {study.architecture.notes.map((n, i) => (
              <p key={i} className="text-muted-4 text-sm leading-relaxed">
                {n}
              </p>
            ))}
          </div>
        )}
      </section>

      {/* Decisions */}
      <section className="px-6 md:px-16 py-20 border-b border-border">
        <SectionLabel n={num("decisions")} title="architectural decisions" />
        <p className="text-muted-2 leading-relaxed max-w-3xl mb-10">
          The product surface is the least interesting part of this project. What
          mattered was the set of tradeoffs made to keep the system extensible,
          correct, and honest about its own limits.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-grid">
          {study.decisions.map((d) => (
            <div key={d.title} className="bg-surface p-6 border border-border">
              <p className={`text-xs tracking-widest uppercase mb-3 ${accentText}`}>
                {d.tag}
              </p>
              <h3 className="font-bold text-base mb-3">{d.title}</h3>
              <p className="text-muted-2 text-sm leading-relaxed mb-3">
                {d.decision}
              </p>
              <p className="text-muted-4 text-sm leading-relaxed">
                <span className="text-muted-3">Why: </span>
                {d.why}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stack */}
      <section className="px-6 md:px-16 py-20 border-b border-border">
        <SectionLabel n={num("stack")} title="stack by layer" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {study.stack.map((s) => (
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

      {/* Stats */}
      {study.stats && study.stats.length > 0 && (
        <section className="px-6 md:px-16 py-20 border-b border-border">
          <SectionLabel n={num("stats")} title="by the numbers" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-grid">
            {study.stats.map((s) => (
              <div
                key={s.label}
                className={`bg-surface p-5 border border-border ${ACCENT_HOVER_BORDER[study.accent]} transition-colors`}
              >
                <p className={`text-2xl md:text-3xl font-bold mb-1 ${accentText}`}>
                  {s.value}
                </p>
                <p className="text-muted-4 text-xs leading-snug uppercase tracking-wide">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
          {study.statsNote && (
            <p className="text-muted-4 text-sm mt-6 max-w-3xl leading-relaxed">
              {study.statsNote}
            </p>
          )}
        </section>
      )}

      {/* Reality — what's real vs. simulated / built vs. spec */}
      {study.reality && study.reality.rows.length > 0 && (
        <section className="px-6 md:px-16 py-20 border-b border-border">
          <SectionLabel n={num("reality")} title="what's real" />
          {study.reality.intro && (
            <p className="text-muted-2 leading-relaxed max-w-3xl mb-10">
              {study.reality.intro}
            </p>
          )}
          <div className="grid grid-cols-1 gap-px bg-grid max-w-4xl">
            {study.reality.rows.map((r) => (
              <div
                key={r.claim}
                className="bg-surface p-6 border border-border grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-2 md:gap-6"
              >
                <p className="text-muted-3 text-sm leading-relaxed">
                  <span className={accentText}>“</span>
                  {r.claim}
                  <span className={accentText}>”</span>
                </p>
                <p className="text-muted-2 text-sm leading-relaxed">{r.reality}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Media */}
      {study.media && study.media.length > 0 && (
        <section className="px-6 md:px-16 py-20 border-b border-border">
          <SectionLabel n={num("media")} title="in motion" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {study.media.map((m, i) => (
              <figure key={i} className="m-0">
                <div className="bg-surface border border-border overflow-hidden">
                  {m.kind === "image" && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.src} alt={m.caption} className="w-full block" />
                  )}
                  {m.kind === "video" && (
                    <video
                      src={m.src}
                      poster={m.poster}
                      muted
                      loop
                      autoPlay
                      playsInline
                      className="w-full block"
                    />
                  )}
                  {m.kind === "youtube" && (
                    <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${m.src}`}
                        title={m.caption}
                        loading="lazy"
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full border-0"
                      />
                    </div>
                  )}
                </div>
                <figcaption className="text-muted-4 text-sm mt-3 leading-relaxed">
                  {m.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-6 md:px-16 py-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <p className="text-muted-3 text-sm max-w-md">{study.cta.blurb}</p>
        <div className="flex gap-4">
          <Link
            href="/#projects"
            className="px-6 py-3 border border-border-strong text-muted-3 hover:border-magenta hover:text-magenta transition-all text-xs tracking-widest uppercase"
          >
            ← all projects
          </Link>
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
      </section>

      <footer className="px-6 md:px-16 py-6 border-t border-border text-muted-6 text-xs flex justify-between">
        <span>Nuno Santos · 2026</span>
        <span>Built with Next.js + TypeScript</span>
      </footer>
    </main>
  );
}
