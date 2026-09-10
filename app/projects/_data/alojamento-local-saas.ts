import type { CaseStudy } from "./types";

// Written from docs/research/yourspot-dossier.md (branch research/yourspot-dossier),
// which synthesises the project's own wayfinding map (AutoMendes/saas_reservations
// issue #1 and children) plus the local source at C:\Users\nunog\Desktop\Alojamentos.
// The platform has no product name of its own; "YourSpot" is the pilot tenant.
// Built with another developer — every architecture decision was made jointly on a
// shared map before the build was split into tasks. No public repo, no deployed demo.

const alojamentoLocalSaas: CaseStudy = {
  slug: "alojamento-local-saas",
  name: "Alojamento Local SaaS",
  tagline:
    "A multi-tenant booking platform that gives independent local-accommodation hosts a site of their own, off the big OTAs \u2014 one Next.js codebase serving three genuinely separate template designs, with each tenant's colour palette as a second, independent axis.",
  accent: "magenta",
  status: "in-progress",
  role: "Client SaaS \u00b7 built with another developer \u2014 architecture decided jointly",
  links: [],
  linksNote:
    "Private client project \u2014 no public repository or demo; the frontend runs locally against its own NestJS backend.",
  metaDescription:
    "A multi-tenant SaaS booking platform for local accommodation (\u201calojamento local\u201d). One Next.js codebase, three separate template designs, per-tenant theming, and the architecture behind serving many tenant sites from a single build.",
  card: {
    blurb:
      "Multi-tenant booking platform giving independent accommodation hosts a site of their own \u2014 three full template implementations over one shared booking engine, with the tenant resolved per request from the host.",
    stack: ["Next.js", "NestJS", "Prisma", "PostgreSQL", "Tailwind v4"],
    signatureStack: ["Next.js", "NestJS", "Tailwind v4"],
  },

  overview: [
    "The platform is a multi-tenant SaaS for booking local accommodation \u2014 \u201calojamento local\u201d, the Portuguese regulatory category for independent short-stay rentals. Its pitch is a booking site of your own: somewhere for a small host to take reservations directly, off Booking.com and the channel-manager commission. It has no product name of its own yet; the pilot client, YourSpot, is what you see when it runs.",
    "Every tenant gets their own public site, configured along two independent axes: which of three templates it runs \u2014 Moderno, Cl\u00e1ssico or Luxo \u2014 and which colour palette it wears, in light and dark. The booking rules underneath are common to every tenant; only the presentation varies. YourSpot, the pilot, is a real sole trader with seven properties around the Ria de Aveiro who came to this after a failed WordPress attempt.",
    "It was built with another developer as real client work: we ran a shared wayfinding map, decided the architecture together, then split the tasks. Honest status \u2014 the three template trees, the per-request middleware, a real NestJS backend with the pilot's actual property data, the backoffice, i18n and SEO are all built; the reservation engine, payment capture and notifications are still in specification, and there is no deployed demo. It's planning-stage client work, not a launched product.",
  ],

  architecture: {
    intro: [
      "One Next.js codebase serves every tenant. A per-request middleware (src/proxy.ts) resolves which tenant a request belongs to from its Host header, injects that as an internal header, and every server component downstream reads it \u2014 no component touches an env var or re-parses the domain. Two things then vary per tenant, independently: which of three template component trees renders, and which colour palette the CSS variables carry.",
    ],
    figures: [
      {
        caption:
          "Tenant resolution is per request. proxy.ts looks the full Host up against the backend (covering both a platform subdomain and a client's own domain), injects x-tenant-slug, and every server component reads it from there. Template and palette are two independent reads off the same tenant config.",
        ascii:
          "HTTP request (Host: yourspot.pt)\n   |\n   v\nsrc/proxy.ts (per-request middleware) --GET /tenants/by-domain/:host--> NestJS API\n   |  inject x-tenant-slug + x-locale\n   v\nServer Components -- getTenantConfig() (cached 1h)\n   |--- template --> getActiveTemplate() -> templates[tenant.template]\n   '--- theme ----> root Layout emits <style> --tenant-* from theme{light,dark}",
        diagram: {
          viewBox: [0, 0, 640, 420],
          aria:
            "Request lifecycle: an HTTP request reaches the proxy.ts middleware, which resolves the tenant from the Host header via a backend by-domain lookup and injects x-tenant-slug and x-locale headers; server components then read the tenant config once and branch independently to the template registry and to the per-tenant colour palette.",
          accentColor: "magenta",
          nodes: [
            { id: "req", x: 40, y: 24, w: 260, h: 44, label: ["HTTP request", "Host: yourspot.pt"] },
            { id: "proxy", x: 40, y: 108, w: 260, h: 44, label: ["src/proxy.ts", "per-request middleware"] },
            { id: "api", x: 372, y: 108, w: 244, h: 44, label: ["NestJS API", "GET /tenants/by-domain/:host"] },
            { id: "hdr", x: 40, y: 192, w: 260, h: 44, label: ["injected headers", "x-tenant-slug \u00b7 x-locale"] },
            { id: "sc", x: 40, y: 276, w: 260, h: 44, label: ["Server Components", "getTenantConfig() \u00b7 cached 1h"] },
            { id: "tmpl", x: 20, y: 356, w: 288, h: 48, label: ["getActiveTemplate()", "templates[tenant.template]"] },
            { id: "pal", x: 344, y: 356, w: 288, h: 48, label: ["root Layout \u2192 <style>", "--tenant-* from theme{light,dark}"] },
          ],
          edges: [
            { from: "req", to: "proxy", label: "Host header" },
            { from: "proxy", to: "api", label: "GET by-domain" },
            { from: "proxy", to: "hdr", label: "x-tenant-slug", accent: true },
            { from: "hdr", to: "sc", label: "next/headers" },
            { from: "sc", to: "tmpl", label: "template" },
            { from: "sc", to: "pal", label: "theme" },
          ],
        },
      },
      {
        caption:
          "Every route file under src/app/[locale] is a one-line dispatcher: it asks the registry for the active template and renders that template's page. Switching is on the tenant's template field, with no URL prefix. The three trees share data-type shapes and the booking rules \u2014 no markup.",
        ascii:
          "src/app/[locale]/page.tsx   (thin: return <getActiveTemplate().HomePage/>)\n        |  no URL prefix -- switch on tenant.template\n        v\nsrc/lib/templates.ts  templates[key] --+--> components/moderno/   (25 components)\n                                        +--> components/classico/  (25 components)\n                                        '--> components/luxo/      (25 components)",
        diagram: {
          viewBox: [0, 0, 640, 300],
          aria:
            "Template registry: thin route dispatchers under src/app/[locale] call getActiveTemplate, which indexes the templates record in src/lib/templates.ts by the tenant's template key and returns one of three separate component trees \u2014 moderno, classico or luxo \u2014 each with 25 components.",
          accentColor: "magenta",
          nodes: [
            { id: "route", x: 32, y: 40, w: 288, h: 46, label: ["src/app/[locale]/*", "thin page dispatchers"] },
            { id: "reg", x: 32, y: 150, w: 288, h: 48, label: ["src/lib/templates.ts", "templates: Record<TemplateKey,\u2026>"] },
            { id: "mod", x: 396, y: 104, w: 224, h: 40, label: ["components/moderno/", "25 components"] },
            { id: "cls", x: 396, y: 164, w: 224, h: 40, label: ["components/classico/", "25 components"] },
            { id: "lux", x: 396, y: 224, w: 224, h: 40, label: ["components/luxo/", "25 components"] },
          ],
          edges: [
            { from: "route", to: "reg", label: "no URL prefix", accent: true },
            { from: "reg", to: "mod" },
            { from: "reg", to: "cls" },
            { from: "reg", to: "lux" },
          ],
        },
      },
    ],
    notes: [
      "The three dev:<template> / build:<template> npm scripts and the .next-<template> build-cache namespacing survive from an earlier prototype phase, when the template was fixed per process by a TEMPLATE env var (see the decisions below). They no longer force a template \u2014 local switching is ?tenant=<slug>, sticky via a cookie.",
      "A second, fictional tenant \u2014 Vista Douro (Luxo template, aged-brass palette, PT/EN/IT) \u2014 exists only to prove the multi-tenancy is real: the same build, a different slug.",
    ],
  },

  decisions: [
    {
      tag: "routing",
      title: "Three template trees, not one re-skin",
      decision:
        "Each template is a genuinely separate component tree under src/components/<template>/ \u2014 25 components apiece, its own header, hero, property card, booking form and footer. Per page slot there are three implementations, resolved at render from the tenant's template field.",
      why: "A per-tenant look that's more than swapped colours means each template needs to own its composition and markup, not just its tokens. Moderno's rounded, soft-shadowed editorial style and Luxo's sharp hairline-brass cards can't come from the same JSX with different variables.",
    },
    {
      tag: "scope",
      title: "Templates differ visually only",
      decision:
        "The search filter, booking-form fields and validation, cancellation policy and reservation engine are identical across all three templates. Only presentation varies.",
      why: "The map's first framing assumed functionality would vary per template too. It doesn't \u2014 the client had already fixed the business rules, and three parallel booking engines would have tripled the surface with no benefit. Correcting that early kept the shared core genuinely shared.",
    },
    {
      tag: "theming",
      title: "Colour is a second axis, independent of template",
      decision:
        "A tenant's palette is a TenantTheme config (six tokens \u00d7 light/dark), chosen independently of which template they run. It's emitted as a <style> block of CSS custom properties; Tailwind v4 utilities resolve to those variables, so a palette swap needs no rebuild.",
      why: "Template and brand colour are two separate decisions a client makes. Wiring colour as config rather than fixed CSS means the pilot gets Moderno in Costa Nova stripe-red while a future client could get Moderno in their own palette \u2014 or Luxo, or Cl\u00e1ssico \u2014 with no code change.",
    },
    {
      tag: "config",
      title: "Presentation config lives on the backend tenant model",
      decision:
        "Template, palette, font pair and the per-page section list are fields on the backend Tenant model, returned in one public API call keyed by tenant slug and cached for an hour. The frontend holds no hardcoded tenant.",
      why: "Keeping presentation in the database is what lets a future backoffice let a tenant restyle their own site without a frontend deploy. The static theme objects still in the tree are now reference values only \u2014 the live path is the API.",
    },
    {
      tag: "evolution",
      title: "A prototype shortcut, named as one, with the seam pre-shaped",
      decision:
        "When the three prototype branches were first merged, which template rendered was chosen by a TEMPLATE env var read once per process \u2014 enough to run all three side by side for client demos. It was flagged in the commit as a throwaway, and the TemplateDefinition shape was designed as the unit per-request resolution would later consult.",
      why: "Because the seam was shaped up front, replacing the shortcut was additive, not a rewrite: proxy.ts now resolves the tenant per request from the full Host via a backend by-domain lookup, and getActiveTemplate() reads Tenant.template. One Next.js process serves all three templates dynamically.",
    },
    {
      tag: "structure",
      title: "Typed per-tenant section registry",
      decision:
        "Beyond the fixed page slots, page content is a typed, ordered list of sections stored as JSON on the tenant. Each template has its own registry mapping section type to component; an unknown section type is silently skipped, and a section component may never contain tenant-conditional logic \u2014 all variation comes through its config.",
      why: "It's Shopify's sections-and-blocks idea narrowed to what one real tenant needs, rather than building the full generic page builder up front. A tenant that doesn't configure a section simply doesn't render it; another can put a different section in the same slot.",
    },
    {
      tag: "i18n",
      title: "Unsupported locale is a 404, never a redirect",
      decision:
        "Each tenant declares which languages it supports. Routes live under src/app/[locale]; proxy.ts resolves the locale per request after the tenant is known. A path with a supported locale passes through; a two-letter locale the tenant doesn't support returns 404; a path with no locale is redirected to an Accept-Language match. Content is never served without a locale prefix.",
      why: "A silent redirect from an unsupported locale creates duplicate content in Google's index. A hard 404 keeps the crawlable surface exactly the set of locales each tenant actually offers.",
    },
    {
      tag: "backend",
      title: "Shared-schema multi-tenancy, isolation in a guard",
      decision:
        "One PostgreSQL schema with a tenant_id column on every table; a NestJS guard enforces isolation. Public requests carry an X-Tenant-Slug header validated against known tenants; authed requests carry a tenant_id JWT claim. The backend does not re-parse the subdomain.",
      why: "Schema-per-tenant and database-per-tenant were rejected as operational cost the platform's scale \u2014 many small tenants \u2014 doesn't justify. Resolving the tenant once, at the edge, and passing it explicitly avoids duplicating that logic on the backend.",
    },
  ],

  stack: [
    {
      layer: "Frontend",
      items: ["Next.js 16 (App Router)", "React 19", "TypeScript", "Tailwind CSS v4", "next-intl"],
    },
    {
      layer: "Multi-tenancy",
      items: ["src/proxy.ts (per-request middleware)", "Host \u2192 backend by-domain lookup", "injected x-tenant-slug / x-locale headers"],
    },
    { layer: "Backend", items: ["NestJS", "Prisma", "PostgreSQL", "JWT access + refresh", "@nestjs/schedule"] },
    { layer: "Payments", items: ["Stripe Checkout", "Stripe Connect (model chosen)"] },
    { layer: "Media & i18n", items: ["S3-compatible storage (presigned upload)", "next-intl (PT / EN / ES / IT)", "Google Cloud Translation"] },
    { layer: "Integrations", items: ["iCal import + export per property", "node-ical"] },
    { layer: "SEO", items: ["sitemap / robots", "JSON-LD (Organization + LodgingBusiness)", "hreflang", "GA4 gated on consent"] },
    { layer: "Process & tooling", items: ["shared GitHub wayfinding map", "split repos (frontend / API)", "Docker Compose (Postgres)"] },
  ],

  stats: [
    { value: "3", label: "template designs" },
    { value: "25", label: "components per template" },
    { value: "\u00d72", label: "independent config axes" },
    { value: "9", label: "shared routes" },
    { value: "4", label: "supported locales" },
    { value: "7", label: "real pilot properties" },
  ],
  statsNote:
    "The three templates all render every route with a 200 in light and dark. The backend holds the pilot client's seven real properties and four real partners, entered through the backoffice. There is no test suite and no deployed instance; the reservation engine, Stripe webhook and confirmation emails are specified but not built.",

  reality: {
    intro:
      "Where the project actually stands \u2014 the parts that are built, and the parts that are still a specification.",
    rows: [
      {
        claim: "multi-tenant SaaS",
        reality:
          "Two tenants exist: the real pilot client, YourSpot (Moderno), and a fictional one, Vista Douro (Luxo), built purely to prove the same codebase serves a different slug, template, palette and locale set. No paying customers, not launched.",
      },
      {
        claim: "booking platform",
        reality:
          "You can search, pick dates and guests, and reach a Stripe Checkout session \u2014 but there's no availability check against the iCal feeds, no booking record, no payment webhook and no confirmation email yet. The reservation engine is an open map on the project's tracker.",
      },
      {
        claim: "three templates",
        reality:
          "All three component trees are built and verified. YourSpot runs Moderno and Vista Douro runs Luxo; Cl\u00e1ssico is complete but has no tenant assigned to it.",
      },
      {
        claim: "per-tenant theming with no rebuild",
        reality:
          "True \u2014 palettes are CSS custom properties resolved by Tailwind v4 at runtime. The older static theme objects still sit in the source tree, flagged as \u201cknown stale code\u201d, superseded by the backend-driven path.",
      },
      {
        claim: "tenant resolved from its domain",
        reality:
          "Wired through a real backend by-domain lookup. But no real domain is configured \u2014 the code uses *.example.com placeholders and the site runs on localhost only; local template switching is a ?tenant= query parameter.",
      },
    ],
  },

  cta: {
    blurb:
      "Built with another developer as real client work. We ran a shared wayfinding map, worked out the template architecture and every major decision together, then divided the build \u2014 the multi-tenant seam, the theming axis and the backoffice among them.",
  },
};

export default alojamentoLocalSaas;
