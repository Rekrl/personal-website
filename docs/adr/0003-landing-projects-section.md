# Landing projects section: featured case study + row of three + expandable "also built"

The `02 / projects` block on the home page is rebuilt as **layout B**: the strongest case study (IIoT Trace) as a wide featured card with a media panel, then the other three (YourSpot, SoftSkills, Urvox) in a three-up row, then a compact "also built" block. Order: IIoT Trace → YourSpot → SoftSkills → Urvox (strongest first, shipped before prototype). Prototyped with two rejected alternatives — a flat 2×2 grid (no hierarchy) and a typographic index (dead space in the right column). Prototype: branch `prototype/8-projects-section`, artifact linked from [ticket #8](https://github.com/Rekrl/personal-website/issues/8).

**Status badge:** a coloured dot + uppercase label at the top of each card — `shipped` (green), `in progress` (amber), `prototype` (grey). Semantic colour, deliberately separate from the per-project accent hue.

**Stack chips:** each project marks 1–3 *signature* technologies that render in the project's accent colour (border + text); the rest stay muted. Full per-technology brand colours were rejected — too busy, off the site's restrained palette. This needs a `signatureStack: string[]` field on the card data.

**"Also built":** the three secondary entries are cards in the same idiom at a smaller scale, each with a cycling accent and a hover border-lift. They have no case study page and no public repo, so instead of a link they **expand inline on click** to reveal 2–3 more sentences (what it was, role, outcome) — this needs an `expandedDetail: string[]` field on the `OtherWork` type. The block is introduced by a short lead-in sentence, not a terse `ALSO BUILT` label.

**SoftSkills card carries no team/role line.** The card blurb makes no authorship claim either way; the honest "team of 5, my part was X" belongs on the case study page, not the teaser. (The *current* landing blurb wrongly calls it a solo Socket.io project — that copy is replaced.)

Decided in [Prototype: projects landing section redesign](https://github.com/Rekrl/personal-website/issues/8) (wayfinder map #1). Implements against the content layer from ADR 0001.
