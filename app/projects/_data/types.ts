// Case-study content model. See docs/adr/0001-case-study-content-model.md
// and docs/adr/0002-diagram-system.md.

export type Accent = "cyan" | "magenta" | "purple" | "orange";
export type Status = "shipped" | "in-progress" | "prototype";

// ---------------------------------------------------------------------------
// Diagram spec — interpreted by <CaseArchitecture>. Positions are hand-placed
// on a 4px grid in the coordinate space of `viewBox`.
// ---------------------------------------------------------------------------

export interface DiagramTier {
  label: string;
  accent: Accent;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DiagramNode {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** first line is the title, the rest render muted/smaller */
  label: string[];
  accent?: Accent;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  /** the one relationship the diagram exists to make a point about */
  accent?: boolean;
  dashed?: boolean;
}

export interface DiagramBandEdge {
  /** index into `tiers` */
  from: number;
  to: number;
  /** x in viewBox coords; defaults to the source tier's centre */
  x?: number;
  label?: string;
  dashed?: boolean;
}

export interface DiagramSpec {
  viewBox: [number, number, number, number];
  /** accessible description of the whole figure */
  aria: string;
  /** colour used for accent edges/nodes; defaults to "cyan" */
  accentColor?: Accent;
  tiers?: DiagramTier[];
  nodes: DiagramNode[];
  edges?: DiagramEdge[];
  bandEdges?: DiagramBandEdge[];
}

// ---------------------------------------------------------------------------
// Case study
// ---------------------------------------------------------------------------

export interface Decision {
  tag: string;
  title: string;
  decision: string;
  why: string;
}

export interface StackLayer {
  layer: string;
  items: string[];
}

export interface Stat {
  value: string;
  label: string;
}

export interface RealityRow {
  claim: string;
  reality: string;
}

export interface MediaItem {
  kind: "image" | "video" | "youtube";
  /** path under /public for image|video, or the YouTube id for youtube */
  src: string;
  caption: string;
  /** poster frame for a <video>, path under /public */
  poster?: string;
}

export interface CaseLink {
  label: string;
  href: string;
}

/** the subset the landing section renders */
export interface CaseCard {
  blurb: string;
  stack: string[];
  /** stack entries rendered in the project accent; the rest stay muted */
  signatureStack: string[];
}

export interface Figure {
  diagram: DiagramSpec;
  caption: string;
  /** plain-text fallback: trivial diagrams and the < 560px substitute */
  ascii?: string;
}

export interface CaseStudy {
  slug: string;
  name: string;
  /** hero one-liner */
  tagline: string;
  accent: Accent;
  status: Status;
  /** hero field, e.g. "Solo · degree project with STAR Institute" */
  role: string;
  /** demo / external links; [] renders `linksNote` (or a default) instead */
  links: CaseLink[];
  /** shown in place of links when `links` is empty */
  linksNote?: string;
  metaDescription: string;
  card: CaseCard;

  // sections — optional ones are simply absent
  overview: string[];
  architecture: {
    intro: string[];
    figures: Figure[];
    notes?: string[];
  };
  decisions: Decision[];
  stack: StackLayer[];
  stats?: Stat[];
  statsNote?: string;
  reality?: { intro?: string; rows: RealityRow[] };
  media?: MediaItem[];
  cta: { blurb: string };
}
