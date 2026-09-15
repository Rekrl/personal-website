"use client";

// PROTOTYPE for wayfinder ticket #22 ("Design the About/CV page content
// model"). Throwaway: not meant to reach main as-is, and not the real
// route (that's a future build session's job). Three structurally
// different variants, switchable via `?variant=A|B|C`:
//
//   A — "Neofetch-first": stats hero, then timeline, then skills as
//       category tag-groups, basketball as its own "branch" section,
//       two CV buttons side by side.
//   B — "CV-first, timeline-as-spine": CV downloads pinned near the
//       top, basketball folded into the timeline as one of its
//       entries, skills shown as "shipped in" project references.
//   C — "Dashboard split": two-column stats+skills on desktop
//       (stacks on mobile), basketball as an achievement card, skills
//       as a man-page/--help style flag list, CV as a format toggle.

import { useRouter, useSearchParams } from "next/navigation";
import ThemeToggle from "../../components/ThemeToggle";

type VariantKey = "A" | "B" | "C" | "D";

const VARIANTS: Record<VariantKey, string> = {
  A: "Neofetch-first",
  B: "CV-first / timeline spine",
  C: "Dashboard split",
  D: "Dashboard split + A's skills/CV",
};

const CV_PDF = "/cv/CV2026_NunoSantos.pdf";
const CV_ATS_PDF = "/cv/CV2026_NunoSantos-ats.pdf";
const CV_ATS_TXT = "/cv/CV2026_NunoSantos-ats.txt";

interface Milestone {
  hash: string;
  date: string;
  title: string;
  body: string;
  isSideQuest?: boolean;
}

const MILESTONES: Milestone[] = [
  {
    hash: "7e2a91f",
    date: "Feb 2026 – Jun 2026",
    title: "Software Engineering Intern — STAR Institute",
    body: "Built an end-to-end Industrial IoT platform: ESP32-S3 edge firmware, an MQTT-to-InfluxDB pipeline, a real-time dashboard, and a FastAPI anomaly-detection service.",
  },
  {
    hash: "5c10d4a",
    date: "2023 – 2026",
    title: "Computer Science and Engineering — Instituto Politécnico de Viseu",
    body: "Full-stack, systems and IoT coursework alongside internship and personal-project work.",
  },
  {
    hash: "3b88e02",
    date: "2023",
    title: "Professional Internship — Tek4You",
    body: "PC/laptop repair and in-store support; built and deployed the company's website with a product catalog and WhatsApp API integration.",
  },
  {
    hash: "9f4a17c",
    date: "2022 – 2023",
    title: "Technical Specialist, Mgmt. Informatics Applications (Level 5) — Cesae Digital",
    body: "",
  },
  {
    hash: "1d6e0b3",
    date: "2018 – present",
    title: "Side quest: competitive basketball",
    body: "5+ years of competitive basketball — deadlines and pressure are nothing new.",
    isSideQuest: true,
  },
  {
    hash: "0a2f9e1",
    date: "2018 – 2022",
    title: "Retail & Warehouse Operator — Jerónimo Martins, Pingo Doce",
    body: "",
  },
];

// Cross-checked against the homepage's `stack` list AND every shipped
// project's real stack (app/projects/_data/*.ts), not just the CV —
// picked up Tailwind CSS, NestJS, Prisma, Sequelize, AWS S3, Firebase,
// Linux and Git that the CV's own skills.yaml was missing.
const SKILL_GROUPS: { category: string; items: string[] }[] = [
  { category: "Languages", items: ["JavaScript", "TypeScript", "Python", "C/C++", "PHP", "Dart"] },
  { category: "Frontend", items: ["React", "Next.js", "Tailwind CSS", "Bootstrap", "Flutter"] },
  { category: "Backend", items: ["Node.js", "Express", "NestJS", "FastAPI", "Socket.io"] },
  { category: "Data & ORM", items: ["PostgreSQL", "MySQL", "MongoDB", "InfluxDB", "Prisma", "Sequelize"] },
  { category: "IoT / Embedded", items: ["ESP32-S3", "PlatformIO", "MQTT", "Modbus RTU/RS-485", "I2C"] },
  { category: "Cloud / DevOps", items: ["Docker", "AWS S3", "Firebase", "Linux", "Git"] },
];

const SHIPPED_IN: { skill: string; projects: string }[] = [
  { skill: "React", projects: "shipped in E-Learning Platform, YourSpot" },
  { skill: "Node.js", projects: "shipped in IIoT Trace, E-Learning Platform" },
  { skill: "FastAPI", projects: "shipped in IIoT Trace" },
  { skill: "ESP32-S3 / MQTT", projects: "shipped in IIoT Trace" },
  { skill: "Flutter", projects: "shipped in E-Learning Platform" },
  { skill: "PostgreSQL", projects: "shipped in YourSpot, E-Learning Platform" },
];

const MAN_PAGE_SKILLS: { flag: string; note: string }[] = [
  { flag: "--react", note: "production experience across 2 shipped projects" },
  { flag: "--nodejs", note: "primary backend runtime, 3+ projects" },
  { flag: "--python", note: "FastAPI services and data/anomaly pipelines" },
  { flag: "--cpp", note: "embedded firmware on ESP32-S3 (PlatformIO)" },
  { flag: "--flutter", note: "one shipped cross-platform mobile app" },
  { flag: "--sql", note: "PostgreSQL, MySQL — schema design and queries" },
];

function NavBack() {
  return (
    <div className="flex items-center justify-between">
      <a
        href="/"
        className="text-xs tracking-widest uppercase text-muted-3 hover:text-cyan transition-colors"
      >
        ← back home
      </a>
      <ThemeToggle />
    </div>
  );
}

function NeofetchBlock({ showShell = true }: { showShell?: boolean }) {
  return (
    <div className="border border-border p-6 font-mono text-sm max-w-md">
      <p className="text-cyan mb-3">nuno@portfolio</p>
      <div className="border-t border-border pt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
        <span className="text-muted-5">role</span>
        <span className="text-muted-2">Full-Stack &amp; IoT Developer</span>
        {showShell && (
          <>
            <span className="text-muted-5">shell</span>
            <span className="text-muted-2">React · Next.js · Node.js · Python · C++</span>
          </>
        )}
        <span className="text-muted-5">languages</span>
        <span className="text-muted-2">PT (native) · EN (C2) · FR (fluent)</span>
        <span className="text-muted-5">side_quest</span>
        <span className="text-muted-2">Basketball, 5+ yrs</span>
      </div>
    </div>
  );
}

function GitLogTimeline({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="font-mono text-sm space-y-6">
      {milestones.map((m) => (
        <div key={m.hash} className={m.isSideQuest ? "opacity-90" : undefined}>
          <p className="text-muted-5">
            commit <span className="text-cyan">{m.hash}</span>
            {m.isSideQuest && <span className="text-magenta"> (side-quest branch)</span>}
          </p>
          <p className="text-muted-5 text-xs mt-1">Date: {m.date}</p>
          <p className="mt-2 text-muted-1 font-bold">{m.title}</p>
          {m.body && <p className="mt-1 text-muted-3 text-xs leading-relaxed">{m.body}</p>}
        </div>
      ))}
    </div>
  );
}

function SkillsTagGroups({ layout = "stack" }: { layout?: "stack" | "grid" }) {
  return (
    <div className={layout === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
      {SKILL_GROUPS.map((g) => (
        <div key={g.category}>
          <p className="text-muted-5 text-[10px] tracking-[0.3em] mb-2 uppercase">{g.category}</p>
          <div className="flex flex-wrap gap-2">
            {g.items.map((item) => (
              <span
                key={item}
                className="border border-border px-2.5 py-1.5 text-xs text-muted-3"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SkillsShippedIn() {
  return (
    <div className="space-y-2 font-mono text-xs">
      {SHIPPED_IN.map((s) => (
        <div key={s.skill} className="flex flex-wrap gap-2">
          <span className="text-cyan">{s.skill}</span>
          <span className="text-muted-4">— {s.projects}</span>
        </div>
      ))}
    </div>
  );
}

function SkillsManPage() {
  return (
    <div className="font-mono text-xs space-y-1.5">
      {MAN_PAGE_SKILLS.map((s) => (
        <div key={s.flag} className="flex flex-wrap gap-3">
          <span className="text-cyan w-24 shrink-0">{s.flag}</span>
          <span className="text-muted-3">{s.note}</span>
        </div>
      ))}
    </div>
  );
}

function BasketballBranchTag() {
  return (
    <div className="border border-border px-4 py-3 font-mono text-xs">
      <span className="text-magenta">branch: </span>
      <span className="text-muted-2">side-quest/basketball</span>
      <p className="mt-2 text-muted-4">
        5+ years of competitive basketball — deadlines and pressure are nothing new.
      </p>
    </div>
  );
}

function BasketballAchievementCard() {
  return (
    <div className="border border-border-strong px-4 py-3">
      <p className="text-sm">
        <span className="mr-2">🏀</span>
        <span className="text-cyan">Achievement unlocked:</span>{" "}
        <span className="text-muted-2">competitive basketball, 5+ yrs</span>
      </p>
    </div>
  );
}

function CvButtonsSideBySide() {
  return (
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
  );
}

function CvPromoted() {
  return (
    <div className="border border-cyan/40 p-4">
      <a
        href={CV_PDF}
        className="inline-block px-5 py-2.5 border border-cyan text-cyan hover:bg-cyan hover:text-on-accent transition-all text-xs tracking-widest uppercase"
      >
        Download CV
      </a>
      <p className="mt-2 text-[11px] text-muted-5">
        Prefer plain text? <a href={CV_ATS_PDF} className="underline hover:text-cyan">.pdf</a>{" "}
        · <a href={CV_ATS_TXT} className="underline hover:text-cyan">.txt</a>
      </p>
    </div>
  );
}

function CvFormatToggle() {
  return (
    <div className="inline-flex border border-border text-xs">
      <a href={CV_PDF} className="px-3 py-2 border-r border-border hover:text-cyan">
        Visual
      </a>
      <a href={CV_ATS_PDF} className="px-3 py-2 border-r border-border hover:text-cyan">
        ATS PDF
      </a>
      <a href={CV_ATS_TXT} className="px-3 py-2 hover:text-cyan">
        ATS TXT
      </a>
    </div>
  );
}

function VariantA() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 space-y-14">
      <NavBack />
      <NeofetchBlock />
      <section>
        <p className="text-muted-5 text-xs tracking-[0.3em] mb-6 uppercase">timeline</p>
        <GitLogTimeline milestones={MILESTONES.filter((m) => !m.isSideQuest)} />
      </section>
      <section>
        <p className="text-muted-5 text-xs tracking-[0.3em] mb-6 uppercase">skills</p>
        <SkillsTagGroups />
      </section>
      <section>
        <p className="text-muted-5 text-xs tracking-[0.3em] mb-4 uppercase">side quest</p>
        <BasketballBranchTag />
      </section>
      <section>
        <p className="text-muted-5 text-xs tracking-[0.3em] mb-4 uppercase">cv</p>
        <CvButtonsSideBySide />
      </section>
    </div>
  );
}

function VariantB() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 space-y-12">
      <NavBack />
      <p className="text-lg text-muted-1 leading-relaxed">
        A passion for building things that mix software with the physical world —
        from IoT edge systems to full-stack web platforms.
      </p>
      <CvPromoted />
      <section>
        <p className="text-muted-5 text-xs tracking-[0.3em] mb-6 uppercase">timeline</p>
        <GitLogTimeline milestones={MILESTONES} />
      </section>
      <section>
        <p className="text-muted-5 text-xs tracking-[0.3em] mb-4 uppercase">skills</p>
        <SkillsShippedIn />
      </section>
    </div>
  );
}

function VariantC() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-14">
      <NavBack />
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <NeofetchBlock />
          <BasketballAchievementCard />
        </div>
        <div>
          <p className="text-muted-5 text-xs tracking-[0.3em] mb-4 uppercase">skills --help</p>
          <SkillsManPage />
        </div>
      </div>
      <section>
        <p className="text-muted-5 text-xs tracking-[0.3em] mb-6 uppercase">timeline</p>
        <GitLogTimeline milestones={MILESTONES.filter((m) => !m.isSideQuest)} />
      </section>
      <section>
        <p className="text-muted-5 text-xs tracking-[0.3em] mb-4 uppercase">cv</p>
        <CvFormatToggle />
      </section>
    </div>
  );
}

// Leading candidate per feedback (round 2): neofetch + basketball
// side by side in one row (not stacked in a half-width column, which
// left dead air under a shorter left column), timeline, CV, then
// skills last, full width, so the tag groups have room to breathe.
function VariantD() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-14">
      <NavBack />
      <div className="flex flex-wrap gap-6 items-start">
        <NeofetchBlock showShell={false} />
        <div className="flex-1 min-w-[220px]">
          <BasketballAchievementCard />
        </div>
      </div>
      <section>
        <p className="text-muted-5 text-xs tracking-[0.3em] mb-6 uppercase">timeline</p>
        <GitLogTimeline milestones={MILESTONES.filter((m) => !m.isSideQuest)} />
      </section>
      <section>
        <p className="text-muted-5 text-xs tracking-[0.3em] mb-4 uppercase">cv</p>
        <CvButtonsSideBySide />
      </section>
      <section>
        <p className="text-muted-5 text-xs tracking-[0.3em] mb-6 uppercase">skills</p>
        <SkillsTagGroups layout="grid" />
      </section>
    </div>
  );
}

export default function AboutCvPrototype() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requested = searchParams.get("variant");
  const activeVariant: VariantKey =
    requested === "A" || requested === "B" || requested === "C" || requested === "D"
      ? requested
      : "D";

  return (
    <main className="min-h-screen bg-background text-foreground font-mono">
      {activeVariant === "A" && <VariantA />}
      {activeVariant === "B" && <VariantB />}
      {activeVariant === "C" && <VariantC />}
      {activeVariant === "D" && <VariantD />}

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-3 rounded-full border border-border-strong bg-background/90 backdrop-blur px-4 py-2 text-xs shadow-lg">
        {(Object.keys(VARIANTS) as VariantKey[]).map((key) => (
          <button
            key={key}
            onClick={() => router.replace(`?variant=${key}`)}
            className={`px-2 py-1 rounded-full transition-colors ${
              activeVariant === key ? "bg-cyan text-on-accent" : "text-muted-3 hover:text-cyan"
            }`}
          >
            {key}
          </button>
        ))}
        <span className="text-muted-4 hidden sm:inline">{VARIANTS[activeVariant]}</span>
      </div>
    </main>
  );
}
