import SectionLabel from "../../components/SectionLabel";
import TagGroupGrid from "../../components/TagGroupGrid";
import { skillGroups } from "../../_data/skills";

export default function AboutSkills({ n }: { n?: string }) {
  return (
    <section className="px-6 md:px-16 py-20">
      <SectionLabel n={n} title="skills" />
      <TagGroupGrid groups={skillGroups.map((g) => ({ label: g.category, items: g.items }))} />
    </section>
  );
}
