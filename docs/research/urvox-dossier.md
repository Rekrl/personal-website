# Urvox / SmartCity — Fact Dossier

Research ticket: `Rekrl/personal-website` issue #5 (`wayfinder:research`), part of #1.
Compiled for the deep case-study page. Every claim is cited to a source file.

Sources consulted:
- Local project source (read-only): `C:\Users\nunog\Desktop\SmartCity\app` — `README.md`, `src/app/**`, `src/lib/**`, `src/components/**`, `package.json`, `AGENTS.md`.
- Originating assignment: `C:\Users\nunog\Desktop\SmartCity\Task728447.pdf` (text extracted with `pdftotext`).
- Public repo `Rekrl/urvox` (GitHub API): tree, `README.md`, `package.json`, issues, deployments, pages.

---

## 1. What it is

**Urvox — "A cidade tem voz" ("the city has a voice").** A single citizen-facing
hub that sits at the meeting point of three parties:

- **the city** — its sensors and data (waste bins, street lighting, air quality, traffic);
- **the citizen** — who reports problems and is kept informed;
- **the municipality / câmara** — which communicates works, road closures, events and notices.

Source: `SmartCity/app/README.md` "Parte 1 — A ideia"; `Rekrl/urvox` description ("Piloto SmartCity que liga cidade, cidadão e câmara").

**The trust primitive.** The principle that runs through the whole platform:
*every relevant event is recorded publicly and tamper-evidently*, so trust between
city and citizen does not rely on "believing for the sake of believing" — it can be
verified. This is implemented as a public, hash-chained **livro-razão** (ledger)
that anyone can audit. Personal data never enters it.
Source: `README.md` "Parte 1"; `src/app/transparency/page.tsx`.

**What the platform covers** (`README.md` "O que a plataforma cobre"):
- The city in real time — bins, public lighting, air quality, traffic in one panel.
- The citizen's voice — report problems (with a photo where it makes sense) and follow what happens next.
- The municipality communicating — works, road cuts, events, notices in one place.
- Verifiable trust — a public ledger of the events that matter (not personal data).
- Privacy as a value, not fine print — the citizen controls what they share; what is no longer needed is deleted.

**Fictional pilot city:** "Vilanova" (`src/app/page.tsx` hero badge: "Piloto SmartCity · Vilanova"). Two zones: **Zone A** (urban centre, high density) and **Zone B** (suburb, families and elderly) — carried over verbatim from the assignment's pilot-zone selection (`Task728447.pdf`, "FASE 0 … Seleção de Zonas Piloto").

**Internal/earlier name:** the in-memory store global is `__citypulseStore` (`src/lib/store.ts`) and the auth localStorage key is `urvox.citizen` — the project was renamed to Urvox at some point; "CityPulse" survives only in code internals.

---

## 2. Honest status — navigable prototype, and every simplification is flagged in the UI

The README is explicit (`README.md` "Estado atual"):

> "O que já existe é um protótipo navegável com todas as áreas acima representadas —
> mas, propositadamente, com simulação em vez de infraestrutura real: os sensores são
> gerados por software, o mapa é uma ilustração própria, o livro-razão é uma cadeia de
> hashes real mas corre localmente, e o login é simbólico. Cada uma destas
> simplificações está sinalizada na própria interface."

Translation of the four deliberate simplifications:
1. **Sensors are software-generated** (no IoT hardware).
2. **The map is a hand-drawn illustration** (no real geolocation).
3. **The ledger is a real hash chain but runs locally** (not a real blockchain / not distributed / not persisted).
4. **Login is symbolic** (no password, no verified identity).

### Where each simplification is flagged in the UI (verified in source)

| Flag text (pt-PT) | Location |
|---|---|
| "protótipo de demonstração · dados simulados · nenhum dado real é recolhido" | landing footer — `src/app/page.tsx:214` |
| "Este protótipo prova a ideia com dados simulados — a arquitetura é a mesma que escalaria para uma cidade inteira." | landing hero — `src/app/page.tsx:90` |
| "cada um com o seu estado, aqui simulado para a demo." | landing "Como funciona" — `src/app/page.tsx:41` |
| "Nível básico, apenas para esta demonstração — sem palavra-passe, sem dados reais." | login — `src/app/login/page.tsx:34` |
| "a identidade fica apenas neste dispositivo (localStorage) · nada é enviado para um servidor real" | login footer — `src/app/login/page.tsx:86` |
| "Contentores, iluminação, ar e trânsito — sensores simulados, atualizados ao vivo." | city hub layout — `src/app/city/layout.tsx:8` |
| "Nível de enchimento simulado, atualizado a cada poucos segundos." | bins tab — `src/app/city/page.tsx:42` |
| "Estado dos postes reportado pelos cidadãos — sem sensores, tal como acontece hoje na maioria dos municípios." | lighting tab — `src/app/city/lighting/page.tsx` |
| "Congestionamento simulado por via principal — hoje baseado em câmaras de tráfego, no roadmap." | traffic tab — `src/app/city/traffic/page.tsx:31` |
| "PM2.5 simulado por estação." | air tab — `src/app/city/air/page.tsx:34` |
| "Métricas calculadas a partir da atividade real desta sessão de demonstração." / "dados gerados pela simulação local desta demonstração, não refletem uma cidade real" | stats — `src/app/stats/page.tsx:66,104` |
| "categoria e zona ficam no livro-razão público; o seu nome, descrição e fotos ficam apenas consigo." | report form — `src/app/report/page.tsx:138` |
| "Projeções do plano original … a referência de impacto que este piloto ajuda a validar." | landing impact stats — `src/app/page.tsx` |
| "Demonstração: em produção, isto geraria uma exportação GDPR…" / "…fluxo de eliminação de conta (GDPR)." | privacy GDPR buttons — `src/app/privacy/page.tsx:187,193` |

### Honesty caveats worth noting (places the UI is slightly *ahead* of the code)

- **Privacy page overclaims vs. report page.** `src/app/privacy/page.tsx` says photos are "armazenadas encriptadas" (stored encrypted). In reality photos are base64 data URLs held in the in-memory store and simply nulled out on resolution (`src/lib/simulator.ts` — `report.photo = null` in the resolve branch; `src/lib/types.ts:92` "base64 data URL, cleared once resolved"). The **report page** is more honest: "Usada apenas para gerar a ordem de serviço — é apagada assim que o pedido é resolvido" (`src/app/report/page.tsx:215`).
- **Privacy page says "Na blockchain"** (`src/app/privacy/page.tsx`), while the transparency page more carefully says "livro-razão encadeado por hash" (`src/app/transparency/page.tsx`). Same object, looser wording on the privacy screen.
- **No server-side auth at all.** API routes do not check identity; `GET /api/reports?citizen=<name>` filters by a plain name string (`src/app/api/reports/route.ts`), so any client could read another citizen's reports by guessing the name. Consistent with "login is symbolic" but not separately called out.
- **No persistence.** The store is `globalThis.__citypulseStore` (`src/lib/store.ts`); a server restart wipes bins, reports and the entire ledger. The simulator re-seeds and the chain restarts from genesis.

---

## 3. Architecture (draw-a-diagram level)

### 3.1 High-level

```
┌─────────────────────────────────────────────────────────────────┐
│  Next.js 16 App Router — single project, frontend + backend      │
│                                                                 │
│  Browser (client components)          Server (route handlers)    │
│  ┌───────────────────────────┐        ┌────────────────────────┐ │
│  │ /dashboard /city/* /report │  fetch │ /api/bins   /api/air   │ │
│  │ /transparency /stats /news │ ─────► │ /api/lighting /api/traffic│
│  │ /privacy /login  (landing) │  JSON  │ /api/news  /api/reports │ │
│  │                            │ ◄───── │ /api/ledger            │ │
│  │ poll every 4–5 s           │        └───────────┬────────────┘ │
│  │ session = localStorage     │                    │              │
│  └───────────────────────────┘                    ▼              │
│                                   ┌─────────────────────────────┐ │
│                                   │ src/lib/simulator.ts        │ │
│                                   │  - seeds bins/lights/air/…   │ │
│                                   │  - setInterval(tick, 4000)   │ │
│                                   │  - mutates store, emits      │ │
│                                   │    ledger blocks on events   │ │
│                                   ├─────────────────────────────┤ │
│                                   │ src/lib/ledger.ts (SHA-256   │ │
│                                   │  hash chain, append + verify)│ │
│                                   ├─────────────────────────────┤ │
│                                   │ src/lib/store.ts             │ │
│                                   │  globalThis.__citypulseStore │ │
│                                   │  (in-memory, not persisted)  │ │
│                                   └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
No external database. No API keys. No paid dependencies. `npm install && npm run dev`.
```
Source: `README.md` "Parte 2 — Stack / Estrutura do projeto"; `src/lib/*`; `src/app/api/*`.

### 3.2 Next.js route map

Pages (`src/app/**/page.tsx`):

| Route | File | Type | Notes |
|---|---|---|---|
| `/` | `app/page.tsx` | Server component | Marketing landing: pitch, 4 pillars, "Como funciona", impact projections, roadmap teaser ("Este piloto é a Fase 0"), CTAs to `/login` and `/transparency`. |
| `/login` | `app/login/page.tsx` | Client | Symbolic login — name + zone (A/B). Writes `{name, zone}` to `localStorage["urvox.citizen"]`, routes to `/dashboard`. |
| `/dashboard` | `app/dashboard/page.tsx` | Client | Personal panel. Redirects to `/login` if no session. Aggregates `/api/bins`, `/api/reports?citizen=`, `/api/ledger`, `/api/air`, `/api/traffic`, `/api/news`; polls every 5 s. |
| `/city` | `app/city/page.tsx` (+ `app/city/layout.tsx` with `CityTabs`) | Client | Bins tab: illustrated `CityMap` + list, zone filter, sparklines. Polls `/api/bins` every 4 s. |
| `/city/lighting` | `app/city/lighting/page.tsx` | Client | Streetlights (citizen-reported, no sensors) + work orders. Polls `/api/lighting`, `/api/reports`. |
| `/city/air` | `app/city/air/page.tsx` | Client | Air stations, PM2.5, thresholds boa <20 / moderada 20–40 / má >40. Polls `/api/air`. |
| `/city/traffic` | `app/city/traffic/page.tsx` | Client | Traffic routes, congestion sparklines. Polls `/api/traffic`. |
| `/report` | `app/report/page.tsx` | Client | Citizen report flow: category, optional bin/streetlight, optional photo (≤3 MB, `poste_avariado` only), description. POSTs `/api/reports`. Lists the citizen's own reports + work-order reference. |
| `/transparency` | `app/transparency/page.tsx` | Client | Public ledger explorer. Polls `/api/ledger` every 5 s, shows chain-valid banner, block count, "SHA-256 · verificação recomputada a cada carregamento", timeline of blocks with truncated `hash` / `prev`, and a "what is / is never on the chain" sidebar. |
| `/stats` | `app/stats/page.tsx` | Client | Sustainability metrics computed client-side from `/api/bins`, `/api/reports`, `/api/ledger` (collections count, resolution rate, ok bins, ledger events, "recolhas por minuto" bar chart). |
| `/news` | `app/news/page.tsx` | Client | Municipal news/alerts (obra / evento / aviso), category filter, scheduled/live/ended state. Reads `/api/news`. |
| `/privacy` | `app/privacy/page.tsx` | Client | Privacy controls (level, location sharing, photo blur/metadata), all persisted to `localStorage["urvox.privacy"]` only. GDPR export/delete buttons are stubs that show a "demonstração" notice. |

Layouts: `app/layout.tsx` (root — fonts, `<Nav>`), `app/city/layout.tsx` (city hub heading + tabs). `Nav` hides itself on `/` and `/login` (`src/components/Nav.tsx`).

Fonts (`app/layout.tsx`): Source Serif 4 (display), Public Sans (body), IBM Plex Mono (hashes/timestamps). Note: the README's "Parte 2 — Identidade visual" still names **Fraunces + IBM Plex Sans**; the code has since moved to **Source Serif 4 + Public Sans**. Palette tokens in `src/app/globals.css` also differ from the README: README says the single accent is lime `#C6FF4F`; the code splits this into `--signal: #c6ff4f` (reserved for "ao vivo"/registered indicators) and a separate interactive `--accent: #b99857` (bronze) for CTAs/links.

### 3.3 API routes and what backs them

All under `src/app/api/*/route.ts`. Every read route calls `startSimulator()` (via the `get*()` helpers in `src/lib/simulator.ts`), which lazily seeds the store and starts the 4 s tick on first request.

| Route | Methods | Backing | Real or simulated |
|---|---|---|---|
| `/api/bins` | GET | `getBins()` → `store.bins` | **Simulated.** 16 seeded bins (`SEED_BINS`), fill level grows 2–6 %/tick, random collection when ≥75 %. |
| `/api/lighting` | GET | `getStreetlights()`, `getWorkOrders()` | **Simulated + citizen-driven.** 10 seeded lights, all start `ok`; status only changes via citizen reports / resolutions. Work orders created on `poste_avariado` reports. |
| `/api/air` | GET | `getAirStations()` → `store.airStations` | **Simulated.** 2 stations, PM2.5 random walk (±, clamped 3–80). |
| `/api/traffic` | GET | `getTrafficRoutes()` → `store.trafficRoutes` | **Simulated.** 6 routes, congestion random walk, `etaDeltaMin = congestion/12`. |
| `/api/news` | GET | `getNews()` → `store.newsItems` | **Static seed.** 5 hard-coded items (`SEED_NEWS`) with dates relative to now (works, lighting maintenance, Feira de S. Mateus, participatory-budget session, bulky-waste collection). |
| `/api/reports` | GET, POST | `getReports()`, `createReport()` | **Real user input** (kept in memory). GET filters by `?citizen=` name string. POST validates category/zone/description/photo (photo must be `data:image/…`, ≤ ~4.2 MB), truncates description to 500 chars, appends a ledger block. |
| `/api/ledger` | GET | `getLedger()` + `verifyLedger()` | **Real hash chain** over simulated+real events. Returns `blocks` (reversed, newest first) and `verification: {valid, brokenAtIndex}`. |

There is no admin/municipality API and no write path other than `POST /api/reports`. News, works and "the câmara communicating" are seed data only — the municipality-facing channel is roadmap (`README.md` "Um canal para a câmara").

### 3.4 The hash-chain ledger (`src/lib/ledger.ts`) — and how "real ledger, runs locally" holds up

**Implementation (verbatim behaviour):**

- `GENESIS_HASH = "0".repeat(64)`.
- A block (`src/lib/types.ts` `LedgerBlock`) is `{ index, timestamp, type, summary, data, prevHash, hash }`.
- `hashBlock()` = `sha256(JSON.stringify({index, timestamp, type, summary, data, prevHash}))`, hex digest, using Node's built-in `crypto.createHash` (no dependency).
- `appendLedgerBlock(type, summary, data)`: `prevHash` = last block's `hash` (or genesis), `index` = current length, `timestamp` = `new Date().toISOString()`, computes `hash`, pushes to `store.ledger`.
- `verifyLedger()`: walks the chain from genesis; for each block checks (a) `block.prevHash === previous running hash` and (b) `hashBlock(block) === block.hash`. Returns `{valid, brokenAtIndex}`.
- `/transparency` and `/dashboard` re-fetch `/api/ledger` on a 5 s interval, so the "chain integral" badge is effectively recomputed continuously (`src/app/transparency/page.tsx:36`).

**Event types that produce a block** (`LedgerEventType` in `src/lib/types.ts`; emitters in `src/lib/simulator.ts`):
`contentor_critico` (bin reaches ≥85 %), `recolha` (collection performed), `reporte_criado`, `reporte_em_curso`, `reporte_resolvido`, `poste_reportado`, `poste_reparado`, `ar_critico` (station PM2.5 critical). Each `data` payload carries only `{binId|stationId|reportId, zone, level|pm25|category, previousLevel}` — IDs and categories, never names/descriptions/photos.

**How the "real ledger, runs locally" claim holds up:**

- *Real, in the sense that matters:* it is a genuine cryptographic hash chain. SHA-256, each block commits to the previous block's digest, and verification recomputes the whole chain. Editing any historical block's contents without recomputing every subsequent hash is detected (`brokenAtIndex`). This is the same data structure a blockchain uses for its ledger.
- *"Runs locally" / not a blockchain:* it is single-writer (the one Next.js server process), **not distributed, no consensus, no proof-of-work/stake, no digital signatures, and not persisted** (in-memory `globalThis` store — restart = chain resets to genesis). There is **no external anchor**: an actor with server access can rewrite a block *and* recompute all forward hashes, and `verifyLedger()` would then report `valid` again, because the only reference is the chain itself. So it is *tamper-evident against naive edits*, not *tamper-proof* and not *trustless*.
- The README states this precisely: "uma cadeia de hashes real mas corre localmente" — real hash chain, local execution. The case study should mirror that framing and not call it a blockchain.

---

## 4. Real decisions and their *why*

### 4.1 Transparency model — what goes in the ledger vs. not

- **On the chain:** event type + zone, report category, timestamps, hashes (`src/app/transparency/page.tsx` sidebar "Na cadeia"; `src/app/privacy/page.tsx` "Na blockchain": hashes de eventos, timestamps, categoria e zona anónimos).
- **Never on the chain:** citizen name, report description, exact location, photos/documents, browsing history (`transparency` sidebar "Nunca na cadeia"; `privacy` "Nunca na blockchain": nome, morada, contactos, fotos, histórico de navegação).
- **Why:** the ledger's job is to make *the city's conduct* auditable — "was the bin actually collected", "was the report actually resolved" — without turning a public audit log into a public dossier on citizens. Personal fields stay in the in-memory report object, associated by opaque `reportId` only (`src/lib/simulator.ts` `createReport`), and the photo is deleted when the report is resolved (`report.photo = null`).

### 4.2 Privacy by design

- Report form states up front which fields are public and which stay with the citizen (`src/app/report/page.tsx:138`).
- Photos: only offered for `poste_avariado`, client-side size cap 3 MB, server rejects non-image / oversize, and the photo is cleared on resolution (`src/app/api/reports/route.ts`, `src/lib/simulator.ts`).
- Privacy screen gives the citizen granular control (privacy level, location sharing never/on-use/always, blur faces / blur plates / strip metadata), all stored only in `localStorage["urvox.privacy"]` — "as preferências ficam guardadas apenas neste dispositivo" (`src/app/privacy/page.tsx`).
- GDPR export / account-deletion are surfaced as first-class buttons, honestly stubbed with a "in production this would trigger the GDPR flow" notice — the *right to erasure* is designed into the UI even though the backend is a demo.
- README frames this as a value: "Privacidade como valor, não como letra pequena … o que já não é preciso é apagado, não apenas prometido."

### 4.3 Why a hash chain and not a real blockchain (yet)

- **Cost & operability for a pitch-stage prototype.** The stack is deliberately "sem base de dados externa … sem dependências pagas ou chaves de API — corre em qualquer máquina só com `npm install`" (`README.md`). A real chain (the assignment proposed Hyperledger Fabric 3-node + a Polygon node + smart contracts + IPFS — `Task728447.pdf` FASE 0) cannot be demoed on a laptop or a free host without standing up infrastructure.
- **The idea under test is the *transparency contract*, not the consensus mechanism.** A local hash chain is enough to show a citizen "here is the tamper-evident public record, verify it yourself". Moving to a public chain is explicitly a *later* step, not a missing feature.
- **Roadmap position:** "Blockchain pública — mover o livro-razão para uma rede real (ex. Polygon), para que a verificação deixe de depender só do Urvox e passe a ser independente por natureza" (`README.md` "Ideias para o futuro"). The *why* of the eventual migration is stated: to remove Urvox itself as the trusted party.

### 4.4 Simulation over integration

- Bins/air/traffic are simulated because there is no sensor hardware; lighting is modelled as *citizen-reported with no sensors* — and the UI turns that into a point: "sem sensores, tal como acontece hoje na maioria dos municípios" (`src/app/city/lighting/page.tsx`). The simulation is designed so the *architecture* (event → ledger → public verification) is real even where the *inputs* are fake: "a arquitetura é a mesma que escalaria para uma cidade inteira" (`src/app/page.tsx`).

---

## 5. Academic origin

**Assignment:** "Task 7 — SmartCity Solutions Ecosystem Design" (`Task728447.pdf`; the filename encodes Task 7 + student number 28447).

**Group:** Nuno Santos (28447), Tiago Lobo (28336), Catarina Antunes (27443), Rafael Carvalho (27460).

**What the assignment covered** (theoretical ecosystem design):
- *Pre-class knowledge check* — blockchain platform comparison (Ethereum, Bitcoin, Hyperledger Fabric), Mobile & IoT OS comparison (Android, iOS; FreeRTOS, ContikiOS, Zephyr), and a use-case mapping table (e-voting → Fabric; environmental monitoring → Ethereum public data; public-contract management → Fabric; urban waste → Ethereum + FreeRTOS; municipal payments → Bitcoin/Lightning).
- *Discussion-forum scenario* — smart waste management: IoT bins send fill-level data in real time → recorded on **Ethereum** for transparency/traceability → citizens use a **Flutter** mobile app to report problems, check collection schedules, monitor sustainability stats. Named challenges: blockchain scalability/latency, securing thousands of IoT devices, citizen data privacy, interoperability of public/private systems.
- *Fase 1 — Architecture:* Hyperledger Fabric / Ethereum, Flutter (single codebase), RIOT / Android Things / Yocto for sensors, API Gateway + MQTT middleware, digital auth + encryption.
- *Fase 2 — UX & design:* citizen journey (Login → Painel → Serviços → Votação → Transparência), friendly blockchain visualisation of contracts and spending, real-time IoT dashboards, encryption + access profiles.
- *Fase 3 — Implementation strategy:* **18 months, 4 main phases, total investment €2.35M**, with per-phase budgets and KPIs (see roadmap below).
- *Fase 4 — Governance & sustainability:* blockchain-based governance (auditable smart contracts for all critical decisions), a Digital Governance Council, continuous audit (ISO 27001 / GDPR), and a four-axis sustainability plan (technical, financial — hybrid municipal + PPP + Horizon Europe funding, civic-participation tokens, open-data marketplace; social; environmental).
- *Fundamental pillars:* **Tecnologia integrada** (blockchain + mobile + IoT + AI), **Cidadão no centro**, **Transparência total**, **Sustentabilidade** — these are the exact four pillars rendered on the Urvox landing page (`src/app/page.tsx` `PILLARS`, with blockchain/IoT/app wording adapted to what the prototype actually does).

**From assignment to prototype — the key decision:** the theoretical design specified a heavy multi-technology stack (Fabric + Polygon + IPFS + ZK-proofs + Flutter + MQTT + Kubernetes/Istio/Kong). The prototype deliberately collapses all of it into **one Next.js app with a local SHA-256 hash chain and an in-memory store**, to get an honest, clickable vertical slice in front of stakeholders (câmaras, parceiros, investidores — `README.md` "Parte 1") rather than a partial or faked version of the full architecture.

---

## 6. "Ideas for the future" roadmap

### 6.1 Near-term directions (`README.md` "Ideias para o futuro")

- **Real maps** — replace the illustration with Google Maps / Mapbox / OpenStreetMap and real asset + citizen locations.
- **Public blockchain** — move the ledger to a real network (e.g. Polygon) so verification no longer depends on Urvox.
- **Real sensors and cameras** — waste/air monitoring hardware, integration with existing traffic cameras.
- **A channel for the municipality** — an admin view to track and close work orders, publish news, and manage what enters the ledger.
- **Real digital identity** — replace symbolic login with verified auth (e.g. Chave Móvel Digital, the Portuguese national digital ID).
- **Civic participation** — participatory budgeting, municipal voting, citizen proposals — "the natural next step after transparency".
- **Relevant notifications** — push/email alerts by zone or interest.
- **More municipal services** — public transport, health appointments, licensing — Urvox as the single front door to the municipality.
- **Open data** — a public API over the city's non-sensitive data for researchers, universities and companies.

### 6.2 The assignment's 18-month / €2.35M phased plan (mirrored on the landing page as "Fase 0…Fase 4")

`src/app/page.tsx` `ROADMAP` labels each phase; the landing copy says "Parte de um roadmap de 18 meses … Este piloto é a Fase 0". Detail from `Task728447.pdf`:

| Phase | Months | Label (landing) | Assignment scope | Budget |
|---|---|---|---|---|
| **Fase 0** | 1–3 | Fundações | Base infra: Hyperledger Fabric (3 nodes), Polygon node + smart contracts, Kubernetes (prod+staging), Kong API Gateway + Istio, Prometheus/Grafana/ELK; select pilot zones A & B; first 50 IoT sensors; recruit 12 engineers; security audit + pen test. KPIs: 99.5 % uptime, API latency < 200 ms. | €450,000 |
| **Fase 1** | 4–7 | Envolvimento do cidadão | Mobile app MVP (AI-assisted reporting, service tracking, air-quality data, basic digital identity); +200 sensors; 5 edge gateways; immutable service-request log; document verification; public read-only spend monitor; awareness campaign + training + helpline. KPIs: 5,000 users, 500 requests/month, 85 % satisfaction. | €320,000 |
| **Fase 2** | 8–11 | Transparência e confiança | e-voting (non-binding at first), full budget tracking, public-contract management, citizen-proposal platform; 800 sensors, 10 traffic cameras, smart parking pilot (200 spaces), predictive maintenance; **ZK-proofs for voting privacy**, Fabric↔Polygon cross-chain bridge, external smart-contract audits, IPFS cluster; real-time dashboards, ML air-quality forecasting, anomaly detection, public developer API. KPIs: 15,000 active users, first e-vote > 50 % turnout, 95 % IoT uptime. | €580,000 |
| **Fase 3** | 12–15 | Ecossistema completo | Self-sovereign digital identity, 100 % digital licensing, **binding e-voting**, IoT-based emergency alerts, participation-token rewards; 2,500+ sensors, 500 smart bins, 50 traffic cameras, 100 noise sensors, climate/water monitoring; L2 scaling + sidechains, interop with national systems, tokenised civic economy; integrations with public transport, health scheduling, education portal, business licensing. KPIs: 40,000 users (60 % of eligible), 3,000 tx/day, < 5 s confirmation. | €720,000 |
| **Fase 4** | 16–18 | Otimização e escala | Blockchain sharding, IPFS CDN, DB read replicas, +10 edge nodes; AI urban planning, predictive/proactive governance, privacy-preserving inter-municipal data sharing, 3rd-party developer platform; carbon-footprint monitoring, green-initiative voting, renewable-energy monitoring, circular-economy marketplace; feedback loops, A/B testing, automated security scans, disaster-recovery drills. KPIs: 70 % citizen adoption, 99.9 % uptime, < 100 ms latency, NPS > 70, −15 % monitored urban emissions, +25 % digital civic participation. | €280,000 |

**Total: €2,350,000 over 18 months.** Critical success factors (assignment): committed political + technical leadership, adequate budget (cited elsewhere in the doc as €2.6M + €900k/year), a multidisciplinary team, phased approach (quick wins → scale), effective communication, defense-in-depth security, quantifiable KPIs, digital inclusion.

### 6.3 Landing-page impact projections (targets, not results)

`src/app/page.tsx` shows "-29 % distância percorrida, -34 % tempo de recolha, -1 240 €/mês combustível, -850 kg/mês CO₂" — labelled "Projeções do plano original para otimização de rotas de recolha assistida por IA — a referência de impacto que este piloto ajuda a validar." i.e. modelled figures from the academic plan, presented as the benchmark the pilot exists to test.

### 6.4 Where the product is actually heading next (public `Rekrl/urvox` issues)

The `Rekrl/urvox` repo has its own issue tracker (separate from the personal-website one). Open issues as of this research, all under `wayfinder:*` labels, are all about the **participation / voting** module and the **citizen vs. admin split**:

- #1 `wayfinder:map` — "Urvox platform scope: citizen/admin separation & module map"
- #2 (closed) — "Citizen vs admin entry point & session architecture"
- #3 — "Citizen navigation structure for future modules"
- #4 — "Citizen verification & voting-wallet eligibility model"
- #5 — "Report category taxonomy & report enhancements"
- #6 — "Citizen Resultados page content"
- #7 — "Proposta & votação lifecycle — admin management flow"

So the concrete next build phase is the "participação cívica" bullet from the README: proposals + municipal voting, with a real citizen/admin separation and a verification/eligibility ("voting wallet") model.

---

## 7. Stack

Source: `SmartCity/app/package.json`, `README.md` "Parte 2", `src/app/globals.css`, `AGENTS.md`.

- **Framework:** Next.js **16.2.10**, App Router, single project covering frontend + backend (route handlers). React **19.2.4**. TypeScript **5**. (`AGENTS.md` warns this Next major has breaking changes vs. training data — "This is NOT the Next.js you know".)
- **Styling:** Tailwind CSS **v4** (`@tailwindcss/postcss`), design tokens as CSS custom properties in `src/app/globals.css` (ink/paper surfaces, `--signal` lime reserved for live/registered indicators, `--accent` bronze for interactive elements, fixed status colours always paired with icon + label).
- **Fonts (`next/font/google`):** Source Serif 4 (display), Public Sans (body), IBM Plex Mono (hashes/timestamps). *(README still lists the earlier Fraunces + IBM Plex Sans choice.)*
- **Crypto:** Node.js built-in `crypto` (`createHash`, `randomUUID`) — no crypto/blockchain library.
- **Persistence:** none. In-memory object on `globalThis` (`src/lib/store.ts`). No database, no ORM, no cache.
- **External services:** none. No API keys, no paid dependencies. Runs with `npm install` + `npm run dev` on any machine (`README.md`).
- **Simulation:** `setInterval(tick, 4000)` in `src/lib/simulator.ts`, started lazily on first API hit.
- **Tooling:** ESLint 9 + `eslint-config-next`, PostCSS. No test suite in the repo. No CI config.
- **Visual identity:** monochrome petrol `#0A1310` + off-white `#F3F1E6`; logo mark = a roof (civic institution) with voice arcs emanating ("the city speaking", not an equaliser), `src/components/Logo.tsx` with `compact` and `animated` variants.

---

## 8. Live demo / deploy situation

**There is no live demo.** This matters because Urvox is **the only one of the four portfolio projects with a public repository** (`Rekrl/urvox`), so it is the one a reader could actually run — but:

- `gh repo view Rekrl/urvox --json homepageUrl,description` → **`homepageUrl` is empty**.
- `gh api repos/Rekrl/urvox/deployments` → **`[]`** (no deployments).
- `gh api repos/Rekrl/urvox/pages` → **404** (no GitHub Pages site).
- No `vercel.json` / `netlify.toml` in the repo tree; the only `vercel.svg` is the default `create-next-app` scaffold asset in `public/`.
- `next.config.ts` is the empty default.

The repo is a near-verbatim snapshot of `C:\Users\nunog\Desktop\SmartCity/app` (identical `README.md`, identical `package.json` with project name still `"app"`, same `src/` tree, same `src/lib/ledger.ts`). It **does not contain `Task728447.pdf`** — that assignment PDF exists only locally at `C:\Users\nunog\Desktop\SmartCity\Task728447.pdf`.

**Implication for the case study:** the honest live-demo story is "clone `Rekrl/urvox`, `npm install && npm run dev`, open `localhost:3000` — it self-seeds, no setup". A deployed URL would need a long-running Node server (the simulator uses `setInterval` and in-process state), so a static host won't do; a small always-on host (Vercel/Render/Fly) would work but the in-memory ledger would reset on every cold start / redeploy, which is itself worth stating plainly given the transparency pitch.

---

## 9. One-line summary for the case-study intro

Urvox is a navigable Next.js prototype of a citizen–city–municipality hub whose trust
primitive is a public, SHA-256 hash-chained event ledger that anyone can re-verify;
sensors, map, identity and ledger-distribution are all deliberately simulated and
flagged as such in the UI, and the project is a working vertical slice of an 18-month /
€2.35M academic SmartCity ecosystem design ("Task 7", group of four students).
