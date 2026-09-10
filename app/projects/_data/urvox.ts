import type { CaseStudy } from "./types";

// Written from docs/research/urvox-dossier.md (branch research/urvox-dossier) and the
// public repo Rekrl/urvox. Dev correction, post-dossier: Urvox is the dev's own solo
// project, still in development. NOT academic and NOT a group project: the dossier's
// "Task 7 / group of four" section over-reads a same-folder course assignment; the
// course task only seeded the idea. Next direction: a real blockchain for the citizen
// wallet / accounts.

const urvox: CaseStudy = {
  slug: "urvox",
  name: "Urvox",
  tagline:
    "A single hub for a city, its citizens and its town hall \u2014 built on a public record of the events that matter, so trust can be checked rather than just asked for. A navigable prototype, honest about what's simulated.",
  accent: "orange",
  status: "prototype",
  role: "Solo \u00b7 my own project, still in active development",
  links: [{ label: "github.com/Rekrl/urvox", href: "https://github.com/Rekrl/urvox" }],
  metaDescription:
    "Urvox: a navigable prototype of a citizen\u2013city\u2013municipality hub built around a public SHA-256 hash-chained event ledger. The transparency model, the deliberate simplifications, and why it's a hash chain and not a blockchain \u2014 yet.",
  card: {
    blurb:
      "A civic hub linking city, citizen and town hall around a public, tamper-evident record of the events that matter. A navigable prototype \u2014 real SHA-256 hash chain, simulated sensors, every simplification flagged in the UI.",
    stack: ["Next.js 16", "TypeScript", "Tailwind v4", "SHA-256 hash chain"],
    signatureStack: ["Next.js 16", "TypeScript", "SHA-256 hash chain"],
  },

  overview: [
    "Urvox \u2014 \u201ca cidade tem voz\u201d, the city has a voice \u2014 is a single place where a city, its citizens and its town hall meet: the city's live data (waste bins, street lighting, air quality, traffic) in one panel, a way for a citizen to report a problem and follow what happens next, and a channel for the municipality to publish works, road closures and notices. The conviction behind it is plain \u2014 municipal decisions carry a lot of fog, and civic involvement barely exists between elections; a city you can actually read, with a record you can actually check, is worth trying to build.",
    "The trust primitive runs through everything: every event that matters \u2014 a bin collected, a report resolved, a streetlight fixed \u2014 is written to a public, hash-chained ledger that anyone can re-verify. Personal data never enters it. Trust between the city and the citizen stops being \u201cbelieve because you're told\u201d and becomes something you can check for yourself.",
    "It's a navigable prototype and it says so everywhere it matters: the sensors are software-generated, the map is a hand-drawn illustration, the ledger is a real SHA-256 hash chain but runs locally in memory, and the login is symbolic \u2014 each of those is flagged in the interface where you meet it. The seed of the idea came from a course exercise; everything since \u2014 the prototype and where it's going \u2014 has been mine, built solo and still in progress. The next direction is a real blockchain for the citizen wallet and accounts.",
  ],

  architecture: {
    intro: [
      "One Next.js app is the whole thing \u2014 the citizen-facing pages, the API route handlers, and the simulation behind them. There is no database, no external service and no API key: `npm install && npm run dev` and it self-seeds. A simulator ticks every four seconds, mutating an in-memory store and appending a block to the hash-chain ledger whenever something ledger-worthy happens; the pages poll the API every few seconds and the transparency page re-verifies the whole chain on every load.",
    ],
    figures: [
      {
        caption:
          "One app, no infrastructure. The simulator stands in for sensor hardware, but the path an event takes \u2014 mutate the store, append a ledger block, expose it for verification \u2014 is the real one, the same whether the input is a simulated bin or a real one.",
        ascii:
          "browser (client pages)  --poll 4-5s, fetch JSON-->  Next.js route handlers  (/api/bins /air /traffic /ledger ...)\n   session in localStorage                                   |  get*() lazily starts the simulator\n                                                             v\n                                  simulator.ts  --tick every 4s-->  mutates store.ts (globalThis, in-memory)\n                                       |\n                             append a block on each event\n                                       v\n                                  ledger.ts  (SHA-256 chain: append + verify)  -->  chain lives in store.ts",
        diagram: {
          viewBox: [0, 0, 640, 372],
          aria:
            "Urvox architecture, three layers: the browser polls Next.js route handlers; the handlers lazily start an in-process simulator that ticks every four seconds; the simulator mutates an in-memory store and appends a SHA-256 block to the ledger on each event. No database.",
          accentColor: "orange",
          tiers: [
            { label: "browser", accent: "orange", x: 12, y: 24, w: 616, h: 76 },
            { label: "next.js route handlers", accent: "cyan", x: 12, y: 144, w: 616, h: 76 },
            { label: "in-process \u2014 no database", accent: "purple", x: 12, y: 264, w: 616, h: 88 },
          ],
          nodes: [
            { id: "browser", x: 180, y: 40, w: 280, h: 44, label: ["browser \u2014 client pages", "poll 4\u20135s \u00b7 session in localStorage"] },
            { id: "api", x: 180, y: 160, w: 280, h: 44, label: ["Next.js route handlers", "/api/bins /air /traffic /ledger \u2026"] },
            { id: "store", x: 16, y: 284, w: 172, h: 52, label: ["store.ts", "globalThis \u00b7 in-memory"] },
            { id: "sim", x: 224, y: 284, w: 152, h: 52, label: ["simulator.ts", "tick 4s \u00b7 seed + mutate"] },
            { id: "ledger", x: 456, y: 284, w: 168, h: 52, label: ["ledger.ts", "SHA-256 \u00b7 append + verify"] },
          ],
          edges: [
            { from: "sim", to: "store" },
            { from: "sim", to: "ledger", label: "per event", accent: true },
          ],
          bandEdges: [
            { from: 0, to: 1, x: 320, label: "poll \u00b7 fetch JSON" },
            { from: 1, to: 2, x: 320, label: "get*() lazily starts the simulator" },
          ],
        },
      },
      {
        caption:
          "The transparency contract. A report splits: the parts that make the city's conduct auditable go on the public chain; the parts that identify the citizen stay in memory, keyed by an opaque id, and the photo is deleted when the report is resolved.",
        ascii:
          "                 citizen report / city event\n                  |                        |\n       recorded publicly            stays with the citizen\n                  v                        v\n   LEDGER BLOCK                     report object (in-memory)\n   type . zone . category           name . description . location . photo\n   timestamps . hash                        |\n        |                            photo cleared when resolved\n        v                                   v\n   /transparency (SHA-256, anyone re-verifies)   report.photo = null",
        diagram: {
          viewBox: [0, 0, 640, 360],
          aria:
            "Urvox transparency model: a citizen report or city event is split \u2014 event type, zone, category, timestamps and hashes are recorded on the public ledger and exposed on the transparency page for anyone to re-verify; the citizen's name, description, exact location and photo stay in the in-memory report object, and the photo is cleared when the report is resolved.",
          accentColor: "orange",
          nodes: [
            { id: "event", x: 40, y: 28, w: 264, h: 48, label: ["citizen report / city event", "collection, fix, critical reading"] },
            { id: "block", x: 40, y: 160, w: 288, h: 56, label: ["ledger block", "type \u00b7 zone \u00b7 category \u00b7 timestamps \u00b7 hash"] },
            { id: "priv", x: 372, y: 160, w: 240, h: 56, label: ["report object \u2014 in-memory", "name \u00b7 description \u00b7 location \u00b7 photo"] },
            { id: "pub", x: 40, y: 280, w: 288, h: 48, label: ["/transparency", "public \u00b7 re-verifies the whole chain"] },
            { id: "gone", x: 372, y: 280, w: 240, h: 48, label: ["photo cleared on resolve", "report.photo = null"] },
          ],
          edges: [
            { from: "event", to: "block", label: "recorded publicly", accent: true },
            { from: "event", to: "priv", label: "stays with the citizen" },
            { from: "block", to: "pub", label: "SHA-256" },
            { from: "priv", to: "gone", label: "when resolved" },
          ],
        },
      },
    ],
    notes: [
      "Eight event types produce a ledger block: a bin going critical, a collection, a report created / in progress / resolved, a streetlight reported / repaired, and an air station going critical. Each block's data payload carries only ids, zone and category.",
      "The landing page frames this as an early pilot with a longer roadmap the product sets for itself \u2014 real maps, a public chain, real sensors and cameras, a municipality admin channel, verified digital identity (Chave M\u00f3vel Digital), participatory budgeting, and an open-data API.",
    ],
  },

  decisions: [
    {
      tag: "trust",
      title: "A public hash-chained ledger of the city's conduct",
      decision:
        "Every ledger-worthy event \u2014 a bin collected, a report resolved, a streetlight fixed \u2014 appends a SHA-256 block whose hash commits to the previous block's digest. The /transparency page re-fetches and re-verifies the entire chain on a five-second interval, showing a chain-valid banner and the block timeline.",
      why: "Trust between a city and its citizens shouldn't rest on \u201cbelieve because you're told\u201d. A record the citizen can re-check themselves \u2014 was the bin actually collected, was the report actually resolved \u2014 is a different kind of promise from a dashboard number.",
    },
    {
      tag: "privacy",
      title: "The ledger records conduct, not people",
      decision:
        "A ledger block's data payload is only ids, zone and report category. The citizen's name, description, exact location and photos never touch the chain \u2014 they live in the in-memory report object, associated by an opaque report id.",
      why: "A public audit log must not quietly become a public dossier on citizens. The job of the chain is to make the municipality auditable; keeping personal fields off it, by construction, is what lets the log stay fully public.",
    },
    {
      tag: "scope",
      title: "A hash chain, not a blockchain \u2014 yet",
      decision:
        "It's a genuine SHA-256 hash chain \u2014 tampering with a past block is detected by re-verification \u2014 but it's single-writer, in-memory, not distributed, has no consensus or signatures, and resets to genesis on restart.",
      why: "The idea under test is the transparency contract, not the consensus mechanism. A local chain is enough to show a citizen \u201chere is the tamper-evident record, verify it yourself\u201d. Moving the ledger to a public network is a deliberate later step \u2014 its point is to remove Urvox itself as the party you have to trust.",
    },
    {
      tag: "honesty",
      title: "Simulation over integration \u2014 real architecture, fake inputs",
      decision:
        "The sensors, the map and the identity layer are all simulated. The architecture around them isn't: an event flows through the same path \u2014 mutate the store, append a ledger block, expose it for verification \u2014 whether it started as a simulated bin reading or a real one.",
      why: "It makes the prototype an honest test of the design rather than a mock-up. The pitch is \u201cthis is the architecture that would scale to a whole city\u201d, and that only holds if the architecture is actually the real one.",
    },
    {
      tag: "honesty",
      title: "Every simplification is flagged in the UI",
      decision:
        "Four deliberate shortcuts \u2014 software-generated sensors, an illustrated map, a local in-memory ledger, and a symbolic login \u2014 and every screen that leans on one says so, in place, alongside a note on what the real version would do.",
      why: "A prototype that hides its seams teaches people to distrust the real thing later. Saying \u201cthis is simulated \u2014 here's what production would do\u201d is part of the pitch, not a disclaimer bolted onto it.",
    },
    {
      tag: "privacy",
      title: "Privacy controls as first-class UI",
      decision:
        "The report form states which fields are public before you fill it in. Photos are offered only for a broken streetlight, size-capped, and deleted when the report closes. GDPR data export and account deletion are real buttons, honestly stubbed with a \u201cin production this triggers the GDPR flow\u201d notice.",
      why: "The right to erasure and informed consent are designed into the screens even though the backend is a demo \u2014 they're the product, not the fine print. Building the erasure button now keeps the data model honest about what it would have to support.",
    },
    {
      tag: "infra",
      title: "One Next.js app, no infrastructure",
      decision:
        "Pages, API, simulation and ledger are one Next.js project with an in-memory store and Node's built-in crypto. No database, no API keys, no paid dependencies.",
      why: "It has to be runnable by anyone it's pitched to \u2014 on a laptop, with `npm install`. The heavier stack a full build would need is a roadmap item, not a prerequisite for the conversation.",
    },
    {
      tag: "modelling",
      title: "Street lighting has no sensors \u2014 on purpose",
      decision:
        "Streetlight status changes only through citizen reports and the work orders they generate, with a UI note: \u201cno sensors, as it works in most municipalities today\u201d.",
      why: "It models the real starting point instead of assuming instrumentation that isn't there, and turns that gap into a reason the platform is useful now rather than only after a sensor rollout.",
    },
  ],

  stack: [
    {
      layer: "Framework",
      items: ["Next.js 16 (App Router \u2014 pages + route handlers)", "React 19", "TypeScript 5"],
    },
    {
      layer: "Styling",
      items: ["Tailwind CSS v4", "CSS custom-property design tokens", "reserved \u201csignal\u201d hue for live indicators"],
    },
    { layer: "Ledger", items: ["Node.js built-in crypto (createHash)", "no blockchain library"] },
    { layer: "State", items: ["in-memory object on globalThis", "no database", "no persistence"] },
    { layer: "Simulation", items: ["setInterval 4s", "lazily started on first API hit"] },
    { layer: "External services", items: ["none \u2014 no API keys, no paid dependencies"] },
    { layer: "Type & tooling", items: ["Source Serif 4 \u00b7 Public Sans \u00b7 IBM Plex Mono", "ESLint 9", "PostCSS"] },
  ],

  stats: [
    { value: "1", label: "Next.js app \u2014 front + back" },
    { value: "SHA-256", label: "hash-chain ledger" },
    { value: "4", label: "deliberate simplifications, each flagged" },
    { value: "8", label: "ledger event types" },
    { value: "0", label: "databases / API keys" },
    { value: "4s", label: "simulation tick" },
  ],
  statsNote:
    "No persistence \u2014 the store lives on globalThis, so a server restart wipes the bins, the reports and the whole ledger back to genesis. That's a real limitation given the transparency pitch, and it's one of the first things a public-chain migration would fix.",

  reality: {
    intro:
      "A prototype that's honest about being one \u2014 here is exactly where the seams are.",
    rows: [
      {
        claim: "a public tamper-evident ledger",
        reality:
          "It's a real SHA-256 hash chain and tampering with a past block is detected \u2014 but it's single-writer and in-memory with no external anchor. Someone with server access could rewrite a block and recompute every forward hash, and verification would pass again. Tamper-evident against naive edits, not tamper-proof.",
      },
      {
        claim: "blockchain",
        reality:
          "Not one \u2014 no distribution, no consensus, no signatures, no persistence. The privacy screen says \u201cblockchain\u201d in a couple of spots where the transparency screen more carefully says \u201chash-chained ledger\u201d. The ledger is the honest word.",
      },
      {
        claim: "live city data",
        reality:
          "The bins, air stations and traffic routes are software-generated; the map is a hand-drawn illustration; the streetlights have no sensors at all. Each of these is labelled as simulated in the screen where you meet it.",
      },
      {
        claim: "sign in",
        reality:
          "The login is symbolic \u2014 a name and a zone written to localStorage, no password and no server-side identity. The API filters a citizen's reports by a plain name string. It's a demo of the flow, not real auth.",
      },
      {
        claim: "photos are stored encrypted",
        reality:
          "The privacy page says that; the code doesn't. Photos are held as base64 in the in-memory store and nulled out when the report resolves. The report form's own wording \u2014 \u201cdeleted as soon as the request is resolved\u201d \u2014 is the accurate one.",
      },
    ],
  },

  cta: {
    blurb:
      "My own project \u2014 built solo, still in development, outside any academic or client brief. The idea was seeded by a course exercise; everything since has been mine. Next up: a real blockchain for the citizen wallet and accounts.",
  },
};

export default urvox;
