import Link from "next/link";
import type { CaseStudy } from "../_data/types";
import { caseStudies } from "../_data";
import StatusBadge from "./StatusBadge";
import {
  ACCENT_CHIP,
  ACCENT_GROUP_HOVER_TEXT,
  ACCENT_HOVER_BORDER,
} from "./accents";

function StackChips({ study }: { study: CaseStudy }) {
  const signature = new Set(study.card.signatureStack);
  return (
    <div className="flex flex-wrap gap-2">
      {study.card.stack.map((tech) => (
        <span
          key={tech}
          className={`text-xs border px-2 py-1 ${
            signature.has(tech)
              ? ACCENT_CHIP[study.accent]
              : "border-border text-muted-5"
          }`}
        >
          {tech}
        </span>
      ))}
    </div>
  );
}

function ReadLink({ study }: { study: CaseStudy }) {
  return (
    <span
      className={`text-xs tracking-widest uppercase text-muted-5 transition-colors ${
        ACCENT_GROUP_HOVER_TEXT[study.accent]
      }`}
    >
      Read case study →
    </span>
  );
}

function FeaturedCard({ study }: { study: CaseStudy }) {
  return (
    <Link
      href={`/projects/${study.slug}`}
      className={`group block bg-surface border border-border ${
        ACCENT_HOVER_BORDER[study.accent]
      } transition-colors`}
    >
      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr]">
        {study.card.featuredImage && (
          <div className="bg-grid border-b md:border-b-0 md:border-r border-border overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={study.card.featuredImage}
              alt={`${study.name} — product screenshot`}
              className="w-full h-full object-cover block"
            />
          </div>
        )}
        <div className="p-6 md:p-8 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h3
              className={`font-bold text-lg md:text-xl transition-colors ${
                ACCENT_GROUP_HOVER_TEXT[study.accent]
              }`}
            >
              {study.name}
            </h3>
            <StatusBadge status={study.status} />
          </div>
          <p className="text-muted-3 text-sm leading-relaxed">
            {study.card.blurb}
          </p>
          <StackChips study={study} />
          <ReadLink study={study} />
        </div>
      </div>
    </Link>
  );
}

function RowCard({ study }: { study: CaseStudy }) {
  return (
    <Link
      href={`/projects/${study.slug}`}
      className={`group flex flex-col gap-4 bg-surface p-6 border border-border ${
        ACCENT_HOVER_BORDER[study.accent]
      } transition-colors`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3
          className={`font-bold text-base transition-colors ${
            ACCENT_GROUP_HOVER_TEXT[study.accent]
          }`}
        >
          {study.name}
        </h3>
        <StatusBadge status={study.status} />
      </div>
      <p className="text-muted-3 text-sm leading-relaxed flex-1">
        {study.card.blurb}
      </p>
      <StackChips study={study} />
      <ReadLink study={study} />
    </Link>
  );
}

// Featured first case study + a row of the rest. Order is the registry's
// (docs/adr/0003-landing-projects-section.md).
export default function ProjectCards() {
  const [featured, ...rest] = caseStudies;
  return (
    <div className="space-y-px">
      <FeaturedCard study={featured} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-grid">
        {rest.map((study) => (
          <RowCard key={study.slug} study={study} />
        ))}
      </div>
    </div>
  );
}
