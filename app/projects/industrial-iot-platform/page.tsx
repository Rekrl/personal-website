import Link from "next/link";
import type { Metadata } from "next";
import ThemeToggle from "../../components/ThemeToggle";

export const metadata: Metadata = {
  title: "Industrial IoT Platform — Nuno Santos",
  description:
    "IIoT Trace: a sensor-agnostic industrial monitoring platform built for STAR Institute. Architecture, engineering decisions, and tradeoffs behind a 3-tier IIoT system.",
};

const decisions = [
  {
    tag: "transport",
    title: "MQTT pub/sub over HTTP",
    decision:
      "Edge devices publish telemetry to a Mosquitto broker over MQTT (QoS 1) instead of calling a REST API.",
    why: "Pub/sub decouples the edge firmware from the ingestion service entirely — the ESP32 doesn't need to know who's listening. MQTT's overhead is a fraction of HTTP's for small, frequent payloads, and QoS 1 buys at-least-once delivery on flaky Wi-Fi without the four-way handshake cost of QoS 2.",
    color: "var(--color-cyan)",
  },
  {
    tag: "extensibility",
    title: "Canonical schema + parser registry",
    decision:
      "Every sensor payload is normalised by a dedicated parser (Strategy pattern) into a fixed InfluxDB schema before it touches the database. No sensor-specific logic lives in the core services.",
    why: "New hardware becomes a new parser file, not a change to the pipeline, dashboard, or analysis service. In practice this held up: 16 sensor types were integrated at an average of ~45 lines of code each, with zero changes to the three core services.",
    color: "var(--color-magenta)",
  },
  {
    tag: "integrity",
    title: "Single-writer rule",
    decision:
      "Only the ingestion pipeline is allowed to write to the telemetry measurement. The dashboard and analysis service are strictly read-only against it.",
    why: "Removes an entire class of race conditions and makes the data lineage obvious: if something's wrong in the database, there's exactly one place to look. The analysis service still writes its own derived results to a separate measurement — raw readings stay immutable.",
    color: "var(--color-purple)",
  },
  {
    tag: "ops",
    title: "Zero-config sensor discovery",
    decision:
      "A background job periodically queries InfluxDB for tag combinations that aren't yet in the sensor registry and auto-registers them with type-appropriate defaults — without ever overwriting a manually-configured entry.",
    why: "Plugging in a new sensor of an already-supported type should require zero code changes and zero redeploys. Manual entries always win the merge, so an operator's edits are never silently reverted by the next discovery cycle.",
    color: "var(--color-orange)",
  },
  {
    tag: "storage",
    title: "InfluxDB over relational / document stores",
    decision:
      "Time-series data lives in InfluxDB rather than PostgreSQL or MongoDB.",
    why: "Sensor telemetry is fundamentally a write-heavy time series with tag-based querying, retention policies, and downsampling as first-class needs — exactly InfluxDB's design center. A relational store would need bolt-on extensions to do the same job.",
    color: "var(--color-cyan)",
  },
  {
    tag: "security",
    title: "TLS + local CA, even on the LAN",
    decision:
      "The MQTT broker runs behind TLS 1.2 with a self-signed local CA, per-user credentials, and topic-level ACLs — no anonymous access, no plaintext fallback.",
    why: "Industrial networks aren't automatically trusted networks. Treating the broker as if it were internet-facing was a deliberate choice to avoid the common IIoT failure mode of 'it's internal, so it's fine.'",
    color: "var(--color-magenta)",
  },
  {
    tag: "performance",
    title: "Sequential per-asset analysis, benchmarked honestly",
    decision:
      "The anomaly-detection loop processes assets one at a time rather than in parallel — and that limitation is measured and documented, not hidden.",
    why: "Benchmarking showed strictly linear O(N) scaling at ~107ms/asset, holding the 30s SLO up to ~280 concurrent assets. That's well beyond the platform's current scale, so parallelising by site_id was deliberately deferred rather than built speculatively.",
    color: "var(--color-purple)",
  },
  {
    tag: "process",
    title: "Architecture-as-contract for AI-assisted development",
    decision:
      "A CLAUDE.md file encodes the schema, the single-writer rule, and naming conventions as hard constraints for AI-assisted coding, enforced through a PRD → issue → TDD → review pipeline.",
    why: "AI-assisted development is only as good as the guardrails around it. Treating the architecture doc as an enforceable contract — not just reference material — kept 313 automated tests and 56 resolved issues consistent with the schema throughout the build.",
    color: "var(--color-orange)",
  },
];

const stack = [
  {
    layer: "Edge",
    items: ["C/C++", "ESP32-S3 (M5Stack CoreS3)", "Modbus RTU / RS-485", "I2C", "PlatformIO"],
  },
  {
    layer: "Transport",
    items: ["MQTT", "Eclipse Mosquitto", "TLS 1.2", "QoS 1"],
  },
  {
    layer: "Storage",
    items: ["InfluxDB 2.8", "Flux"],
  },
  {
    layer: "Platform & Business",
    items: ["Node.js", "Express", "Socket.IO", "FastAPI", "Python", "Pandas"],
  },
  {
    layer: "Infra & Tooling",
    items: ["Docker Compose", "Git", "JetBrains IDEs", "Claude Code"],
  },
];

const stats = [
  { value: "16", label: "sensor types integrated" },
  { value: "6", label: "industrial domains" },
  { value: "3", label: "sites simulated" },
  { value: "~45", label: "avg. LOC per new sensor" },
  { value: "107ms", label: "analysis latency / asset" },
  { value: "313", label: "automated tests" },
];

export default function IndustrialIoTPlatform() {
  return (
    <main className="min-h-screen bg-background text-foreground font-mono">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 px-6 md:px-16 py-4 flex items-center justify-between border-b border-border bg-nav backdrop-blur-sm">
        <Link
          href="/"
          className="text-muted-3 hover:text-cyan transition-colors text-sm tracking-widest uppercase"
        >
          ← nuno santos
        </Link>
        <div className="flex items-center gap-6">
          <span className="text-cyan font-bold text-sm tracking-widest uppercase hidden sm:inline">
            case study
          </span>
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-16 pt-32 pb-16 border-b border-border">
        <p className="text-muted-5 text-xs tracking-[0.3em] mb-6 uppercase">
          case study — internship project, STAR Institute
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-none mb-4 uppercase">
          Industrial IoT Platform
        </h1>
        <p className="text-lg md:text-xl text-muted-2 mb-6 max-w-3xl">
          A sensor-agnostic monitoring &amp; analysis platform for industrial
          environments — ingesting heterogeneous sensor data through a
          canonical schema, and turning it into anomaly alerts and risk scores
          in real time.
        </p>
        <div className="flex flex-wrap gap-2">
          {["ESP32-S3", "MQTT", "Node.js", "InfluxDB", "FastAPI", "Docker", "TDD"].map(
            (s) => (
              <span
                key={s}
                className="text-xs border border-border px-2 py-1 text-muted-4"
              >
                {s}
              </span>
            )
          )}
        </div>
      </section>

      {/* 01 / Overview */}
      <section className="px-6 md:px-16 py-20 max-w-4xl border-b border-border">
        <p className="text-muted-5 text-xs tracking-[0.3em] mb-8 uppercase">
          01 / overview
        </p>
        <div className="space-y-5 text-muted-2 leading-relaxed">
          <p>
            Industrial facilities generate telemetry from wildly heterogeneous
            hardware — energy meters, environmental sensors, vibration
            probes, flow sensors — each with its own registers, units, and
            firmware quirks. This platform was built during a curricular
            internship at{" "}
            <span className="text-cyan">STAR Institute</span> to turn
            that fragmentation into a single, queryable stream of decision-
            ready data.
          </p>
          <p>
            An ESP32-S3 edge node (M5Stack CoreS3) polls sensors over Modbus
            RTU and I2C and publishes normalised-context envelopes over MQTT.
            A Node.js pipeline is the only service allowed to write that
            telemetry into InfluxDB; a FastAPI service reads it back to score
            risk and detect anomalies (Z-score, moving average, gradient and
            THD-trend detectors); a Node.js dashboard visualises all of it in
            real time over Socket.IO.
          </p>
          <p>
            The interesting part isn&apos;t any single sensor integration —
            it&apos;s the set of constraints that let 16 different sensor
            types, across 6 industrial domains and 3 sites, get ingested,
            stored, and analysed through the exact same code path.
          </p>
        </div>
      </section>

      {/* 02 / Architecture */}
      <section className="px-6 md:px-16 py-20 border-b border-border">
        <p className="text-muted-5 text-xs tracking-[0.3em] mb-8 uppercase">
          02 / architecture
        </p>
        <p className="text-muted-2 leading-relaxed max-w-3xl mb-10">
          The system follows a three-tier IIoT topology — Edge, Platform, and
          Business — with a strict one-way data flow and a single writer at
          the persistence boundary.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-grid">
          {/* Edge Tier */}
          <div className="bg-surface p-6 border border-border hover:border-cyan transition-colors">
            <p className="text-cyan text-xs tracking-widest uppercase mb-4">
              Edge Tier
            </p>
            <p className="text-muted-3 text-sm leading-relaxed mb-4">
              Physical sensors + ESP32-S3 gateway. Polls Modbus RTU / I2C,
              builds a JSON envelope, publishes over MQTT (TLS).
            </p>
            <div className="flex flex-wrap gap-2">
              {["SDM630MCT", "BME688", "WTVB01-485", "CoreS3"].map((s) => (
                <span
                  key={s}
                  className="text-xs border border-border px-2 py-1 text-muted-5"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Platform Tier */}
          <div className="bg-surface p-6 border border-border hover:border-magenta transition-colors">
            <p className="text-magenta text-xs tracking-widest uppercase mb-4">
              Platform Tier
            </p>
            <p className="text-muted-3 text-sm leading-relaxed mb-4">
              Mosquitto broker + data-pipeline. Validates the data contract,
              resolves a parser by sensor_type, normalises fields, and is the
              sole writer to InfluxDB.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Mosquitto", "Node.js pipeline", "InfluxDB 2.8"].map((s) => (
                <span
                  key={s}
                  className="text-xs border border-border px-2 py-1 text-muted-5"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Business Tier */}
          <div className="bg-surface p-6 border border-border hover:border-purple transition-colors">
            <p className="text-purple text-xs tracking-widest uppercase mb-4">
              Business Tier
            </p>
            <p className="text-muted-3 text-sm leading-relaxed mb-4">
              FastAPI analysis service reads telemetry read-only, scores risk
              &amp; anomalies, and publishes alerts; a Node.js dashboard
              renders everything live.
            </p>
            <div className="flex flex-wrap gap-2">
              {["FastAPI", "Pandas", "Socket.IO", "Chart.js"].map((s) => (
                <span
                  key={s}
                  className="text-xs border border-border px-2 py-1 text-muted-5"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="text-muted-4 text-sm mt-6 max-w-3xl leading-relaxed">
          Every tier is containerised via Docker Compose except the edge
          firmware itself — moving the platform to a new site is a config
          change, not a code change.
        </p>
      </section>

      {/* 03 / Decisions */}
      <section className="px-6 md:px-16 py-20 border-b border-border">
        <p className="text-muted-5 text-xs tracking-[0.3em] mb-4 uppercase">
          03 / architectural decisions
        </p>
        <p className="text-muted-2 leading-relaxed max-w-3xl mb-10">
          The product surface (dashboards, charts) is the least interesting
          part of this project. What mattered was the set of tradeoffs made
          to keep the system extensible, correct, and honest about its own
          limits.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-grid">
          {decisions.map((d) => (
            <div
              key={d.title}
              className="bg-surface p-6 border border-border transition-colors group"
            >
              <p
                className="text-xs tracking-widest uppercase mb-3"
                style={{ color: d.color }}
              >
                {d.tag}
              </p>
              <h3 className="font-bold text-base mb-3">{d.title}</h3>
              <p className="text-muted-2 text-sm leading-relaxed mb-3">
                {d.decision}
              </p>
              <p className="text-muted-4 text-sm leading-relaxed">
                <span className="text-muted-3">Why: </span>
                {d.why}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 04 / Stack */}
      <section className="px-6 md:px-16 py-20 border-b border-border">
        <p className="text-muted-5 text-xs tracking-[0.3em] mb-8 uppercase">
          04 / stack by layer
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stack.map((s) => (
            <div key={s.layer}>
              <p className="text-muted-4 text-xs tracking-widest uppercase mb-3">
                {s.layer}
              </p>
              <div className="flex flex-wrap gap-2">
                {s.items.map((i) => (
                  <span
                    key={i}
                    className="text-xs border border-border px-2 py-1 text-muted-3 hover:border-cyan hover:text-cyan transition-colors"
                  >
                    {i}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 05 / Results */}
      <section className="px-6 md:px-16 py-20 border-b border-border">
        <p className="text-muted-5 text-xs tracking-[0.3em] mb-8 uppercase">
          05 / validated at
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-grid">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-surface p-5 border border-border hover:border-cyan transition-colors"
            >
              <p className="text-2xl md:text-3xl font-bold text-cyan mb-1">
                {s.value}
              </p>
              <p className="text-muted-4 text-xs leading-snug uppercase tracking-wide">
                {s.label}
              </p>
            </div>
          ))}
        </div>
        <p className="text-muted-4 text-sm mt-6 max-w-3xl leading-relaxed">
          Benchmarked with a synthetic-load harness against a scaled InfluxDB
          dataset; scaling stays linear up to ~280 concurrent assets before
          the 30s analysis SLO is missed — the known ceiling of the current
          sequential design, and the next thing to fix.
        </p>
      </section>

      {/* Footer / CTA */}
      <section className="px-6 md:px-16 py-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <p className="text-muted-3 text-sm max-w-md">
          Built solo, end to end — firmware, backend, analysis service, and
          dashboard — as a capstone project for a Computer Engineering
          degree.
        </p>
        <div className="flex gap-4">
          <Link
            href="/#projects"
            className="px-6 py-3 border border-border-strong text-muted-3 hover:border-magenta hover:text-magenta transition-all text-xs tracking-widest uppercase"
          >
            ← all projects
          </Link>
          <a
            href="https://github.com/Rekrl/IIoT-STARInstitute"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 border border-cyan text-cyan hover:bg-cyan hover:text-on-accent transition-all text-xs tracking-widest uppercase"
          >
            GitHub
          </a>
        </div>
      </section>

      <footer className="px-6 md:px-16 py-6 border-t border-border text-muted-6 text-xs flex justify-between">
        <span>Nuno Santos · 2026</span>
        <span>Built with Next.js + TypeScript</span>
      </footer>
    </main>
  );
}
