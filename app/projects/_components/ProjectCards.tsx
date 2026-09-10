import Link from "next/link";
import type { Accent, CaseCard, CaseStudy, Status } from "../_data/types";
import { caseStudies } from "../_data";
import StatusBadge from "./StatusBadge";
import {
  ACCENT_CHIP,
  ACCENT_GROUP_HOVER_TEXT,
  ACCENT_HOVER_BORDER,
} from "./accents";

function StackChips({ card, accent }: { card: CaseCard; accent: Accent }) {
  const signature = new Set(card.signatureStack);
  return (
    <div className="flex flex-wrap gap-2">
      {card.stack.map((tech) => (
        <span
          key={tech}
          className={`text-xs border px-2 py-1 ${
            signature.has(tech)
              ? ACCENT_CHIP[accent]
              : "border-border text-muted-5"
          }`}
        >
          {tech}
        </span>
      ))}
    </div>
  );
}

// The card's inner column — shared by the featured card and the row cards;
// only the title size differs.
function CardBody({
  name,
  status,
  card,
  accent,
  titleClass,
}: {
  name: string;
  status: Status;
  card: CaseCard;
  accent: Accent;
  titleClass: string;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3
          className={`font-bold transition-colors ${titleClass} ${
            ACCENT_GROUP_HOVER_TEXT[accent]
          }`}
        >
          {name}
        </h3>
        <StatusBadge status={status} />
      </div>
      <p className="text-muted-3 text-sm leading-relaxed flex-1">{card.blurb}</p>
      <StackChips card={card} accent={accent} />
      <span
        className={`text-xs tracking-widest uppercase text-muted-5 transition-colors ${
          ACCENT_GROUP_HOVER_TEXT[accent]
        }`}
      >
        Read case study →
      </span>
    </>
  );
}

function Card({ study, featured }: { study: CaseStudy; featured?: boolean }) {
  const body = (
    <CardBody
      name={study.name}
      status={study.status}
      card={study.card}
      accent={study.accent}
      titleClass={featured ? "text-lg md:text-xl" : "text-base"}
    />
  );

  if (featured && study.card.featuredImage) {
    return (
      <Link
        href={`/projects/${study.slug}`}
        aria-label={`${study.name} case study`}
        className={`group block bg-surface border border-border ${
          ACCENT_HOVER_BORDER[study.accent]
        } transition-colors`}
      >
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr]">
          <div className="bg-grid border-b md:border-b-0 md:border-r border-border overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={study.card.featuredImage}
              alt={`${study.name} — product screenshot`}
              className="w-full h-full object-cover block"
            />
          </div>
          <div className="p-6 md:p-8 flex flex-col gap-4">{body}</div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/projects/${study.slug}`}
      aria-label={`${study.name} case study`}
      className={`group flex flex-col gap-4 bg-surface p-6 border border-border ${
        ACCENT_HOVER_BORDER[study.accent]
      } transition-colors`}
    >
      {body}
    </Link>
  );
}

// Featured first case study + a row of the rest. Order is the registry's
// (docs/adr/0003-landing-projects-section.md).
export default function ProjectCards() {
  const [featured, ...rest] = caseStudies;
  return (
    <div className="space-y-px">
      <Card study={featured} featured />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-grid">
        {rest.map((study) => (
          <Card key={study.slug} study={study} />
        ))}
      </div>
    </div>
  );
}
