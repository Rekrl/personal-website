import type { CaseStudy } from "./types";

// Migrated from the hand-written page (commit 17c42e0) and corrected against
// docs/research/iiot-trace-dossier.md (branch research/iiot-dossier).
// Key corrections: telemetry is QoS 0 not 1; only 3 of 16 sensor models ran on
// real hardware; CNC is infrastructure-complete but has no real data; the
// "~280 assets" ceiling is an interpolation; the MQTT topic scheme is now shown.

const iiot: CaseStudy = {
  slug: "industrial-iot-platform",
  name: "IIoT Trace",
  tagline:
    "A sensor-agnostic monitoring & analysis platform for industrial environments — heterogeneous sensor telemetry through one canonical schema, turned into real-time anomaly alerts and risk scores.",
  accent: "cyan",
  status: "shipped",
  role: "Solo · final-year Computer Engineering project with STAR Institute",
  links: [],
  metaDescription:
    "IIoT Trace: a sensor-agnostic industrial monitoring platform built for STAR Institute. Architecture, engineering decisions, and the tradeoffs behind a 3-tier IIoT system.",
  card: {
    blurb:
      "Sensor-agnostic industrial monitoring: ESP32 edge firmware publishes over MQTT to a Node.js pipeline — the sole writer to InfluxDB — with a FastAPI service scoring anomalies and risk in real time.",
    stack: ["ESP32-S3", "MQTT", "Node.js", "InfluxDB", "FastAPI", "Docker"],
    signatureStack: ["ESP32-S3", "MQTT", "InfluxDB"],
  },

  overview: [
    "Industrial facilities generate telemetry from wildly heterogeneous hardware — energy meters, environmental probes, vibration sensors, flow meters — each with its own registers, units and firmware quirks. IIoT Trace was built during a final-year degree project in partnership with STAR Institute (Viseu) to turn that fragmentation into a single, queryable stream of decision-ready data.",
    "An ESP32-S3 edge node (M5Stack CoreS3) polls sensors over Modbus RTU and I2C and publishes context-rich JSON envelopes over MQTT. A Node.js pipeline is the only service allowed to write that telemetry into InfluxDB; a FastAPI service reads it back to score risk, detect anomalies and estimate remaining useful life; a Node.js dashboard renders everything live over Socket.IO.",
    "The interesting part isn't any one sensor integration — it's the set of constraints that let 16 different sensor types, across 6 industrial domains, get ingested, stored and analysed through the exact same code path. It's an academic deliverable, not a production system: three sensor models ran on real hardware, the rest through a built-in simulator, and validation was mostly against synthetic telemetry.",
  ],

  architecture: {
    intro: [
      "The system follows a three-tier IIoT topology — Edge, Platform, Business — with a strict one-way data flow and a single writer at the persistence boundary. Every tier is containerised via Docker Compose except the edge firmware itself, so moving the platform to a new site is a config change, not a code change.",
    ],
    figures: [
      {
        caption:
          "Three tiers, one-way flow. The data-pipeline is the only writer to the telemetry measurement; the analysis service and dashboard are strictly read-only against it.",
        ascii: "[3 sensors] --RS-485/I2C--> [CoreS3] --MQTT QoS0--> [Mosquitto] --> [data-pipeline] --sole writer--> [InfluxDB] <--read-- [analysis-service] + [dashboard]",
        diagram: {
          viewBox: [0, 0, 640, 520],
          aria:
            "IIoT Trace three-tier architecture: an ESP32 edge gateway polls sensors and publishes telemetry over MQTT to a Mosquitto broker; a Node.js data-pipeline is the sole writer to InfluxDB; a FastAPI analysis service and a dashboard read it back.",
          accentColor: "magenta",
          tiers: [
            { label: "edge tier — not containerised", accent: "orange", x: 12, y: 34, w: 616, h: 92 },
            { label: "platform tier — docker", accent: "cyan", x: 12, y: 210, w: 616, h: 92 },
            { label: "business tier — docker", accent: "purple", x: 12, y: 386, w: 616, h: 104 },
          ],
          nodes: [
            { id: "sens", x: 384, y: 60, w: 216, h: 44, label: ["3 sensors on real hardware", "SDM630MCT · WTVB01 · BME688"] },
            { id: "core", x: 40, y: 60, w: 216, h: 44, label: ["M5Stack CoreS3 · ESP32-S3", "poll · build envelope · publish 5s"] },
            { id: "mq", x: 40, y: 236, w: 150, h: 44, label: ["Mosquitto 2.0", "TLS 1.2 · ACL · no anon"] },
            { id: "pipe", x: 258, y: 236, w: 150, h: 44, label: ["data-pipeline", "Node.js · validate · parse"] },
            { id: "influx", x: 480, y: 236, w: 128, h: 44, label: ["InfluxDB 2.8", "measurement=telemetry"] },
            { id: "an", x: 40, y: 414, w: 224, h: 48, label: ["analysis-service", "FastAPI · risk · anomaly · RUL"] },
            { id: "dash", x: 376, y: 414, w: 224, h: 48, label: ["dashboard", "Node · Socket.IO · live views"] },
          ],
          edges: [
            { from: "sens", to: "core", label: "RS-485 · I2C" },
            { from: "mq", to: "pipe", label: "telemetry" },
            { from: "pipe", to: "influx", label: "sole writer", accent: true },
            { from: "an", to: "dash", label: "analysis · QoS 1" },
          ],
          bandEdges: [
            { from: 0, to: 1, x: 124, label: "MQTTS :8883 · telemetry · QoS 0" },
            { from: 1, to: 2, x: 320, label: "read-only · Flux", dashed: true },
          ],
        },
      },
      {
        caption:
          "The MQTT topic scheme. Telemetry is fire-and-forget at QoS 0 (the 5-second cadence tolerates loss); the analytics event path is QoS 1. A single wildcard subscription captures every sensor at every site.",
        ascii: "publishers --iiot/{site}/{cluster}/{sensor}/telemetry QoS0--> [Mosquitto] --iiot/+/+/+/telemetry--> data-pipeline ;  analysis-service --iiot/{site}/{loc}/analysis QoS1--> [Mosquitto] --iiot/+/+/analysis--> dashboard",
        diagram: {
          viewBox: [0, 0, 620, 210],
          aria:
            "MQTT topic flow: edge and simulator publish telemetry at QoS 0 and the data-pipeline wildcard-subscribes; the analysis service publishes results at QoS 1 and the dashboard wildcard-subscribes; both go through the same Mosquitto broker.",
          accentColor: "magenta",
          nodes: [
            { id: "pub", x: 12, y: 30, w: 132, h: 42, label: ["edge + simulator", "publish"] },
            { id: "brk1", x: 250, y: 30, w: 120, h: 42, label: ["Mosquitto"], accent: "cyan" },
            { id: "pipe", x: 470, y: 30, w: 138, h: 42, label: ["data-pipeline", "subscribe"] },
            { id: "an", x: 12, y: 140, w: 132, h: 42, label: ["analysis-service", "publish"] },
            { id: "brk2", x: 250, y: 140, w: 120, h: 42, label: ["Mosquitto"], accent: "cyan" },
            { id: "dash", x: 470, y: 140, w: 138, h: 42, label: ["dashboard", "subscribe"] },
          ],
          edges: [
            { from: "pub", to: "brk1", label: "telemetry · QoS 0" },
            { from: "brk1", to: "pipe", label: "+/+/+/telemetry" },
            { from: "an", to: "brk2", label: "analysis · QoS 1", accent: true },
            { from: "brk2", to: "dash", label: "+/+/analysis" },
            { from: "brk1", to: "brk2", label: "same broker", dashed: true },
          ],
        },
      },
    ],
    notes: [
      "Five containers in Docker Compose: mosquitto, influxdb, data-pipeline, dashboard, analysis. The edge firmware is the only component outside Docker.",
    ],
  },

  decisions: [
    {
      tag: "transport",
      title: "MQTT pub/sub over HTTP",
      decision:
        "Edge devices publish telemetry to a Mosquitto broker over MQTT instead of calling a REST API. Telemetry goes at QoS 0 (fire-and-forget); only the analysis → dashboard event path uses QoS 1.",
      why: "Pub/sub decouples the edge firmware from the ingestion service entirely — the ESP32 doesn't need to know who's listening, and a single wildcard subscription (iiot/+/+/+/telemetry) means new sites and sensors need no pipeline reconfiguration. At a 5-second cadence, the occasional lost packet costs nothing, so paying for QoS 1 acknowledgements on the high-volume path wasn't worth it.",
    },
    {
      tag: "extensibility",
      title: "Canonical schema + parser registry",
      decision:
        "Every sensor payload is normalised by a dedicated parser (Strategy pattern) into a fixed InfluxDB schema before it touches the database. No sensor-specific logic lives in the three core services.",
      why: "Adding an already-supported sensor is zero-touch — a discovery loop registers it automatically. A genuinely new sensor type is a new parser file (~48 lines on average) plus a one-line map entry and a pipeline restart; across 16 sensor types, the three core services never changed. The report names hot-reloading of the parser catalogue as the current scalability boundary.",
    },
    {
      tag: "integrity",
      title: "Single-writer rule",
      decision:
        "Only the ingestion pipeline writes to the telemetry measurement. The dashboard and analysis service are strictly read-only against it; the analysis service writes its derived results to separate measurements.",
      why: "Removes an entire class of write races and makes data lineage obvious: if something's wrong in the raw data, there's exactly one place to look. Raw readings stay immutable, and InfluxDB permissions collapse to one writer.",
    },
    {
      tag: "ops",
      title: "Zero-config sensor discovery",
      decision:
        "The dashboard periodically scans InfluxDB for sensor IDs not yet in the registry and auto-registers them with type-appropriate defaults — without ever overwriting a manually-configured entry. The analysis loop discovers its assets the same way, from telemetry in the last hour.",
      why: "Plugging in a new sensor of an already-supported type should require zero code changes and zero redeploys. Manual entries always win the merge, so an operator's edits are never silently reverted by the next discovery cycle.",
    },
    {
      tag: "storage",
      title: "InfluxDB over relational / document stores",
      decision:
        "Time-series data lives in InfluxDB 2.8, queried with Flux, rather than PostgreSQL or MongoDB.",
      why: "Sensor telemetry is fundamentally a write-heavy time series with tag-based querying, retention policies and downsampling as first-class needs — exactly InfluxDB's design centre. The indexed-tags vs compressed-fields split is deliberate and drives query performance.",
    },
    {
      tag: "security",
      title: "TLS 1.2 + local CA, even on the LAN",
      decision:
        "The MQTT broker runs behind TLS 1.2 with a self-signed local CA (RSA-4096, 10-year), per-user credentials (PBKDF2-SHA512) and topic-level ACLs — no anonymous access, no plaintext listener.",
      why: "Industrial networks aren't automatically trusted networks; the real threat is a LAN man-in-the-middle or a rogue edge device. Two ESP32-specific fixes were needed: mbedTLS compares the broker IP against DNS SAN entries, and TLS validation fails while the device clock sits at epoch 0 — so the firmware gates the MQTT connection on NTP sync.",
    },
    {
      tag: "performance",
      title: "Sequential per-asset analysis, benchmarked honestly",
      decision:
        "The anomaly-detection loop processes assets one at a time rather than in parallel — and that limitation is measured and documented, not hidden.",
      why: "Benchmarking showed strictly linear O(N) scaling at ~107 ms/asset with no outliers. The 30-second loop budget holds to 100 assets measured (300 fails at 32 s); the often-quoted '~280 assets' is an interpolation, not a measured point. That's well beyond STAR Institute's real scale, so parallelising by site was deliberately deferred rather than built speculatively.",
    },
    {
      tag: "observability",
      title: "No silent drops",
      decision:
        "The pipeline never discards a malformed or uncatalogued message quietly. Each drop increments a typed counter, writes a throttled JSON-Lines record, and is published on iiot/pipeline/drops; the dashboard keeps a ring buffer and exposes it on a /logs page over Socket.IO.",
      why: "Integration failures are the normal failure mode of a heterogeneous sensor fleet, and they must be traceable without SSH-ing into a container to read log files. A dropped message you can see is a bug report; one you can't is a mystery.",
    },
    {
      tag: "analytics",
      title: "Deterministic analytics — no unsupervised ML",
      decision:
        "Anomaly detection is Z-Score plus moving-average deviation; risk is a fixed weighted sum; remaining-useful-life is a closed-form degradation curve; forecasting is ordinary least squares with no external dependencies. Vibration thresholds come straight from ISO 10816-1.",
      why: "For a monitoring system an operator has to trust and act on, every alert needs to be explainable after the fact. A deterministic pipeline can be audited line by line; an unsupervised model can't, and it wasn't warranted at this scale.",
    },
    {
      tag: "process",
      title: "Architecture-as-contract for AI-assisted development",
      decision:
        "A CLAUDE.md file encodes the canonical schema, the single-writer rule and the naming conventions as hard constraints for AI-assisted coding, enforced through a PRD → issue → TDD → review pipeline.",
      why: "AI-assisted development is only as good as the guardrails around it. Treating the architecture doc as an enforceable contract — not just reference material — kept 313 automated tests and 56 resolved issues consistent with the schema throughout the build.",
    },
  ],

  stack: [
    {
      layer: "Edge",
      items: ["C/C++ (Arduino / PlatformIO)", "M5Stack CoreS3 (ESP32-S3)", "Modbus RTU / RS-485", "I2C", "PubSubClient", "ArduinoJson"],
    },
    { layer: "Transport", items: ["MQTT", "Eclipse Mosquitto 2.0", "TLS 1.2", "QoS 0 telemetry / QoS 1 events"] },
    { layer: "Storage", items: ["InfluxDB 2.8", "Flux"] },
    { layer: "Platform", items: ["Node.js 18", "@influxdata/influxdb-client", "mqtt"] },
    { layer: "Business", items: ["Python 3.11", "FastAPI", "Uvicorn", "Pandas", "Pydantic", "paho-mqtt"] },
    { layer: "Dashboard", items: ["Node.js", "Express", "EJS", "Socket.IO", "Chart.js"] },
    { layer: "Infra & tooling", items: ["Docker Compose (5 containers)", "Git", "JetBrains IDEs", "Claude Code"] },
  ],

  stats: [
    { value: "16", label: "sensor types integrated" },
    { value: "3", label: "ran on real hardware" },
    { value: "6", label: "industrial domains" },
    { value: "~107ms", label: "analysis latency / asset" },
    { value: "313", label: "automated tests" },
    { value: "56", label: "resolved issues" },
  ],
  statsNote:
    "Validated end-to-end in Docker, mostly against synthetic telemetry from the built-in simulator; the throughput test moved 216 messages/minute with zero drops. Analysis scaling stays linear up to 100 assets measured (~280 by interpolation) before the 30-second loop budget is missed — the known ceiling of the current sequential design.",

  reality: {
    intro:
      "What the numbers above don't say on their own — the honest state of the system at delivery.",
    rows: [
      {
        claim: "16 sensor types integrated",
        reality:
          "Three models ran on real hardware — BME688 (environment), SDM630MCT (energy), WTVB01 (vibration). The other 13 exist as a parser plus a simulator profile, never physically connected.",
      },
      {
        claim: "6 domains across 3 sites",
        reality:
          "The sites and most sensors are simulated. End-to-end validation ran ~18 simulated sensors through the real pipeline, storage and analysis path.",
      },
      {
        claim: "CNC machining monitoring",
        reality:
          "The vibration sensor is installed on STAR Institute's CNC and the pipeline ingests from it, but no real machining sessions were captured by the delivery date. The per-material vibration profiles are theoretical (ISO / literature), not measured.",
      },
      {
        claim: "handles ~280 concurrent assets",
        reality:
          "That figure is 30 s ÷ 107 ms — an interpolation. Measured: 100 assets pass the loop budget at 10.8 s; 300 fail at 32 s.",
      },
      {
        claim: "ready for STAR Institute's production ecosystem",
        reality:
          "Handed over as the degree deliverable — validated, documented, and containerised — not running in production.",
      },
    ],
  },

  cta: {
    blurb:
      "Built solo, end to end — firmware, ingestion pipeline, analysis service and dashboard — as a final-year Computer Engineering project. It also produced a scientific article, submitted to the Millenium journal.",
  },
};

export default iiot;
