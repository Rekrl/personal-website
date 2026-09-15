import SiteNav from "../../components/SiteNav";
import SiteFooter from "../../components/SiteFooter";
import type { CaseStudy } from "../_data/types";
import CaseHero from "./CaseHero";
import CaseOverview from "./CaseOverview";
import CaseArchitecture from "./CaseArchitecture";
import CaseDecisions from "./CaseDecisions";
import CaseStack from "./CaseStack";
import CaseStats from "./CaseStats";
import CaseReality from "./CaseReality";
import CaseMedia from "./CaseMedia";
import CaseCta from "./CaseCta";

// Fixed section order; optional sections are simply absent. The hero and CTA
// aren't numbered; the numbered content sections count up in order.
// See docs/adr/0001-case-study-content-model.md.
export default function CaseStudyPage({ study }: { study: CaseStudy }) {
  const hasStats = Boolean(study.stats && study.stats.length > 0);
  const hasReality = Boolean(study.reality && study.reality.rows.length > 0);
  const hasMedia = Boolean(study.media && study.media.length > 0);

  const numbered = [
    "overview",
    "architecture",
    "decisions",
    "stack",
    ...(hasStats ? ["stats"] : []),
    ...(hasReality ? ["reality"] : []),
    ...(hasMedia ? ["media"] : []),
  ];
  const n = (key: string) => {
    const i = numbered.indexOf(key);
    return i === -1 ? undefined : String(i + 1).padStart(2, "0");
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-mono">
      <SiteNav label="case study" />

      <CaseHero study={study} />
      <CaseOverview n={n("overview")} paragraphs={study.overview} />
      <CaseArchitecture
        n={n("architecture")}
        slug={study.slug}
        architecture={study.architecture}
      />
      <CaseDecisions
        n={n("decisions")}
        decisions={study.decisions}
        accent={study.accent}
      />
      <CaseStack n={n("stack")} layers={study.stack} />
      {hasStats && (
        <CaseStats
          n={n("stats")}
          stats={study.stats!}
          note={study.statsNote}
          accent={study.accent}
        />
      )}
      {hasReality && (
        <CaseReality n={n("reality")} reality={study.reality!} accent={study.accent} />
      )}
      {hasMedia && <CaseMedia n={n("media")} media={study.media!} />}
      <CaseCta blurb={study.cta.blurb} links={study.links} />

      <SiteFooter />
    </main>
  );
}
