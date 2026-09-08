import type { JSX } from "react";
import type {
  Accent,
  DiagramEdge,
  DiagramNode,
  DiagramSpec,
} from "../_data/types";

// Renders a DiagramSpec as inline SVG, "Filled" style, themed through --d-*
// CSS variables mapped in globals.css. See docs/adr/0002-diagram-system.md.
// Positions are authored on a 4px grid in the spec's viewBox coordinate space.

const ACCENT_VAR: Record<Accent, string> = {
  cyan: "var(--d-cyan)",
  magenta: "var(--d-magenta)",
  purple: "var(--d-purple)",
  orange: "var(--d-orange)",
};

function accentVar(a: Accent | undefined, fallback = "cyan" as Accent): string {
  return ACCENT_VAR[a ?? fallback];
}

type Pt = [number, number];

function routeEdge(a: DiagramNode, b: DiagramNode): { pts: Pt[]; vertical: boolean } {
  const ax = a.x + a.w / 2;
  const ay = a.y + a.h / 2;
  const bx = b.x + b.w / 2;
  const by = b.y + b.h / 2;
  const vertical = Math.abs(ax - bx) < Math.abs(ay - by);
  if (vertical) {
    const y1 = ay < by ? a.y + a.h : a.y;
    const y2 = ay < by ? b.y : b.y + b.h;
    const midY = (y1 + y2) / 2;
    return { pts: [[ax, y1], [ax, midY], [bx, midY], [bx, y2]], vertical };
  }
  const x1 = ax < bx ? a.x + a.w : a.x;
  const x2 = ax < bx ? b.x : b.x + b.w;
  const midX = (x1 + x2) / 2;
  return { pts: [[x1, ay], [midX, ay], [midX, by], [x2, by]], vertical: false };
}

export default function ArchitectureDiagram({
  spec,
  idPrefix,
}: {
  spec: DiagramSpec;
  idPrefix: string;
}) {
  const [, , w] = spec.viewBox;
  const accentKeys: Array<Accent | "fg"> = ["fg", "cyan", "magenta", "purple", "orange"];
  const nodeById = new Map(spec.nodes.map((n) => [n.id, n]));

  const markerId = (key: Accent | "fg") => `${idPrefix}-ah-${key}`;

  const els: JSX.Element[] = [];

  // tier bands
  (spec.tiers ?? []).forEach((t, i) => {
    const acc = ACCENT_VAR[t.accent];
    els.push(
      <rect
        key={`tier-${i}`}
        x={t.x}
        y={t.y}
        width={t.w}
        height={t.h}
        rx={3}
        fill={acc}
        fillOpacity={0.06}
        stroke={acc}
        strokeOpacity={0.35}
      />,
    );
    els.push(
      <text
        key={`tier-label-${i}`}
        x={t.x + 8}
        y={t.y - 7}
        fontSize={9.5}
        letterSpacing="0.16em"
        fontWeight={500}
        fill={acc}
      >
        {t.label.toUpperCase()}
      </text>,
    );
  });

  // band-to-band edges
  (spec.bandEdges ?? []).forEach((be, i) => {
    const t1 = spec.tiers?.[be.from];
    const t2 = spec.tiers?.[be.to];
    if (!t1 || !t2) return;
    const cx = be.x ?? t1.x + t1.w / 2;
    const y1 = t1.y + t1.h;
    const y2 = t2.y;
    const midY = (y1 + y2) / 2;
    els.push(
      <line
        key={`band-${i}`}
        x1={cx}
        y1={y1}
        x2={cx}
        y2={y2}
        stroke="var(--d-line-strong)"
        strokeWidth={1.6}
        strokeDasharray={be.dashed ? "4 3" : undefined}
        markerEnd={`url(#${markerId("fg")})`}
      />,
    );
    if (be.label) {
      const bw = be.label.length * 5.4 + 12;
      els.push(
        <rect
          key={`band-chip-${i}`}
          x={cx - bw / 2}
          y={midY - 8}
          width={bw}
          height={15}
          rx={2}
          fill="var(--d-bg)"
          stroke="var(--d-line)"
        />,
      );
      els.push(
        <text
          key={`band-text-${i}`}
          x={cx}
          y={midY + 3.5}
          textAnchor="middle"
          fontSize={9.5}
          fill="var(--d-muted)"
        >
          {be.label}
        </text>,
      );
    }
  });

  // edges
  (spec.edges ?? []).forEach((e: DiagramEdge, i) => {
    const a = nodeById.get(e.from);
    const b = nodeById.get(e.to);
    if (!a || !b) return;
    const accKey: Accent | "fg" = e.accent ? spec.accentColor ?? "cyan" : "fg";
    const stroke = e.accent ? accentVar(spec.accentColor) : "var(--d-line-strong)";
    const { pts, vertical } = routeEdge(a, b);
    els.push(
      <polyline
        key={`edge-${i}`}
        points={pts.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke={stroke}
        strokeWidth={e.accent ? 2 : 1.6}
        strokeDasharray={e.dashed ? "4 3" : undefined}
        markerEnd={`url(#${markerId(accKey)})`}
      />,
    );
    if (e.label) {
      const lx = (pts[1][0] + pts[2][0]) / 2;
      const ly = (pts[1][1] + pts[2][1]) / 2;
      const loff = vertical ? 0 : -9;
      const lw = e.label.length * 5.4 + 10;
      els.push(
        <rect
          key={`edge-chip-${i}`}
          x={lx - lw / 2}
          y={ly + loff - 8}
          width={lw}
          height={15}
          rx={2}
          fill="var(--d-bg)"
          stroke={e.accent ? stroke : "var(--d-line)"}
        />,
      );
      els.push(
        <text
          key={`edge-text-${i}`}
          x={lx}
          y={ly + loff + 3.5}
          textAnchor="middle"
          fontSize={9.5}
          fontWeight={e.accent ? 600 : 400}
          fill={e.accent ? stroke : "var(--d-muted)"}
        >
          {e.label}
        </text>,
      );
    }
  });

  // nodes
  spec.nodes.forEach((n, i) => {
    const multi = n.label.length > 1;
    els.push(
      <rect
        key={`node-${i}`}
        x={n.x}
        y={n.y}
        width={n.w}
        height={n.h}
        rx={2}
        fill="var(--d-node)"
        stroke={n.accent ? ACCENT_VAR[n.accent] : "var(--d-line-strong)"}
        strokeWidth={1}
      />,
    );
    const cx = n.x + n.w / 2;
    const startY = n.y + (multi ? n.h / 2 - 3 : n.h / 2 + 3.5);
    els.push(
      <text key={`node-text-${i}`} x={cx} y={startY} textAnchor="middle" fontSize={11} fontWeight={500} fill="var(--d-fg)">
        {n.label.map((line, j) => (
          <tspan
            key={j}
            x={cx}
            dy={j === 0 ? 0 : 13}
            fontSize={j === 0 ? 11 : 9.5}
            fill={j === 0 ? "var(--d-fg)" : "var(--d-muted)"}
          >
            {line}
          </tspan>
        ))}
      </text>,
    );
  });

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={spec.viewBox.join(" ")}
        role="img"
        aria-label={spec.aria}
        style={{ width: "100%", maxWidth: w, height: "auto", minWidth: 340 }}
        className="font-mono mx-auto block"
      >
        <defs>
          {accentKeys.map((key) => {
            const col = key === "fg" ? "var(--d-line-strong)" : `var(--d-${key})`;
            return (
              <marker
                key={key}
                id={markerId(key)}
                viewBox="0 0 10 10"
                refX={9}
                refY={5}
                markerWidth={7}
                markerHeight={7}
                orient="auto-start-reverse"
              >
                <path d="M0,0 L10,5 L0,10 z" fill={col} />
              </marker>
            );
          })}
        </defs>
        {els}
      </svg>
    </div>
  );
}
