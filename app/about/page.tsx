import type { Metadata } from "next";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";
import AboutHero from "./_components/AboutHero";
import AboutTimeline from "./_components/AboutTimeline";
import AboutCv from "./_components/AboutCv";
import AboutSkills from "./_components/AboutSkills";
import { milestones } from "./_data";

export const metadata: Metadata = {
  title: "About — Nuno Santos",
  description:
    "More about Nuno Santos: background, timeline, skills and CV.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground font-mono">
      <SiteNav label="about" />

      <AboutHero />
      <AboutTimeline n="01" milestones={milestones} />
      <AboutCv n="02" />
      <AboutSkills n="03" />

      <SiteFooter />
    </main>
  );
}
