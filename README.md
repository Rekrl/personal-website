# personal-website

Nuno Santos' personal portfolio — a dark, minimal, terminal-flavoured site
(glitch text, a particle-network hero, light + dark themes).

## Stack

- **Next.js 16** (App Router) — note: this repo pins a Next major with breaking
  changes vs. upstream; see `AGENTS.md`.
- **TypeScript**
- **Tailwind CSS v4** — design tokens as CSS custom properties in `app/globals.css`

## Structure

```
app/
├── page.tsx                     home — hero, about, projects, stack, contact
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
docs/
├── adr/                         architecture decision records
├── research/                    one fact dossier per case study
└── prototypes/                  throwaway design explorations
```

A case study is a data file plus a registry entry — no new page, no bespoke
layout. Architecture diagrams are declarative specs (`DiagramSpec`) rendered as
theme-aware inline SVG, no diagram library.

## How this was built

The projects section — four deep case studies (IIoT Trace, Alojamento Local
SaaS, SoftSkills, Urvox), a shared template, and the landing layout — was built
inside **[Claude Code](https://claude.com/claude-code)** using an agent workflow
built around packaged **skills**. Roughly:

1. **Wayfinding.** The whole effort was charted as a *map* on the issue tracker
   (`Rekrl/personal-website` issue #1): a destination, and child *tickets* each
   resolving a single decision or slice of work. Nothing was built before the
   route was clear. (`/wayfinder`)
2. **Research.** Each case study started with a **research sub-agent** reading
   the (mostly private) source repos and writing a fact dossier —
   `docs/research/*-dossier.md`, every claim cited to a file. The case-study
   copy is written from the dossier, not from memory. (`/research`)
3. **Decisions.** The content model, the diagram system and the landing layout
   were worked out in conversation (`/grilling`, `/domain-modeling`), the visual
   questions with **throwaway prototypes** (`docs/prototypes/`, `/prototype`),
   and the results locked as ADRs (`docs/adr/`).
4. **Build.** One ticket per session, against the typed content layer.
5. **Review.** Every ticket that touched code was checked by two **parallel
   sub-agents** before merge — one against this repo's standards, one against
   the originating ticket's spec. (`/code-review`)

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
