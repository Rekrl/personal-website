import Link from "next/link";
import type { CaseLink } from "../_data/types";

export default function CaseCta({
  blurb,
  links,
}: {
  blurb: string;
  links: CaseLink[];
}) {
  return (
    <section className="px-6 md:px-16 py-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
      <p className="text-muted-3 text-sm max-w-md">{blurb}</p>
      <div className="flex gap-4">
        <Link
          href="/#projects"
          className="px-6 py-3 border border-border-strong text-muted-3 hover:border-magenta hover:text-magenta transition-all text-xs tracking-widest uppercase"
        >
          ← all projects
        </Link>
        {links.map((l) => (
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
  );
}
