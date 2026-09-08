import type { Accent, CaseStudy, Status } from "./types";
import iiot from "./industrial-iot-platform";

export type { CaseStudy, OtherWork } from "./types";
export { otherWork } from "./other-work";

// Ordered registry. Strongest / most-documented first; shipped before
// prototype. See docs/adr/0003-landing-projects-section.md for the landing
// section's use of this order.
export const caseStudies: CaseStudy[] = [
  iiot,
  // yourspot,   — issue tracker: "Build: YourSpot case study"
  // softskills,  — "Build: SoftSkills case study"
  // urvox,       — "Build: Urvox case study"
];

export const caseStudySlugs: string[] = caseStudies.map((c) => c.slug);

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}

// The subset the landing section renders. Derived — never duplicated.
export interface LandingCard {
  slug: string;
  name: string;
  tagline: string;
  accent: Accent;
  status: Status;
  role: string;
  blurb: string;
  stack: string[];
  signatureStack: string[];
}

export const landingCards: LandingCard[] = caseStudies.map((c) => ({
  slug: c.slug,
  name: c.name,
  tagline: c.tagline,
  accent: c.accent,
  status: c.status,
  role: c.role,
  blurb: c.card.blurb,
  stack: c.card.stack,
  signatureStack: c.card.signatureStack,
}));
