# YourSpot / Alojamentos — Fact Dossier

Research dossier for the "YourSpot / Alojamentos" case-study page. Resolves
`Rekrl/personal-website` issue #3 (`wayfinder:research`, part of #1).

**Scope of this dossier:** the *template-strategy* seam of the project — how one
codebase serves three visually distinct tenant sites, how per-tenant colour is a
second independent axis, and the decision history behind both. It is a synthesis
of primary sources, not new analysis.

**Primary sources**

- Project source (local, read-only): `C:\Users\nunog\Desktop\Alojamentos`
  - `README.md`, `CLAUDE.md`, `briefing-planeamento-plataforma.md`,
    `orcamento-yourspot.md`
  - `src/` (frontend), `docs/research/template-architecture-patterns.md`
  - onboarding spreadsheets — noted in §7, content not mined
- Wayfinding map for the project itself: **`AutoMendes/saas_reservations`**
  GitHub Issues — issue **#1** ("Estratégia de templates da plataforma SaaS")
  and its child tickets **#2–#7**, plus map **#31** (#32–#44) and #43. This is
  the richest seam and is cited throughout as `saas_reservations#N`.

Where a fact is load-bearing, the source is given inline as a file path or an
issue number.

---

## 1. What it is + honest status

### What it is

**YourSpot** is a multi-tenant SaaS booking platform for local accommodation
("alojamento local"). Each customer (tenant) of the platform gets their own
public booking site with **two independent configuration axes**:

- **Template** — the structural/visual implementation of the site: `moderno`,
  `classico`, or `luxo`. Each template is a *genuinely separate component tree*
  (its own header, hero, property card, booking form, footer, …), not a
  re-skin of shared markup. (`README.md`; `src/lib/templates.ts`;
  `saas_reservations#5`)
- **Colour palette / theme** — the tenant's brand colours (light + dark mode),
  chosen independently of which template they run. (`src/lib/tenant-theme.ts`;
  `saas_reservations#1` refinement note, `#33`)

Booking rules and business logic (search filter, booking form fields,
cancellation policy, reservation engine) are **common to all templates** — only
presentation varies per template. This was an explicit correction to the
map's original framing, which had assumed functionality would vary per template
too. (`saas_reservations#3` decision + `#1` "Corrigido" note)

The pilot / reference client is a sole trader with **7 properties** around the
**Ria de Aveiro** (6 near Aveiro/Ílhavo, 1 in Figueira da Foz), currently on
Booking.com + the **TalkGuest** channel manager (iCal, one link per property),
who wants to cut platform-commission dependency and had a failed WordPress
attempt before. (`briefing-planeamento-plataforma.md`;
`saas_reservations#7` follow-up comments)

A second, **fictional** tenant — **"Vista Douro"** — exists purely to prove the
multi-tenancy is real: same codebase, different slug, different template
(`luxo`), different palette, different supported locales (PT/EN/IT vs YourSpot's
PT/EN/ES). (`saas_reservations#36`, `#41`, `#51`; `npm run dev:luxo` sets
`TENANT_SLUG=vistadouro` in `package.json`)

### Honest status

Framed by the ticket as "prototype / planning, mock data, pilot client as
reference case." The code has moved past a pure prototype but is **not a
launched product**:

| Area | Status |
|---|---|
| 3 template component trees (Moderno / Clássico / Luxo) | **Built**, all routes 200 in light + dark (`saas_reservations#7`, Clássico + Luxo comments on `#1`) |
| Per-request tenant + template + locale resolution (`src/proxy.ts`) | **Built** — supersedes the env-var prototype shortcut (`saas_reservations#43`) |
| Backend API (`saas_reservations-api`, separate NestJS repo) | **Built** — real tenant config + 7 real YourSpot properties + 4 real partners loaded via `/admin` (`saas_reservations#85`–`#95`) |
| Backoffice (`/admin` platform-side, `/gestao` tenant-side) | **Built** — CRUD of properties/users, image upload, i18n, iCal panel (`saas_reservations#59` map) |
| i18n (next-intl, PT/EN/ES + IT for Vista Douro) | **Built** (`saas_reservations#46` map) |
| SEO (sitemap, robots, JSON-LD, GA4, hreflang, cookie consent) | **Built** (`saas_reservations#29`; `docs/research/rgpd-privacy-policy.md`, `cookie-consent-banner.md`) |
| Reservation engine + payment capture + notifications | **In specification** — map `saas_reservations#96` is OPEN with grilling tickets `#98`–`#108` still open. The `/api/checkout` route creates a Stripe Checkout session but there is **no webhook / Booking persistence / confirmation email** wired yet. |
| `src/lib/mock-data.ts` | Prototype-era fictional data, **superseded** by `src/lib/api.ts` but still in the tree (`CLAUDE.md` "Known stale code") |
| Deployed public demo | **None** — see §6 |
| Test suite | **None configured** (`CLAUDE.md`) |
| Commercial status | Proposal only — €800–1000 setup + €40–80/month, 12-month minimum, explicitly under market rate because it doubles as portfolio for two recent-grad devs (`orcamento-yourspot.md`) |

---

## 2. Architecture (draw-a-diagram detail)

### 2.1 Request lifecycle — the two-axis resolution

```
                        ┌─────────────────────────────────────────────┐
   HTTP request  ──────▶│  src/proxy.ts   (Next.js 16 middleware)      │
   Host: yourspot.pt    │  runs on every request, before any render   │
                        └─────────────────────────────────────────────┘
                                        │
        ┌───────────────────────────────┼────────────────────────────────┐
        ▼                               ▼                                ▼
  TENANT resolution              LOCALE resolution               writes cookie
  (order of precedence)          (after tenant known)            tenant-slug
  1. ?tenant=<slug>  (dev)       - path starts with a locale     (if ?tenant= used)
  2. Host header  ──▶ backend      the tenant supports  → pass
     GET /tenants/by-domain/:host  through, inject x-locale
     (prod; covers BOTH platform  - unsupported 2-letter locale
     subdomain and client's own    → 404 (never silent redirect,
     domain, not distinguished)      avoids Google duplicate content)
  3. tenant-slug cookie          - no locale segment → redirect to
  4. TENANT_SLUG env var           Accept-Language match (or
  5. default "yourspot"            tenant defaultLocale)
        │                          content is NEVER served without a
        ▼                          /<locale>/ prefix in the URL
  inject header
  x-tenant-slug: <slug>   ───────────────┐
                                         ▼
        ┌────────────────────────────────────────────────────────────────┐
        │  Server Components (App Router, routes under src/app/[locale])  │
        │                                                                │
        │  src/lib/api.ts     getActiveTenantSlug() reads x-tenant-slug   │
        │    getTenantConfig() ─▶ GET /tenants/:slug on backend           │
        │      returns: { template, presentationConfig: { theme, pages }, │
        │                 legalPages, supportedLocales, domain, … }       │
        │      cached next:{ revalidate: 3600 }                           │
        │                                                                │
        │  src/lib/templates.ts   getActiveTemplate()                     │
        │    = templates[ tenantConfig.template ]  ──▶ TemplateDefinition │
        └────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
        ┌────────────────────────────────────────────────────────────────┐
        │  src/app/layout.tsx  (single root <html>/<body> for all 3       │
        │  templates — App Router allows exactly one)                     │
        │                                                                │
        │   <html class="dark?">                                         │
        │     <head><style> :root { --tenant-*: <hex from theme.light> }  │
        │             html.dark { --tenant-*: <hex from theme.dark> }     │
        │             + <script id=ld+json Organization>                  │
        │     <body>                                                      │
        │       <Script theme-init>  (pre-hydration, reads                │
        │                             localStorage "yourspot-theme")      │
        │       <template.Layout>            ◀── per-template wrapper      │
        │         {children = the matched page component}                 │
        │       <CookieConsentBanner? />                                  │
        └────────────────────────────────────────────────────────────────┘
```

Key invariant (`CLAUDE.md`, `src/proxy.ts` header comment): **no component
reads `process.env.TEMPLATE` / `process.env.TENANT_SLUG` or `params.locale`
directly.** Everything downstream reads the injected headers
(`x-tenant-slug`, `x-locale`, `x-locale-path`) via `next/headers`. The env vars
survive only as the proxy's last-resort fallback seed.

### 2.2 Template registry — `src/lib/templates.ts`

The seam that makes one codebase serve three templates **at the same routes**
(`/`, `/alojamentos`, `/imovel/[slug]`, `/[listingSlug]`, `/sobre`,
`/contactos`, `/faq`, `/privacidade`, `/cookies`), switching purely on the
resolved tenant's `template` field — no URL prefix.

```
TemplateKey = "moderno" | "classico" | "luxo"

interface TemplateDefinition {
  key
  metadata          // Next Metadata (title/description) per template
  Layout            // ComponentType<{children}>  — theme/font/CSS-scope wrapper
  HomePage
  AlojamentosPage
  ImovelPage        // <{ slug }>
  ParceirosPage     // <{ listingSlug }>
  SobrePage
  ContactosPage
  PrivacidadePage   // createLegalPageComponent("privacyPolicy", <Header>, <Footer>)
  CookiesPage       // createLegalPageComponent("cookiePolicy", …)
  FaqPage
}

export const templates: Record<TemplateKey, TemplateDefinition> = {
  moderno:  { Layout: ModernoLayout,  HomePage: ModernoHomePage,  … },
  classico: { Layout: ClassicoLayout, HomePage: ClassicoHomePage, … },
  luxo:     { Layout: LuxoLayout,     HomePage: LuxoHomePage,      … },
}

getActiveTemplate() = templates[ resolveTemplateKey(getTenantConfig().template) ]
                      // unknown / unset → falls back to "moderno"
```

Every route file in `src/app/[locale]/` is a **thin dispatcher**:

```tsx
// src/app/[locale]/page.tsx  — the whole file
export default async function Home() {
  const { HomePage } = await getActiveTemplate();
  return <HomePage />;
}
```

Adding a template page = add one field to `TemplateDefinition` and one entry to
every record in `templates`. (`src/lib/templates.ts`; `CLAUDE.md` "Template
registry")

### 2.3 Per-template component trees — `src/components/<template>/`

Each template has its own **full** set of ~25 components under
`src/components/moderno/`, `classico/`, `luxo/`. Nothing visual is shared
between them — only (a) the *shape* of data types and (b) UX mechanics /
business logic. Example parallel slots:

| Slot | Moderno | Clássico | Luxo |
|---|---|---|---|
| Header | `SiteHeader` | `ClassicoSiteHeader` | `LuxoHeader` |
| Hero divider motif | `SalinasStripes` (horizontal salt-pan stripe) | `ClassicoAzulejoDivider` (`.azulejo-lattice` diamond tile trellis) | `LuxoFacetDivider` (`.luxo-facets` flor-de-sal crystal facets) |
| Property card | `PropertyCard` | `ClassicoPropertyCard` | `LuxoPropertyCard` |
| Booking form | `BookingForm` | `ClassicoBookingForm` | `LuxoBookingForm` |
| Guest picker | `GuestPicker` | `ClassicoGuestPicker` | `LuxoGuestPicker` |
| Photo carousel | `PhotoCarousel` | `ClassicoPhotoCarousel` | `LuxoPhotoCarousel` |
| Featured stay | `FeaturedStay` | `ClassicoFeaturedStay` | `LuxoFeaturedStay` |

What is deliberately shared (per the Clássico + Luxo build notes on
`saas_reservations#1`):

- Search-filter **fields**: location + trip date range + guest picker
  (adults/children split) + bedrooms + "travelling with pets" toggle.
- Booking-form **fields + validation**: email + phone required; mocked
  "Pagar X€ agora" button.
- Dark-mode toggle **key** (`yourspot-theme` in `localStorage`) and the single
  global `html.dark` class.
- The section-config **shape** (see §2.5) and the pure data helpers in
  `src/lib/sections.ts` (e.g. `groupFaqItemsByCategory`).

Direction of each template (from the build notes on `saas_reservations#1`):

- **Moderno** — sunlit-editorial minimalism grounded in the Ria de Aveiro:
  moliceiro boats, Costa Nova's candy-striped fishermen's huts, salt pans.
  Fonts: Fraunces + Inter + IBM Plex Mono (prices/dates in mono).
- **Clássico** — traditional Portuguese guesthouse / pousada register: azulejo
  tilework, aged linen, dark chestnut wood, terracotta roof tile ("telha").
  Fonts: Lora + PT Sans + Courier Prime (typewriter-ledger mono).
- **Luxo** — premium/exclusive, deliberately *not* "gilded Clássico" or
  near-black-plus-neon "luxury SaaS": *flor de sal* salt crystal, aged brass
  moliceiro fittings, the ria's tidal water at night. Fonts: Cormorant + Jost
  (no mono — tracked uppercase labels instead). Sharp-cornered hairline-brass
  cards vs Moderno's rounded-2xl soft-shadow style.

### 2.4 Per-tenant theming — `src/lib/tenant-theme.ts` and the CSS-var wiring

**Colour is a separate axis from template.** (`saas_reservations#1` refinement,
`#33`) The shape:

```ts
type TenantTheme     = { text; background; surface; primary; secondary; muted }  // 6 tokens
type TenantThemeSet  = { light: TenantTheme; dark: TenantTheme }
// TenantConfig.presentationConfig.theme also carries fontPairId  (src/lib/api.ts)
```

`src/lib/tenant-theme.ts` holds `yourSpotTheme`, `classicoTheme`, `luxoTheme`
as static objects — each a Ria-de-Aveiro-grounded palette, all WCAG-AA
verified (≥4.5:1 text-on-background/surface; Luxo notes ≥5.9:1). **These static
exports are now "known stale code"** (`CLAUDE.md`): they predate the
backend-driven resolution. The live path is:

```
getTenantConfig().presentationConfig.theme   (from backend GET /tenants/:slug)
        │
        ▼  emitted as a <style> string by each template's Layout:
Moderno   (src/app/layout.tsx)      :root            { --tenant-*  : … }
                                    html.dark        { --tenant-*  : … }   ← no wrapper element
Clássico  (components/classico/Layout.tsx)  .classico-scope        { --classico-* : … }
                                            html.dark .classico-scope { --classico-* : … }
Luxo      (components/luxo/Layout.tsx)      .luxo                  { --luxo-*     : … }
                                            .dark .luxo            { --luxo-*     : … }
```

The `--classico-*` / `--luxo-*` **scoped namespaces** are a survival from the
old prefixed-route world (`/classico/*`, `/luxo/*`) where all three could
render on one page and had to not clobber each other's `:root` vars. Moderno,
as the "base", injects directly on `:root` with no wrapper. Tailwind v4
utilities (`bg-primary`, `text-clay`, …) resolve to these CSS vars, so a
palette swap needs **no rebuild** — this is the payoff of the Tailwind-v4
`@theme` / CSS-custom-property approach recommended in the research
(`docs/research/template-architecture-patterns.md` §1).

**Fonts** (`src/lib/fonts.ts`): `next/font/google` requires static literal
calls, so all three font pairs are *always* loaded in the bundle; the tenant's
`fontPairId` only decides which pair is *active* via CSS vars
(`--font-display` / `--font-sans` / `--font-mono`). Curated pairs only — the
tenant picks from a catalogue (`FONT_PAIRS`), never free choice, to protect the
visual quality already built (`saas_reservations#33`, `#39`). The
`resolveFontPairId()` lookup is wired but "does not yet branch to a second real
pair."

**Dark mode** is one site-wide preference for every template — a pre-hydration
inline script in the root layout reads `localStorage["yourspot-theme"]`
(falling back to OS `prefers-color-scheme`) and toggles `html.dark` before
first paint to avoid a light-then-dark flash.

### 2.5 Tenant-configurable sections — `src/lib/sections.ts` + `<template>/sections/registry.tsx`

Beyond the fixed page slots, some page content is a **typed, positional list of
sections** stored as JSON on the backend
(`TenantConfig.presentationConfig.pages: Record<string, TenantSection[]>`).
(`saas_reservations#32`, `#38`, `#44`)

```
SectionConfigByType = {
  listings : { slug, navLabel, intro?, items: ListingItem[] }   // partners AND
                                                                 // informal recs —
                                                                 // difference is data only
  hero     : { headline, subheadline }
  about    : { eyebrow, headline, intro, features[] }
  faq      : { slug, navLabel, categories[], items: FaqItem[] }
}

// each template has its OWN registry mapping SectionType → component:
src/components/moderno/sections/registry.tsx   { listings: ListingsSection }
src/components/classico/sections/registry.tsx  { listings: ClassicoListingsSection }
src/components/luxo/sections/registry.tsx       { listings: LuxoListingsSection }

SectionRenderer: unknown section types are SILENTLY SKIPPED, never a hard error
```

Discipline enforced by `CLAUDE.md` and `saas_reservations#32`: **a section
component must never contain tenant-conditional logic** — all variation comes
through its `config`. This is the "sections + blocks" pattern (Shopify Online
Store 2.0), translated to a React component registry, exactly as recommended in
`docs/research/template-architecture-patterns.md` §2.2 / §5.

### 2.6 The env-var-per-process shortcut → decided per-request resolution

This is the single sharpest architecture story in the project.

**Prototype shortcut** (when the 3 template branches were first consolidated to
`main` in `saas_reservations`, commit `1b1996a`, comment on `#1`):

- The 3 prototype branches (`prototype/moderno-yourspot`,
  `prototype/classico-yourspot`, `prototype/luxo-yourspot`) — originally built
  as *prefixed parallel route sets* (`/classico/*`, `/luxo/*`) — were merged
  into one tree rendering at the **same root routes**.
- Which template renders was chosen by a **`TEMPLATE` env var read once per
  process** at dev-server / build startup. npm scripts: `dev:moderno` (:3000),
  `dev:classico` (:3001), `dev:luxo` (:3002), and `proto` (all three at once
  via `concurrently`) for **side-by-side client demos**.
- `next.config.ts` namespaces `distDir` to `.next-<template>` so three
  `next dev` processes don't stomp each other's build cache.
- Explicitly flagged in that comment as *"uma simplificação de fase de
  protótipo … deliberadamente diferente do mecanismo de resolução … em
  produção (baseado em subdomínio), já decidido na issue #5"*, and the
  `TemplateDefinition` shape was *designed to be the unit that per-request
  resolution would later consult, so the swap is additive, not a rewrite.*

**The decision it was a shortcut for** (`saas_reservations#5`, closing the
technical-architecture grilling):

1. **Component structure**: per page slot, 3 component implementations, one per
   template (`HeroModerno` / `HeroClassico` / `HeroLuxo`), resolved at render
   from the tenant's template — more than swapping Tailwind tokens; each
   template may have its own composition/markup per slot.
2. **Template resolution**: `proxy.ts` identifies the tenant by **subdomain**
   and looks up the associated template from a per-tenant config/registry.
   (Exact data source deferred to the backend-stack map.)

**The shortcut has since been replaced** (`saas_reservations#43`, map `#31`):
`src/proxy.ts` now resolves the tenant **per request** from the full `Host`
header via `GET /tenants/by-domain/:domain` on the backend (covering both a
platform subdomain like `yourspot.plataforma.com` and a client's own domain
like `yourspot.pt`, without distinguishing them), injects `x-tenant-slug`, and
`getActiveTemplate()` reads `Tenant.template` from `getTenantConfig()` — **no
more `process.env.TEMPLATE` read**. A first pass used a "first domain segment =
slug" heuristic and was then upgraded to the backend `by-domain` lookup to
support custom client domains. Verified live: one process/port,
`?tenant=vistadouro` flips both tenant *and* template (confirmed by the `luxo`
class in the HTML, not just the data). The `dev:<template>` scripts still exist
but no longer force a template — local template switching is now
`?tenant=<slug>` (sticky via a `tenant-slug` cookie).

For a case study, the arc is: **deliberate throwaway shortcut, named as such at
the time, with the seam (`TemplateDefinition`) pre-shaped so the real
mechanism dropped in additively.**

---

## 3. The genuine decisions and their *why* (from `saas_reservations`)

All from the wayfinding map `saas_reservations#1` and its child grillings /
research. Each is a real decision with a recorded rationale, not a guess.

| # | Decision | Why (recorded rationale) |
|---|---|---|
| `#2` | **Frontend stack fixed: Next.js (App Router) + React + TypeScript + Tailwind CSS v4.** | Confirms the pre-meeting candidate; aligns with the template-architecture research assumptions — Tailwind v4 `@theme` for per-tenant theming, `proxy.ts` for multi-tenant routing. |
| `#3` | **3 templates at launch (Moderno / Clássico / Luxo), differing *visually only*.** | Reservation engine, cancellation policy, required fields, partners page, chatbot etc. are the same across all templates — already decided with the client. Correcting the map's initial assumption that functionality would vary. Side note: the briefing's "chatbot" is a canned-FAQ chat, **not** a generative-AI assistant. |
| `#4` (research) | **No single pattern solves visual + functional per-tenant — 3 orthogonal axes.** (`docs/research/template-architecture-patterns.md`) | (1) Multi-tenant routing via `proxy.ts` subdomain rewrite, per Vercel's official `vercel/platforms` starter. (2) Visual theme via Tailwind v4 `@theme` / CSS custom properties, runtime-swappable, no rebuild. (3) Structure + active modules via a typed per-tenant list of "sections" resolved against a React component registry — Shopify Online Store 2.0's sections+blocks, *without* building the full generic catalogue yet (avoid over-engineering for one real tenant). Vercel Flags SDK reserved for later gradual module rollout, not the MVP. |
| `#5` | **Per-tenant template-switch architecture: 3 component impls per page slot + `proxy.ts` subdomain → per-tenant registry lookup.** | Goes beyond swapping Tailwind tokens — each template can own its composition/markup per slot while sharing base `@theme` tokens (e.g. spacing scale) where sensible. Built on `#4` (routing + Tailwind v4) and `#3` (3 templates, visual only). |
| `#6` | **Moderno is the first template to prototype.** | Minimalist-modern is fastest/cheapest to build *well* (simple grid, less ornament) and is a neutral base to derive Clássico and Luxo from later. |
| `#7` (prototype) | **Navigable coded prototype of Moderno for YourSpot**, branch `prototype/moderno-yourspot`. | Throwaway per the `/prototype` skill. Started with 3 structurally different homepage variants (`?variant=A\|B\|C`); iterated twice on client feedback → single unified design (refined Variant C); setting moved Algarve/Ria Formosa → **Ria de Aveiro** (client is in Aveiro); dark mode added; guest picker split adults/children + `petsAllowed` field; dropped all "book direct / no intermediaries" messaging. |
| `#1` refinement / `#33` | **Colour is a per-tenant axis independent of template**; fonts are curated pairs per template, tenant picks one. | Structured as a `TenantTheme` config, not fixed CSS — so each client gets their own palette *and* their own template, two separate axes. Curated font pairs (not free choice) protect the visual quality already built. |
| `#34` | **Per-tenant presentation config (theme, font, section list) lives on the backend Tenant model**, returned in one public tenant API call. | Frontend drops its hardcoded `activeTenant`; resolves by slug via fetch. Keeps the door open for a future backoffice to edit this **without a frontend deploy**. |
| `#32` / `#38` | **Typed per-tenant section registry** (`Record<SectionType, ComponentType>`), each page an ordered typed list of sections. | Same sections+blocks principle from research `#4`. A section absent from a tenant's list simply doesn't render; another tenant can put a different section in the same place. Discipline: **no tenant-conditional logic inside a section component**. |
| `#23` | **Backend tenant resolution**: `tenant_id` JWT claim for authed requests; explicit `X-Tenant-Slug` header (validated against known tenants) for public requests. | Does **not** re-parse the subdomain on the backend — avoids duplicating tenant-resolution logic in two places. iCal export endpoints resolve tenant by slug in the URL (third-party channel-manager requests, not frontend). |
| `#43` | **`src/proxy.ts` resolves tenant per request** from full `Host` via backend `GET /tenants/by-domain/:domain`; `getActiveTemplate()` reads `Tenant.template`. | Replaces the `process.env.TEMPLATE` prototype shortcut. One Next.js process serves all 3 templates dynamically. Upgraded from a "first domain segment" heuristic to the `by-domain` lookup to support clients' own domains, not just platform subdomains. |
| `#46` map / `#53`, `#54` | **i18n: content multi-language configurable per tenant**; routes restructured to `src/app/[locale]/…`; `proxy.ts` resolves locale per request. | Unsupported locale → 404, never a silent redirect — avoids duplicate content in Google's index. Content never served without a `/<locale>/` prefix. |
| `#10` (backend) | **DB multi-tenancy: shared schema with a `tenant_id` column per table**, isolation enforced by a NestJS guard/interceptor. | Dominant pattern for B2B SaaS of this size (tens/hundreds of small tenants); schema-per-tenant and DB-per-tenant rejected as unnecessary operational cost/complexity. |
| `#9` (backend) | **Backend framework: NestJS.** | Modular architecture maps to the two-dev domain split; first-class TypeScript; mature ecosystem (`@nestjs/schedule`, `@nestjs/jwt`, Prisma, auto Swagger). Plain Express/Fastify rejected for not imposing the modular structure the work-split depends on. |

**Not yet specified** (open, per `saas_reservations#1`): how the backoffice
lets a tenant change its own template (likely post-MVP); how to generalise the
template architecture for future tenants beyond YourSpot; whether SaaS pricing
varies by template.

---

## 4. Stack — real vs stubbed

### Real / built

- **Frontend**: Next.js 16.2.12 (App Router), React 19.2.4, TypeScript,
  Tailwind CSS v4, next-intl 4.x. (`package.json`) Package name
  `saas-reservations`.
- **`src/proxy.ts`** — real per-request tenant + locale middleware
  (`saas_reservations#43`).
- **`src/lib/api.ts` / `src/lib/content.ts`** — real HTTP clients to the
  backend (`API_URL`, default `http://localhost:3010`). `api.ts` fetches
  tenant config + properties, keyed by `X-Tenant-Slug`, cached 1 h; throws on
  failure (404s the page). `content.ts` fetches per-tenant/locale editorial
  copy overrides and **deliberately fails soft** (a Content-service outage must
  never break an otherwise-renderable page).
- **Backend** (`saas_reservations-api`, separate NestJS repo, not in the local
  copy): real tenant model with presentation config, real Property/User/Content
  entities, RBAC (Tenant = admin, User = staff), JWT access+refresh, S3-style
  image storage, iCal import + export per property, Stripe Connect model
  chosen. The **7 real YourSpot properties and 4 real partners were entered via
  `/admin`** in Aug 2026 (`saas_reservations#85`–`#95`), replacing the seed's
  fictional data.
- **Backoffice**: `/admin` (platform-side) and `/gestao` (tenant-side) — full
  CRUD in dialogs, image upload, per-property iCal panel, theme toggle, i18n.
  (`src/app/admin/**`, `src/app/gestao/**`; `saas_reservations#59` map)
- **3 template component trees** — `src/components/{moderno,classico,luxo}/`,
  ~25 components each, all routes verified 200 in light + dark.
- **SEO**: `src/app/sitemap.ts`, `src/app/robots.ts`,
  `src/lib/structured-data.ts` (Organization + LodgingBusiness JSON-LD),
  hreflang in the root layout, GA4 gated on cookie consent, cookie-consent
  banner, `/privacidade` + `/cookies` + `/faq` pages.
  (`saas_reservations#29`, `#72` map; RGPD + cookie research docs)
- **Payments (partial)**: `src/app/api/checkout/route.ts` uses the real Stripe
  SDK (`stripe` ^22.4.0) to create a Checkout Session — re-fetches the property
  from the backend to re-validate guest counts server-side, computes
  `nights × (basePrice + child tax + pet tax)`. Requires `STRIPE_SECRET_KEY`.

### Stubbed / prototype / not done

- **`src/lib/mock-data.ts`** — prototype-era in-memory fictional data
  (7 Ria-de-Aveiro properties). Superseded by `src/lib/api.ts` but still in the
  tree; `CLAUDE.md` says new work must use the real API client.
- **`src/lib/tenant.ts` and the non-`yourSpotTheme` exports of
  `src/lib/tenant-theme.ts`** — "known stale code", hardcode a single
  `activeTenant`/`activeTheme` instead of resolving per request. Clássico/Luxo
  `Layout.tsx` have already migrated to `getTenantConfig()`; the static theme
  objects remain only as reference values.
- **Reservation engine** — no availability check against the iCal feeds, no
  Booking record, no Stripe webhook, no confirmation email. Map
  `saas_reservations#96` ("Motor de Reservas + Pagamentos + Notificações") is
  OPEN; `#98`–`#108` (state machine, `POST /bookings` spec, webhook spec,
  dedup/loop prevention for bidirectional iCal, backoffice reservation screens,
  SMTP sending) are all still open grillings/tasks as of 2026-09-07.
- **`TENANT_SLUG` / `TEMPLATE` env vars** — legacy fallback only; the
  `dev:<template>` and `build:<template>` npm scripts + `distDir` namespacing
  (`.next-<template>`) survive from the prototype demo era.
- **`resolveFontPairId()`** — wired but does not branch to a second real font
  pair yet.
- **Domains** — `next.config.ts` `allowedDevOrigins` and the structured-data
  base URL use `*.example.com` placeholders (`yourspot.example.com`,
  `vistadouro.example.com`). No real domain configured.
- **No test suite** (`CLAUDE.md`).

### Backend stack decisions (context, from `saas_reservations#8`–`#28`)

NestJS + Docker Compose + Prisma + PostgreSQL (managed) + JWT access+refresh +
S3-compatible storage + Stripe Connect + `@nestjs/schedule` for iCal sync +
transactional email + booking-confirmation PDF. Hosting: VPS + CI/CD. Monorepo
vs split-repo: **split** — this frontend repo is frontend-only.

---

## 5. Setting & content detail (for copy / screenshots)

- **Setting**: Ria de Aveiro (Beira Litoral) — canals, moliceiro boats, the
  candy-striped fishermen's huts of Costa Nova, the region's salt pans.
  6 properties around Aveiro/Ílhavo + 1 in Figueira da Foz.
  (`src/lib/mock-data.ts`; `saas_reservations#7` follow-ups)
- **Moderno palette** `yourSpotTheme` (`src/lib/tenant-theme.ts`):
  light — text `#1C2333`, bg `#F2EDE2`, surface `#FFFDF9`, primary (Costa Nova
  stripe red) `#C23B2E`, secondary (canal teal) `#0F6E76`, muted `#7C8394`;
  dark — text `#EDE6D6`, bg `#141A24`, surface `#1D2530`, primary `#E1573F`,
  secondary `#2BA6A0`, muted `#8A93A6`.
- **Clássico palette** `classicoTheme`: light — telha `#8C3A1B`, azulejo
  `#1F5C6B`, parchment bg `#EFE6D6`; dark — bg `#211812`, primary `#D97A44`,
  secondary `#4FA0AF`. Signature: `.azulejo-lattice` diamond tile trellis
  divider + mat-frame photo treatment.
- **Luxo palette** `luxoTheme`: light — bone bg `#EDE8DC`, aged-brass primary
  `#7A5C2E`, bottle-green secondary `#163832`; dark — near-black bottle-green
  bg `#0D1613`, brightened brass `#C6A15B`, jade `#6FA69A`. Signature:
  `.luxo-facets` flor-de-sal crystal texture + sharp hairline-brass cards +
  a restrained `.luxo-enter` fade-up on hero copy only.
- **Booking required fields**: email + phone (client decision,
  `briefing-planeamento-plataforma.md`). Full payment at booking, no partial
  deposit. Cancellation: 15 days before stay (assumed uniform, per property).
  Pet fee charged at booking when applicable. Min nights configurable per
  property in the backoffice.
- **Site languages**: PT / EN / ES (YourSpot); Vista Douro is PT / EN / IT.

---

## 6. Deployed demo URL

**None exists.** The project runs locally only:

- `npm run dev:moderno` → `http://localhost:3000`
- `npm run dev:classico` → `http://localhost:3001`
- `npm run dev:luxo` → `http://localhost:3002` (`TENANT_SLUG=vistadouro`)
- `npm run proto` → all three at once (for side-by-side client demos)
- Backend expected at `http://localhost:3010` (`API_URL`)

No `vercel.app` / Netlify / other deployment URL appears anywhere in the repo,
issues, or research docs. `next.config.ts` and `structured-data.ts` reference
only `*.example.com` placeholder hosts. `saas_reservations#7` explicitly says
the prototype is run with `npm install && npm run dev` on localhost. Backend
hosting decision (`#15`, `#19`) was "VPS + CI/CD" but no live instance is
referenced.

---

## 7. Onboarding spreadsheets (existence noted, content not mined)

Per issue #3, noting these exist in `C:\Users\nunog\Desktop\Alojamentos`:

- `Requisitos-Reuniao-Cliente.xlsx` (12 KB) — pre-meeting requirements /
  "Decisões Técnicas" + "Perguntas de Descoberta" tabs; the source
  `briefing-planeamento-plataforma.md` was extracted from.
- `Checklist-Onboarding-Cliente-YourSpot.xlsx` (17 KB) — onboarding checklist.
- `Pendencias-Onboarding-Cliente-YourSpot.xlsx` (7.6 KB) — outstanding
  onboarding items (also `saas_reservations#92`).

The narrative content is already covered by `briefing-planeamento-plataforma.md`
and the `saas_reservations#85` onboarding map — the spreadsheets were not
opened for this dossier.

---

## 8. Source index

| Source | Location |
|---|---|
| Project README, agent guide | `C:\Users\nunog\Desktop\Alojamentos\README.md`, `CLAUDE.md` |
| Client discovery briefing | `…\Alojamentos\briefing-planeamento-plataforma.md` |
| Budget proposal | `…\Alojamentos\orcamento-yourspot.md` |
| Template registry | `…\Alojamentos\src\lib\templates.ts` |
| Per-tenant colour theme | `…\Alojamentos\src\lib\tenant-theme.ts` |
| Per-request tenant + locale middleware | `…\Alojamentos\src\proxy.ts` |
| Backend HTTP client | `…\Alojamentos\src\lib\api.ts`, `src\lib\content.ts` |
| Section registry + contracts | `…\Alojamentos\src\lib\sections.ts`, `src\components\<template>\sections\registry.tsx` |
| Root layout (CSS-var wiring, dark-mode script, SEO) | `…\Alojamentos\src\app\layout.tsx` |
| Per-template theme wrappers | `…\Alojamentos\src\components\{moderno,classico,luxo}\Layout.tsx` |
| Font-pair catalogue | `…\Alojamentos\src\lib\fonts.ts` |
| Stripe Checkout route | `…\Alojamentos\src\app\api\checkout\route.ts` |
| Build-time template config | `…\Alojamentos\next.config.ts` |
| Architecture research | `…\Alojamentos\docs\research\template-architecture-patterns.md` |
| RGPD / cookie research | `…\Alojamentos\docs\research\{rgpd-privacy-policy,cookie-consent-banner}.md` |
| Wayfinding map — template strategy | `AutoMendes/saas_reservations` issue #1 (+ children #2–#7) |
| Decision: 3 templates, visual only | `saas_reservations#3` |
| Research: template architecture patterns | `saas_reservations#4` |
| Decision: per-tenant template-switch architecture | `saas_reservations#5` |
| Decision: Moderno first | `saas_reservations#6` |
| Prototype: Moderno for YourSpot (+ 2 design iterations) | `saas_reservations#7` |
| Map: generalise frontend to real multi-tenancy | `saas_reservations#31` (children #32–#44) |
| Decisions: section registry / theme / config location | `saas_reservations#32`, `#33`, `#34` |
| Decision: per-request tenant + template resolution | `saas_reservations#43` |
| Decision: backend tenant resolution | `saas_reservations#23` |
| Map: i18n engine | `saas_reservations#46` (children #47–#57) |
| Map: backoffice | `saas_reservations#59` |
| Map: real YourSpot onboarding data | `saas_reservations#85` (children #86–#95) |
| Map: reservation engine + payments + notifications (OPEN) | `saas_reservations#96` (children #98–#108, open) |
| Backend stack map | `saas_reservations#8` (children #9–#28, #30) |
