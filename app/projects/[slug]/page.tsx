import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { caseStudySlugs, getCaseStudy } from "../_data";
import CaseStudyPage from "../_components/CaseStudyPage";

export function generateStaticParams(): { slug: string }[] {
  return caseStudySlugs.map((slug) => ({ slug }));
}

// Only the case studies in the registry are valid routes.
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return {};
  return {
    title: `${study.name} — Nuno Santos`,
    description: study.metaDescription,
  };
}

export default async function Page({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();
  return <CaseStudyPage study={study} />;
}
