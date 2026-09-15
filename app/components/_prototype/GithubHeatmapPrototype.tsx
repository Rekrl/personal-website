"use client";

// PROTOTYPE for wayfinder ticket #20 ("Prototype and place the GitHub
// activity heatmap"). Throwaway: not meant to reach main as-is. The
// real data-sourcing mechanics (GitHub GraphQL contributionsCollection,
// server-side, cached Route Handler) were already decided in ticket #19
// and are OUT OF SCOPE here — this only prototypes mocked-data visuals
// and placement. Variants, switchable via `?variant=A|B|C|D`:
//
//   A — Compact strip inside the existing "03 / stack" section.
//   B — Its own dedicated homepage section, full year + legend.
//   C — Rough About/CV-page-style card (NOT ticket #22's real design,
//       just a stand-in context to judge fit outside the homepage flow).
//   D — Leading candidate per feedback: B's full-year visual density,
//       inside the stack section (A's placement).

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type VariantKey = "A" | "B" | "C" | "D";

const VARIANTS: Record<VariantKey, string> = {
  A: "Compact, in stack",
  B: "Dedicated section",
  C: "About/CV-style card",
  D: "Full year, in stack",
};

interface Week {
  days: number[]; // 0-4 intensity, Sun..Sat
}

function generateMockWeeks(weekCount: number): { weeks: Week[]; total: number } {
  // Deterministic pseudo-random so the mock looks the same every load.
  let seed = 42;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed % 1000) / 1000;
  };

  let total = 0;
  const weeks: Week[] = Array.from({ length: weekCount }, () => {
    const days = Array.from({ length: 7 }, () => {
      const r = rand();
      let level: number;
      if (r > 0.55) level = 0;
      else if (r > 0.35) level = 1;
      else if (r > 0.2) level = 2;
      else if (r > 0.08) level = 3;
      else level = 4;
      total += level;
      return level;
    });
    return { days };
  });

  return { weeks, total };
}

const LEVEL_OPACITY = [0.08, 0.3, 0.5, 0.75, 1];

function HeatmapGrid({
  weeks,
  cellSize = 11,
  gap = 3,
}: {
  weeks: Week[];
  cellSize?: number;
  gap?: number;
}) {
  return (
    <div
      className="inline-grid"
      style={{
        gridTemplateColumns: `repeat(${weeks.length}, ${cellSize}px)`,
        gap: `${gap}px`,
      }}
    >
      {weeks.map((week, wi) => (
        <div
          key={wi}
          className="grid"
          style={{ gridTemplateRows: `repeat(7, ${cellSize}px)`, gap: `${gap}px` }}
        >
          {week.days.map((level, di) => (
            <div
              key={di}
              title={`${level} contributions (mock)`}
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: "var(--accent-cyan)",
                opacity: LEVEL_OPACITY[level],
                borderRadius: 2,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function HeatmapLegend({ total }: { total: number }) {
  return (
    <div className="flex items-center gap-2 text-[10px] text-muted-4 mt-2">
      <span>{total} contributions (mock data)</span>
      <span className="ml-auto flex items-center gap-1">
        Less
        {LEVEL_OPACITY.map((op, i) => (
          <span
            key={i}
            className="w-[10px] h-[10px] rounded-[2px]"
            style={{ backgroundColor: "var(--accent-cyan)", opacity: op }}
          />
        ))}
        More
      </span>
    </div>
  );
}

const stack = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "FastAPI",
  "PHP",
  "Python",
  "C/C++",
  "PostgreSQL",
  "MongoDB",
  "InfluxDB",
  "MySQL",
  "Docker",
  "Git",
  "MQTT",
  "ESP32",
  "Linux",
];

function VariantA({ weeks, total }: { weeks: Week[]; total: number }) {
  // Condensed: fewer weeks so it fits without horizontal scroll even
  // at phone width, sitting directly under the stack tag cloud.
  const compact = weeks.slice(-18);
  return (
    <div className="mt-10 pt-6 border-t border-border">
      <p className="text-muted-5 text-[10px] tracking-[0.3em] mb-3 uppercase">
        github activity
      </p>
      <div className="overflow-x-auto">
        <HeatmapGrid weeks={compact} cellSize={10} gap={2} />
      </div>
      <HeatmapLegend total={total} />
    </div>
  );
}

function VariantD({ weeks, total }: { weeks: Week[]; total: number }) {
  // B's full-year density + legend, but positioned inside the stack
  // section (per feedback: liked B's visual, wanted A's placement).
  return (
    <div className="mt-10 pt-6 border-t border-border">
      <p className="text-muted-5 text-[10px] tracking-[0.3em] mb-3 uppercase">
        github activity
      </p>
      <div className="overflow-x-auto pb-2">
        <HeatmapGrid weeks={weeks} cellSize={10} gap={2} />
      </div>
      <HeatmapLegend total={total} />
    </div>
  );
}

function VariantB({ weeks, total }: { weeks: Week[]; total: number }) {
  return (
    <section className="px-6 md:px-16 py-24 border-t border-border">
      <p className="text-muted-5 text-xs tracking-[0.3em] mb-8 uppercase">
        04 / activity
      </p>
      <div className="overflow-x-auto pb-2">
        <HeatmapGrid weeks={weeks} />
      </div>
      <HeatmapLegend total={total} />
    </section>
  );
}

function VariantC({ weeks, total }: { weeks: Week[]; total: number }) {
  const compact = weeks.slice(-26);
  return (
    <div className="min-h-screen px-6 py-24 max-w-2xl mx-auto">
      <p className="text-muted-5 text-[10px] tracking-[0.3em] mb-6 uppercase">
        rough about/cv-style stand-in — NOT ticket #22&apos;s real design
      </p>
      <div className="border border-border p-6 font-mono text-sm">
        <p className="text-cyan mb-4">nuno@portfolio ~ neofetch</p>
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-muted-3 text-xs mb-6">
          <span className="text-muted-5">role</span>
          <span>Full-Stack Developer</span>
          <span className="text-muted-5">stack</span>
          <span>TS · Next.js · Python</span>
          <span className="text-muted-5">side quest</span>
          <span>Basketball</span>
        </div>
        <p className="text-muted-5 text-[10px] tracking-[0.3em] mb-3 uppercase">
          activity
        </p>
        <div className="overflow-x-auto">
          <HeatmapGrid weeks={compact} cellSize={9} gap={2} />
        </div>
        <HeatmapLegend total={total} />
      </div>
    </div>
  );
}

// Defaults to D (the decided winner) so a cold load of this reference
// artifact shows the outcome, not the first thing that was tried.
function useActiveVariant(): VariantKey {
  const searchParams = useSearchParams();
  const requested = searchParams.get("variant");
  return requested === "A" || requested === "B" || requested === "C" || requested === "D"
    ? requested
    : "D";
}

// Mount inside the existing "03 / stack" section, right after the tag
// cloud. Renders only for variant A or D; null otherwise.
export function GithubHeatmapStackSlot() {
  const activeVariant = useActiveVariant();
  const { weeks, total } = useMemo(() => generateMockWeeks(53), []);
  if (activeVariant === "D") return <VariantD weeks={weeks} total={total} />;
  if (activeVariant !== "A") return null;
  return <VariantA weeks={weeks} total={total} />;
}

// Mount once, after the stack section (before contact). Renders
// variant B/C content plus the dev-only switcher (so the switcher is
// reachable regardless of which variant is active).
export function GithubHeatmapStandalone() {
  const router = useRouter();
  const activeVariant = useActiveVariant();
  const { weeks, total } = useMemo(() => generateMockWeeks(53), []);

  return (
    <>
      {activeVariant === "B" && <VariantB weeks={weeks} total={total} />}
      {activeVariant === "C" && <VariantC weeks={weeks} total={total} />}

      {process.env.NODE_ENV !== "production" && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-3 rounded-full border border-border-strong bg-background/90 backdrop-blur px-4 py-2 text-xs shadow-lg">
          {(Object.keys(VARIANTS) as VariantKey[]).map((key) => (
            <button
              key={key}
              onClick={() => router.replace(`?variant=${key}`)}
              className={`px-2 py-1 rounded-full transition-colors ${
                activeVariant === key
                  ? "bg-cyan text-on-accent"
                  : "text-muted-3 hover:text-cyan"
              }`}
            >
              {key}
            </button>
          ))}
          <span className="text-muted-4 hidden sm:inline">
            {VARIANTS[activeVariant]}
          </span>
        </div>
      )}
    </>
  );
}
