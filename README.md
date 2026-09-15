# personal-website

Nuno Santos' personal portfolio — a dark, minimal, terminal-flavoured site
(glitch text, a particle-network hero, light + dark themes), plus a few
personality touches: a Konami-code Matrix-rain easter egg, a live GitHub
contributions heatmap, and an About/CV page.

## Stack

- **Next.js 16** (App Router) — note: this repo pins a Next major with breaking
  changes vs. upstream; see `AGENTS.md`.
- **TypeScript**
- **Tailwind CSS v4** — design tokens as CSS custom properties in `app/globals.css`

## Structure

```
app/
├── page.tsx                     home — hero, about, projects, stack, contact
├── about/                       the About/CV page (/about)
│   ├── page.tsx
│   ├── _data.ts                 timeline milestones + CV asset paths
│   └── _components/             AboutHero / AboutTimeline / AboutCv / AboutSkills
├── _data/                       cross-page content shared by home + /about
│   ├── skills.ts                single source of truth for the skills list
│   ├── cv.ts                    the two CV asset paths (graphical + ATS)
│   └── github-contributions.ts  server-only GitHub GraphQL fetch (heatmap)
├── components/                  shared chrome and small features
│   ├── SiteNav.tsx / SiteFooter.tsx / SectionLabel.tsx / TagGroupGrid.tsx
│   ├── ThemeToggle.tsx          light/dark toggle + THEME_CHANGE_EVENT
│   ├── ParticleNetwork.tsx      hero canvas background
│   ├── KonamiEasterEgg.tsx      Konami-code -> Matrix-rain overlay
│   └── GithubHeatmap.tsx        renders the fetched contribution calendar
├── projects/
│   ├── [slug]/page.tsx          one dynamic route for every case study
│   ├── _data/                   typed CaseStudy objects — the content layer
│   │   ├── types.ts             CaseStudy / CaseCard / OtherWork / DiagramSpec
│   │   ├── index.ts             the ordered registry
│   │   ├── <slug>.ts            one file per case study
│   │   └── other-work.ts        the "also built" list
│   └── _components/             <CaseStudyPage> + per-section components,
│                                the inline-SVG ArchitectureDiagram renderer,
│                                the landing ProjectCards / OtherWorkGrid
public/
└── cv/                          downloadable CV assets (graphical + ATS/plain-text)
docs/
├── adr/                         architecture decision records
├── research/                    one fact dossier per topic
└── prototypes/                  throwaway design explorations
```

A case study is a data file plus a registry entry — no new page, no bespoke
layout. Architecture diagrams are declarative specs (`DiagramSpec`) rendered as
theme-aware inline SVG, no diagram library.

## Environment variables

| Variable | Required for | Notes |
|---|---|---|
| `GITHUB_CONTRIBUTIONS_TOKEN` | The homepage's GitHub activity heatmap | A GitHub personal access token, **classic** (fine-grained tokens have had incomplete GraphQL API support), scope `read:user`. Server-only — never prefix it `NEXT_PUBLIC_`. Without it, `getContributionData()` logs a warning and the heatmap section just doesn't render; nothing else breaks. Set in `.env.local` for local dev and in the Vercel project's Environment Variables for production. |

## How this was built

Every non-trivial chunk of this site was built inside
**[Claude Code](https://claude.com/claude-code)** using an agent workflow built
around packaged **skills**. Roughly:

1. **Wayfinding.** A big effort is charted as a *map* on the issue tracker: a
   destination, and child *tickets* each resolving a single decision or slice
   of work. Nothing is built before the route is clear. (`/wayfinder`)
2. **Research.** Any ticket that needs facts outside the working directory —
   reading a source repo, checking a third-party API's actual contract — gets
   a **research sub-agent** and a fact dossier under `docs/research/`, every
   claim cited. Copy is written from the dossier, not from memory. (`/research`)
3. **Decisions.** Content models and layouts are worked out in conversation
   (`/grilling`, `/domain-modeling`), visual questions with **throwaway
   prototypes** (`docs/prototypes/`, `/prototype`), and durable choices locked
   as ADRs (`docs/adr/`).
4. **Build.** One ticket per session, against the decisions already made.
5. **Review.** Every ticket that touched code is checked by two **parallel
   sub-agents** before merge — one against this repo's standards, one against
   the originating ticket's spec. (`/code-review`)

Two maps have gone through this so far:

- **[#1](https://github.com/Rekrl/personal-website/issues/1)** — the projects
  section: four deep case studies (IIoT Trace, Alojamento Local SaaS,
  SoftSkills, Urvox), a shared template, and the landing layout.
- **[#17](https://github.com/Rekrl/personal-website/issues/17)** — the
  personality features: the Konami easter egg, the GitHub heatmap, and the
  About/CV page. This one produced decisions only; the actual builds are
  regular (non-wayfinder) issues
  **[#23](https://github.com/Rekrl/personal-website/issues/23)**,
  **[#24](https://github.com/Rekrl/personal-website/issues/24)** and
  **[#25](https://github.com/Rekrl/personal-website/issues/25)**.

The `/wayfinder`, `/research`, `/prototype`, `/code-review`, `/domain-modeling`
and related skills are Matt Pocock's set, installed with
`/setup-matt-pocock-skills`.

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

Deployed on [Vercel](https://vercel.com); a push to `main` triggers a deploy.
