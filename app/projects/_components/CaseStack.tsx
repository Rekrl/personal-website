import type { StackLayer } from "../_data/types";
import SectionLabel from "../../components/SectionLabel";
import TagGroupGrid from "../../components/TagGroupGrid";

export default function CaseStack({
  n,
  layers,
}: {
  n?: string;
  layers: StackLayer[];
}) {
  return (
    <section className="px-6 md:px-16 py-20 border-b border-border">
      <SectionLabel n={n} title="stack by layer" />
      <TagGroupGrid groups={layers.map((s) => ({ label: s.layer, items: s.items }))} />
    </section>
  );
}
