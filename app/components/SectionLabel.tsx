export default function SectionLabel({ n, title }: { n?: string; title: string }) {
  return (
    <p className="text-muted-5 text-xs tracking-[0.3em] mb-8 uppercase">
      {n ? `${n} / ` : ""}
      {title}
    </p>
  );
}
