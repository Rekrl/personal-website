# GitHub Heatmap — Data-Sourcing Dossier

Fact-finding for issue [#19](https://github.com/Rekrl/personal-website/issues/19)
("Research: sourcing GitHub contribution data for a static Next.js site"), a child
of the personality-features map, issue
[#17](https://github.com/Rekrl/personal-website/issues/17). Every claim below is
cited to a primary source — official GitHub/Next.js/Vercel docs, a service's own
repo/README, or an empirical check run against the live API from this machine
(curl output included verbatim). Target account: **Rekrl**.

---

## 1. What this repo's deploy actually is (this changes the calculus)

The map issue frames this as "a statically-generated (or at least mostly
static-output) Next.js site with no persistent backend server." Checked against
the actual repo:

- `next.config.ts` sets no `output: 'export'` — this is a standard Next.js App
  Router project (`app/` directory), not a static HTML export.
- `README.md`: **"Deployed on [Vercel](https://vercel.com); a push to `main`
  triggers a deploy."**
- `package.json` scripts are the default `next dev` / `next build` / `next
  start` — no `next export` step anywhere.

That matters because on Vercel, a non-exported Next.js app is **not** limited to
build-time-only data. Vercel's own Next.js integration runs [Route
Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route) and
Server Components as [Vercel
Functions](https://vercel.com/docs/functions) (serverless, or edge if opted
in) on every deploy — there is no separate "server" to provision, but there is a
server-side execution boundary. Concretely, this means:

- A GitHub token **can** be kept fully server-side (env var, never shipped to
  the browser) without standing up any separate backend — Vercel's Next.js
  runtime *is* that backend.
- "Build-time fetch" and "small serverless function reading a token at request
  time" are not two different infra models here — they're the same primitive
  (a `fetch()` inside a Server Component or Route Handler) with different
  **cache** settings, per [Next.js's Route Handler
  docs](https://nextjs.org/docs/app/api-reference/file-conventions/route)
  (`export const revalidate = 60`, shown in that page's own example) and the
  [Fetching Data
  guide](https://nextjs.org/docs/app/getting-started/fetching-data) (`next: {
  revalidate }` on `fetch`).
- This rules out treating "third-party image embed" as the *only* no-infra
  option — a token-bearing server call is equally low-infra on this stack.

---

## 2. Sourcing options, checked against primary sources

### 2.1 Unauthenticated client-side fetch of a public GitHub endpoint

There is **no REST endpoint for the contribution calendar** at all, authenticated
or not. Confirmed by:

- GitHub's own [Profile contributions
  reference](https://docs.github.com/en/account-and-profile/reference/profile-contributions-reference)
  documents *what counts* as a contribution (repo creation/forking always
  count; issues, PRs, discussions, commits count under specific conditions) but
  describes no API for retrieving the graph — only the profile page rendering.
- The GraphQL schema's [`User.contributionsCollection` /
  `ContributionCalendar`](https://docs.github.com/en/graphql/reference/users#object-contributioncalendar)
  type is the only documented programmatic surface for this exact data shape
  (`totalContributions`, `weeks[].contributionDays[].contributionCount`/`date`).
- The GraphQL API has **zero unauthenticated quota**. Empirically verified from
  this machine:

  ```
  $ curl -s https://api.github.com/graphql -d '{"query":"{ viewer { login } }"}'
  {"message":"API rate limit exceeded for <IP>. (But here's the good news:
  Authenticated requests get a higher rate limit. ...)"}

  $ curl -s https://api.github.com/rate_limit
  ...
  "graphql": { "limit": 0, "remaining": 0, ... }
  ```

  i.e. GitHub's own `/rate_limit` response shows an **unauthenticated GraphQL
  quota of 0**, not merely a low number — this is corroborated by community
  write-ups (e.g. discussion threads on `docs.github.com`'s own forums) stating
  GraphQL "only allows requests ... when it has a token."

The only thing an unauthenticated client-side request *can* reach is the
**undocumented HTML fragment** GitHub's own profile page uses to render the
graph, at `https://github.com/users/<login>/contributions`. Empirically
fetched (`curl -s "https://github.com/users/Rekrl/contributions"` → HTTP 200,
224 KB of HTML) and inspected: it contains one `<td class="ContributionCalendar-day"
data-date="2025-09-14" data-level="0" ...>` per day plus a `<tool-tip>` with the
human-readable count ("No contributions on September 14th."). This is real,
scrapable, per-day data with **no auth and no documented rate limit** — but:

- It is not an API. No version, no schema, no stability contract, no
  `docs.github.com` page describing it as public. It is literally the internal
  markup GitHub's frontend renders into the profile page and could change
  format (or move behind additional anti-scraping measures) at any time without
  notice.
- Fetching it **client-side from the browser** hits GitHub's own domain from
  arbitrary third-party origins; GitHub does not publish a CORS policy for this
  fragment for cross-origin `fetch()`, so a same-origin browser call would
  likely be blocked by CORS in practice (this is why every tool that uses this
  trick — see §2.3 — fetches it **server-side**, not from client JS).
- Parsing HTML instead of consuming a typed JSON contract is inherently more
  fragile than either alternative below.

**Verdict:** technically zero-auth and zero-official-limit, but scraping
undocumented markup is the single most fragile option on the table, and doing
it from client-side JS runs into CORS in practice. Not recommended as the
primary path.

### 2.2 GitHub GraphQL API with a token kept server-side (build-time / cached fetch)

- Auth: requires a token (classic PAT with `read:user`, or a fine-grained PAT —
  fine-grained tokens include read access to public repositories/profile data
  by default per GitHub's [personal access tokens
  docs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)).
  For a **public** profile's contribution calendar, no elevated/private scopes
  are needed.
- Rate limit: [GitHub's GraphQL rate-limit
  docs](https://docs.github.com/en/graphql/overview/rate-limits-and-node-limits-for-the-graphql-api)
  state **5,000 points per hour per user** for a standard authenticated token —
  a `contributionsCollection` query costs a handful of points. For a site
  fetching this once (build) and then re-validating on a multi-hour cache
  window, this budget is not a meaningful constraint even in the worst case.
- Static-export / Vercel fit: implemented as a `fetch()` inside a Server
  Component or a [Route
  Handler](https://nextjs.org/docs/app/api-reference/file-conventions/route),
  with `export const revalidate = <seconds>` (documented directly on that page)
  or `next: { revalidate }` on the `fetch()` call itself ([Fetching Data
  guide](https://nextjs.org/docs/app/getting-started/fetching-data)). This
  fetches once, caches the result, and only re-fetches in the background after
  the window — behaviourally a build-time fetch that also self-refreshes
  without a full redeploy. Route Handlers have existed since **Next.js
  v13.2.0** per that page's own version-history table, so nothing here needs a
  newer/unstable API.
- Token safety: per Next.js's [Environment Variables
  guide](https://nextjs.org/docs/app/guides/environment-variables), **"Non-`NEXT_PUBLIC_`
  environment variables are only available in the Node.js environment ...
  aren't accessible to the browser."** Only a variable explicitly prefixed
  `NEXT_PUBLIC_` gets inlined into the client bundle. So the token is stored as
  a plain (non-prefixed) env var and is provably never shipped to the client as
  long as it's read only inside server-side code (Server Component / Route
  Handler), never passed as a prop into a `'use client'` component.
- Where the token lives: [Vercel's Environment Variables
  docs](https://vercel.com/docs/environment-variables) confirm values are
  "encrypted at rest and visible to any user that has access to the project,"
  settable per environment (Production/Preview/Development) — the standard,
  supported place to put a secret for a Vercel-deployed Next.js app, no extra
  infra.
- Maintenance/fragility: depends on GitHub's official, versioned, documented
  GraphQL schema — the lowest-fragility option here. The only ongoing cost is
  token rotation (PATs can expire; Vercel's rotation guide covers updating a
  variable without downtime) and remembering to keep the token out of any
  `NEXT_PUBLIC_`-prefixed variable or client component.

**Verdict:** the only option that is simultaneously official, typed, versioned,
cheap on quota, and trivially compatible with this repo's actual (non-exported)
Vercel/Next.js deploy.

### 2.3 Third-party embeddable image services (ghchart.rshah.org, github-readme-stats)

**ghchart.rshah.org** ([2016rshah/githubchart-api](https://github.com/2016rshah/githubchart-api)):

- A single-maintainer Ruby/Sinatra app ("If you see anything that can be
  improved send in an issue/PR" is the entire contribution guidance in its own
  README), deployed on Heroku per its README's deploy instructions. Heroku
  killed its free dyno tier in November 2022, which is exactly the kind of
  unannounced-to-consumers platform shift that silently breaks small
  single-maintainer services like this — a concrete, already-happened instance
  of the "third-party service going down" risk the map issue asks about.
- The README documents no data source, no caching policy, no uptime
  commitment, no rate limit — i.e. no operational contract at all. Embedding it
  means the heatmap's availability is entirely outside the site's control, with
  no SLA to point to when it breaks.
- No auth needed (it renders the SVG for the same undocumented
  `github.com/users/<login>/contributions` markup described in §2.1) — but that
  no-auth convenience is only possible because it inherits the exact fragility
  described there.

**github-readme-stats** ([anuraghazra/github-readme-stats](https://github.com/anuraghazra/github-readme-stats)):

- More actively maintained and does document its mechanics, but its own README
  states the shared public demo — `https://github-readme-stats.vercel.app/api`
  — **"is best-effort and can be unreliable due to rate limits and traffic
  spikes,"** and explicitly recommends **"self-hosting (Vercel or other) or
  using the GitHub Actions workflow"** for anything that needs to be reliable.
- Self-hosting it means deploying and operating a *second* Vercel project,
  supplying it a PAT via a `PAT_1` environment variable (per its own deploy
  docs), and maintaining that fork/deployment indefinitely — i.e. all the
  server-side-token plumbing of §2.2, plus an extra service to keep patched and
  redeployed, for a project not under this repo's control.
- Either way (shared demo or self-host), the output is a **pre-rendered image**
  (SVG/PNG), not data — it can't be restyled to match the site's terminal
  aesthetic beyond the theme parameters the service happens to expose, and it
  can't be unit-tested or type-checked like a fetched JSON payload could.

**Verdict:** both services are strictly worse than doing the same GraphQL call
directly (§2.2): they add an external maintenance/availability dependency this
project doesn't control, and in ghchart's case there is no documented
data-source or reliability story at all. github-readme-stats is more credible
but its own docs steer serious users toward self-hosting, which reduces to
"stand up your own §2.2, plus operate someone else's codebase."

### 2.4 Small serverless/edge function reading a token at request time

As established in §1, this is not a distinct infra option from §2.2 on this
stack — it's the *same* Route Handler, just with `revalidate = 0` (or `dynamic
= 'force-dynamic'`) instead of a cache window, so GitHub is called on every
request instead of once per revalidation period.

- Rate limit: still governed by the same 5,000-points/hour GraphQL budget
  ([GitHub GraphQL rate-limit
  docs](https://docs.github.com/en/graphql/overview/rate-limits-and-node-limits-for-the-graphql-api)).
  For a personal portfolio site this is very unlikely to be hit, but calling
  GitHub on every page view is pure waste for data that changes at most once a
  day (a contribution calendar) — there's no upside over caching it, only
  avoidable load and avoidable latency on every visitor's page load.
- Everything else (token storage, Vercel env vars, Next.js env-var
  client/server split) is identical to §2.2.

**Verdict:** strictly dominated by §2.2 with a sane `revalidate` window — same
code, same token handling, but wastes GitHub API calls and adds needless
per-request latency for data that doesn't change that often.

### 2.5 Bonus option surfaced by this research: scheduled GitHub Actions commit

Worth naming even though it wasn't in the original list, because it fits "no
persistent backend" most literally. A GitHub Actions workflow on a
[`schedule`](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
trigger (cron) could fetch the GraphQL data with a repo secret and commit a
small JSON snapshot into the repo, which the build then reads as a local file
at build time — no runtime network call at all, ever.

- Caveats from the same GitHub Actions docs: scheduled runs "can be delayed
  during periods of high loads," the minimum practical interval is 5 minutes,
  and — the sharper one — **"scheduled workflows are automatically disabled
  when no repository activity has occurred in 60 days"** on public repos. A
  personal site with sporadic commits could silently stop updating its own
  heatmap data and nobody would notice until someone looked at a stale graph.
- Adds a second moving part (a workflow file, a bot commit history, a repo
  secret) for a problem §2.2 already solves with one `revalidate` number.

**Verdict:** viable, but strictly more moving parts than §2.2 for the same
result, with a real (documented) silent-failure mode. Not recommended over
§2.2, but worth keeping in mind if a future ticket wants a zero-runtime-call
guarantee.

---

## 3. Comparison table

| Option | Auth needed | Rate limit | Fits this repo's Vercel/Next.js deploy | Fragility / maintenance |
|---|---|---|---|---|
| **2.1** Unauthenticated client-side fetch | None (but only the undocumented HTML fragment is reachable unauthenticated — no public JSON API exists) | REST: 60/hr/IP if it were REST (it isn't); GraphQL: **0** unauthenticated (empirically confirmed) | Poor — CORS blocks the only unauthenticated data source from browser JS in practice | Highest — scraping undocumented markup with no stability contract |
| **2.2** GraphQL, token server-side, cached (`revalidate`) | Yes — PAT with `read:user` (public data) | 5,000 pts/hr/token (GitHub docs) | Best — native Route Handler / Server Component fetch, `revalidate` matches Vercel's caching model exactly | Lowest — official, versioned, documented schema; only cost is token rotation |
| **2.3a** ghchart.rshah.org | None | Undocumented | Works via `<img>` embed but is a total black box | Highest of the "working" options — single maintainer, no documented data source/uptime, Heroku dependency already destabilized once |
| **2.3b** github-readme-stats | Yes, if self-hosted (`PAT_1`); none if using the shared demo | Shared demo: unreliable by the project's own admission | Works via `<img>` embed; self-hosting means a second Vercel project | Medium-high — actively maintained, but its own docs say the shared instance is unreliable and self-hosting reduces to "operate someone else's app" |
| **2.4** Serverless/edge fn, token at request time | Same as 2.2 | Same as 2.2, but spent on every request instead of once per cache window | Same code path as 2.2, worse cache setting | Same as 2.2, plus unnecessary per-visitor GitHub calls and latency |
| **2.5** Scheduled Actions commit | Yes — repo secret | N/A (build-time only, not per-request) | Works, but adds a workflow + bot-commit history | Medium — documented 60-day auto-disable on inactive public repos is a real silent-failure mode |

---

## 4. Recommendation

**Use the GitHub GraphQL API's `contributionsCollection.contributionCalendar`
field, called server-side from a Next.js Route Handler (or a Server Component
that renders the heatmap section), authenticated with a personal access token
stored as a plain (non-`NEXT_PUBLIC_`) Vercel environment variable, and cached
with a multi-hour `revalidate` window rather than fetched on every request.**

Why this one, specifically:

1. It's the **only officially documented, versioned, typed** way to get this
   exact data (§2.2) — every other option either scrapes undocumented markup
   (§2.1, and under the hood, §2.3a) or hands the whole problem to a
   single-maintainer or best-effort third-party service whose own
   documentation admits it's unreliable or provides no operational contract at
   all (§2.3).
2. This repo's real deploy target — standard Next.js on Vercel, not a static
   export (§1) — makes server-side-token fetching exactly as low-infra as a
   client-side embed would have been, so there's no "static site can't do
   this" constraint to trade off against.
3. `revalidate` gives build-time-fetch semantics (cached, not re-run per
   request) without needing a separate cron job or committed data file, and
   without the 60-day-inactivity failure mode a GitHub Actions cron job would
   carry (§2.5).
4. The GraphQL quota (5,000 pts/hr/token) and a `read:user`-scoped PAT for
   public data are generous relative to a personal site refreshing at most a
   few times a day — nowhere close to being a real constraint.
5. It keeps the token verifiably server-only per Next.js's own documented
   client/server env-var split, and stores it the standard, supported way for
   a Vercel project.

This is a data-sourcing decision only — no heatmap UI/component work is done
here; that belongs to the follow-up implementation ticket (#20).
