import SectionLabel from "../../components/SectionLabel";
import { CV_ATS_PDF, CV_ATS_TXT, CV_PDF } from "../../_data/cv";

export default function AboutCv({ n }: { n?: string }) {
  return (
    <section className="px-6 md:px-16 py-20 border-b border-border">
      <SectionLabel n={n} title="cv" />
      <div className="flex flex-wrap gap-3 items-center">
        <a
          href={CV_PDF}
          className="px-5 py-2.5 border border-cyan text-cyan hover:bg-cyan hover:text-on-accent transition-all text-xs tracking-widest uppercase"
        >
          Download CV
        </a>
        <a
          href={CV_ATS_PDF}
          className="px-5 py-2.5 border border-border-strong text-muted-3 hover:border-magenta hover:text-magenta transition-all text-xs tracking-widest uppercase"
        >
          ATS / plain-text (PDF)
        </a>
        <a href={CV_ATS_TXT} className="text-xs text-muted-5 hover:text-magenta underline">
          .txt
        </a>
      </div>
    </section>
  );
}
