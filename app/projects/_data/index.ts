import type { CaseStudy } from "./types";
import iiot from "./industrial-iot-platform";
import alojamentoLocalSaas from "./alojamento-local-saas";
import softskills from "./softskills";

export type { CaseStudy } from "./types";

// Ordered registry. Adding a case study is a data file plus an entry here.
// Order is strongest / most-documented first, shipped before prototype — the
// landing section reads it in this order.
export const caseStudies: CaseStudy[] = [
  iiot,
  alojamentoLocalSaas,
  softskills,
  // urvox — one build ticket on wayfinder map #1
];

export const caseStudySlugs: string[] = caseStudies.map((c) => c.slug);

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}
