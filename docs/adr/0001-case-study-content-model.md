# Case-study pages are a typed TS content layer behind one dynamic route

Every project case study renders through a single `<CaseStudyPage>` template driven by a typed `CaseStudy` object in `app/projects/_data/<slug>.ts`, served by one dynamic route `app/projects/[slug]/page.tsx` (`generateStaticParams` + `generateMetadata` from `app/projects/_data/index.ts`). Adding a case study is a data file plus an index entry — no new page file, no bespoke layout.

Sections render in a fixed order from a fixed set (`hero`, `overview`, `architecture`, `decisions`, `stack`, `stats?`, `reality?`, `media?`, `cta`); optional sections are simply absent fields. The template is composed of per-section components (`<CaseHero>`, `<CaseDecisions>`, …) so they stay individually testable and reusable on the landing page.

**No MDX.** Prose lives as `string[]` fields. MDX was rejected: it adds a toolchain, and `AGENTS.md` warns this Next.js build (16.2.9) deviates from upstream, so extra build-time config is a risk not worth taking for a handful of pages. Inline emphasis/links use small React fragments or a minimal markdown renderer.

The existing hand-written `app/projects/industrial-iot-platform/page.tsx` is deleted; its slug is kept for URL stability and its content migrates into `_data/industrial-iot-platform.ts`, corrected against the research dossier. The current page's visual idiom (`NN / section` numbering, `bg-grid gap-px` card grids, stat cards, per-project hover-accent colour) is preserved in the template.

Decided in [Decide: case-study content model & routing](https://github.com/Rekrl/personal-website/issues/6) (wayfinder map #1).
