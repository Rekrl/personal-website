# Case-study diagrams are hand-authored SVG from a declarative spec

Architecture diagrams in the case studies are rendered by one ~90-line `<CaseArchitecture>` component from a declarative `diagram` object (tiers / nodes / edges / bandEdges, positions hand-placed on a 4px grid) held in the case study's data file. No mermaid, no diagram library, no runtime dependency. Each diagram also carries a sibling `ascii` string used only for genuinely trivial diagrams and as the small-screen fallback.

**Style: "Filled"** — tier bands get a faint accent-tinted wash, nodes a solid surface fill, edges sit a touch heavier with solid arrowheads and chipped labels. The rejected alternative ("Blueprint" — hairline, no fills) reads better in dark but washes out on the light ground, and light is a first-class theme here.

**Theming:** the component reads `--d-*` CSS variables that `globals.css` maps to the site's existing per-theme tokens, so each theme (including light) gets hand-tuned accent values. This was prototyped and verified in both themes — [ticket #7](https://github.com/Rekrl/personal-website/issues/7), prototype on branch `prototype/7-diagrams`, artifact linked from the issue.

**Why not auto-layout:** four diagrams don't justify a layout engine; hand-placed coordinates stay predictable and show up as a readable diff when content changes.

Each diagram carries one accent edge — the single labelled relationship it exists to make a point about — to keep figures making one claim rather than inventorying the system.
