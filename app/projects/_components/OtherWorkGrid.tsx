"use client";

import { useState } from "react";
import type { Accent } from "../_data/types";
import { otherWork } from "../_data/other-work";
import StatusBadge from "./StatusBadge";
import { ACCENT_HOVER_BORDER } from "./accents";

// "Also built" — smaller cards in the same idiom, each cycling through the
// project accents, that expand on click (no dedicated page, no repo to link).
// See docs/adr/0003-landing-projects-section.md.
const CYCLE: Accent[] = ["cyan", "magenta", "purple", "orange"];

export default function OtherWorkGrid() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {otherWork.map((work, i) => {
        const accent = CYCLE[i % CYCLE.length];
        const isOpen = open === i;
        return (
          <button
            key={work.name}
            type="button"
            aria-expanded={isOpen}
            aria-label={`${work.name} — ${isOpen ? "hide" : "show"} details`}
            onClick={() => setOpen(isOpen ? null : i)}
            className={`text-left flex flex-col gap-3 bg-surface p-5 border border-border ${
              ACCENT_HOVER_BORDER[accent]
            } transition-colors cursor-pointer`}
          >
            <div className="flex items-start justify-between gap-3">
              <h4 className="font-bold text-sm">{work.name}</h4>
              <StatusBadge status={work.status} />
            </div>
            <p className="text-muted-4 text-xs leading-relaxed">{work.blurb}</p>

            {isOpen && (
              <div className="space-y-2 border-t border-border pt-3">
                {work.expandedDetail.map((para, j) => (
                  <p key={j} className="text-muted-3 text-xs leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
              {work.stack.map((tech) => (
                <span
                  key={tech}
                  className="text-[10px] border border-border px-1.5 py-0.5 text-muted-5"
                >
                  {tech}
                </span>
              ))}
            </div>

            <span className="text-[10px] tracking-[0.18em] uppercase text-muted-6">
              {isOpen ? "less −" : "more +"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
