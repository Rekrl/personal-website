import SectionLabel from "./SectionLabel";

export default function CaseOverview({
  n,
  paragraphs,
}: {
  n?: string;
  paragraphs: string[];
}) {
  return (
    <section className="px-6 md:px-16 py-20 max-w-4xl border-b border-border">
      <SectionLabel n={n} title="overview" />
      <div className="space-y-5 text-muted-2 leading-relaxed">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </section>
  );
}
