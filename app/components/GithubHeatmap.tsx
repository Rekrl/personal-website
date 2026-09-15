import { getContributionData } from "../_data/github-contributions";

// Variant D from ticket #20: full-year density + legend, inside the
// homepage's existing "03 / stack" section, horizontally scrollable so
// it stays safe at phone width. Server Component — fetched once (see
// app/_data/github-contributions.ts) and rendered with no client JS.
const LEVEL_OPACITY = [0.08, 0.3, 0.5, 0.75, 1];
const CELL_SIZE = 10;
const CELL_GAP = 2;

export default async function GithubHeatmap() {
  const data = await getContributionData();
  if (!data) return null;

  return (
    <div className="mt-10 pt-6 border-t border-border">
      <p className="text-muted-5 text-[10px] tracking-[0.3em] mb-3 uppercase">
        github activity
      </p>
      <div className="overflow-x-auto pb-2">
        <div
          role="img"
          aria-label={`GitHub contribution graph: ${data.total} contributions in the last year`}
          className="inline-grid"
          style={{
            gridTemplateColumns: `repeat(${data.weeks.length}, ${CELL_SIZE}px)`,
            gap: `${CELL_GAP}px`,
          }}
        >
          {data.weeks.map((week, wi) => (
            <div
              key={wi}
              aria-hidden="true"
              className="grid"
              style={{
                gridTemplateRows: `repeat(7, ${CELL_SIZE}px)`,
                gap: `${CELL_GAP}px`,
              }}
            >
              {Array.from({ length: 7 }, (_, weekday) => {
                const day = week.days.find((d) => d.weekday === weekday);
                return (
                  <div
                    key={weekday}
                    title={day ? `${day.count} contributions on ${day.date}` : undefined}
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      borderRadius: 2,
                      backgroundColor: "var(--accent-cyan)",
                      opacity: day ? LEVEL_OPACITY[day.level] : 0,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-muted-4 mt-2">
        <span>{data.total} contributions in the last year</span>
        <span className="ml-auto flex items-center gap-1">
          Less
          {LEVEL_OPACITY.map((op, i) => (
            <span
              key={i}
              aria-hidden="true"
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                borderRadius: 2,
                backgroundColor: "var(--accent-cyan)",
                opacity: op,
              }}
            />
          ))}
          More
        </span>
      </div>
    </div>
  );
}
