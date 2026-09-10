# IIoT Trace — Fact Dossier

Raw material for a deep, accurate case-study page. Every claim is cited to a file
path. Two source trees:

- **Project code / docs:** `C:\Users\nunog\Desktop\ProjetoFinal\IIoTStarInstitute`
  (referred to below as `<repo>`)
- **Report / media:** `C:\Users\nunog\Desktop\ProjetoFinal`
  (referred to below as `<proj>`). Report PDF:
  `<proj>\Relatorio\Relatorio_PDF\relatorio_NunoSantos28447.pdf`
  (section numbers below are that PDF's).

Cross-checked against the existing case-study page
`app/projects/industrial-iot-platform/page.tsx`. Corrections to that page are
called out inline and collected in **§9**.

---

## 1. What it is + honest status

**One-paragraph description.** IIoT Trace is a sensor-agnostic monitoring and
analysis platform for industrial environments, built as a final-year Computer
Engineering degree project (ESTGV / IPV, 2025/2026) in partnership with **STAR
Institute** (Science & Technology Applied Research, Viseu). It ingests
heterogeneous sensor telemetry through a single canonical schema and turns it
into real-time dashboards, statistical anomaly alerts, risk scores and RUL
(remaining-useful-life) estimates. An ESP32-S3 edge node (M5Stack CoreS3) polls
industrial sensors over Modbus RTU / RS-485 and I2C and publishes context-rich
JSON envelopes over MQTT; a Node.js pipeline is the sole writer of that telemetry
into InfluxDB; a FastAPI/Python service reads it back to score risk and detect
anomalies; a Node.js/EJS dashboard renders everything live over Socket.IO.
Source: `<repo>\README.md` lines 1–20; report §1.2, §3.1.

**Honest status — it is an internship / academic deliverable, not a shipped
product.**

- Validated end-to-end in a Dockerised deployment, mostly against **synthetic
  telemetry** from the built-in simulator. Report §5.1: validation ran "18 active
  sensors distributed across the three test sites" — these were simulated
  (`<repo>\data-pipeline\simulador.js`, `npm run simulate`).
- **Only 3 sensor models ever ran on real hardware:** BME688 (I2C), SDM630MCT
  (energy, RS-485) and WitMotion WTVB01 (vibration, RS-485, in `-485` and `-CNC`
  firmware variants). The edge firmware `<repo>\edge\cores3-cnc\src\main.cpp`
  only implements those three; every other supported sensor exists as a parser +
  simulator profile, never physically connected.
- **The CNC use case is infrastructure-complete but has no real data.** Report
  §5.4 / §6.2: the WTVB01-485 is physically installed on STAR Institute's CNC and
  the pipeline works, but "until the delivery date, no sufficient real machining
  sessions were recorded" because the operator must select a material on the
  CoreS3 touchscreen before each job and that step was not yet part of the
  factory workflow. The per-material vibration profiles (Table 19) are
  **theoretical** (derived from Trent & Wright, 2004), not measured.
- Report §6.1 states the platform is "ready for integration into STAR Institute's
  production ecosystem" — i.e. handed over, not running in production.
- The project also produced a scientific article (submitted to *Millenium*
  journal, multiple revision rounds): `<proj>\Relatorio\artigo_cientifico\`.

**Brand.** Product name **IIoT Trace**, tagline **"Detect · Predict · Prevent"**
(`<repo>\README.md` lines 5–6). Brand spec (report §4.5): navy `#0A1628`, cyan
`#00B8D9`, fonts Saira + JetBrains Mono. Note the report itself is inconsistent
("STAR IIoT Trace", "STAR IIoT Monitor", "STAR IIoT Platform" all appear); the
canonical name is IIoT Trace.

---

## 2. Architecture (diagram-level detail)

### 2.1 Three tiers

Source: `<repo>\README.md` lines 47–72; report §3.1 (Figura 2), §4.7.

```
                         EDGE TIER  (not containerised)
  ┌───────────────────────────────────────────────────────────────────┐
  │  [Eastron SDM630MCT] ──RS-485 (Modbus RTU, 9600 8N1, FC04)──┐      │
  │  [WitMotion WTVB01 ] ──RS-485 (Modbus RTU, 9600 8N1, FC03)──┤      │
  │  [Bosch BME688     ] ──I2C (0x77/0x76, GPIO1/2)─────────────┤      │
  │                                                             ▼      │
  │                                    M5Stack CoreS3 (ESP32-S3)       │
  │                     - polls each bus, builds JSON envelope         │
  │                     - touchscreen: material select + CNC session   │
  │                     - fallback to simulated values if a sensor     │
  │                       does not answer at boot ("simulated": true)  │
  │                     - publishes every 5 s over MQTT/TLS 1.2        │
  └───────────────────────────────┬───────────────────────────────────┘
                                  │  MQTTS 8883
       topic: iiot/{site_id}/{cluster_id}/{sensor_id}/telemetry
                                  ▼
                       PLATFORM TIER  (Docker, network iiot_net)
  ┌───────────────────────────────────────────────────────────────────┐
  │  [Eclipse Mosquitto 2.0]  TLS 1.2 :8883, auth + ACL, no anon      │
  │             │  subscribes  iiot/+/+/+/telemetry                    │
  │             ▼                                                      │
  │  [data-pipeline  (Node.js 18)]   ── SOLE WRITER ──►  [InfluxDB 2.8]│
  │    resolveTopicContext → validate envelope → resolve parser by     │
  │    sensor_type → parser.parse() + parser.getAlerts() →             │
  │    writeTelemetry(measurement=telemetry)                           │
  │    drops (bad topic / missing ctx / no parser / parse error) →     │
  │    dropLogger → JSON-Lines file + MQTT iiot/pipeline/drops         │
  └───────────────────────────────┬───────────────────────────────────┘
                                  │  read-only (Flux)
                                  ▼
                        BUSINESS TIER  (Docker)
  ┌───────────────────────────────────────────────────────────────────┐
  │  [analysis-service (FastAPI / Python 3.11)]                        │
  │    - background daemon thread, one cycle every loop interval       │
  │    - discovers active asset_ids from telemetry (last -1h)          │
  │    - per asset: anomaly detection, feature extraction, risk score, │
  │      RUL, machine-state, threshold + specialised detectors,        │
  │      linear forecast                                               │
  │    - writes analysis_results + operational_states (its own         │
  │      measurements — never telemetry)                               │
  │    - publishes iiot/{site_id}/{location_id}/analysis  (QoS 1)      │
  │    - also serves reactive REST endpoints (/v1/inference, …)        │
  │                                                                    │
  │  [dashboard (Node.js / Express / EJS / Socket.IO)]                 │
  │    - read-only on InfluxDB (Flux)                                  │
  │    - Discovery loop: scan InfluxDB tags, auto-register new         │
  │      sensors into sensor-registry.json (startup + every 24h)       │
  │    - subscribes iiot/+/+/analysis (QoS 1) and iiot/pipeline/drops  │
  │    - REST calls to analysis-service for risk / alerts              │
  │    - browser updates over Socket.IO; charts via Chart.js           │
  └───────────────────────────────────────────────────────────────────┘
```

Five containers in `<repo>\docker-compose.yml`: `mosquitto`, `influxdb`,
`data-pipeline`, `dashboard`, `analysis`. Ports exposed: dashboard `3001`,
InfluxDB `8086`, FastAPI `8000`, MQTT `8883`. InfluxDB org
`Star_Institute_IIOT`, bucket `SensorData`, retention `0` (infinite).
Volumes `influxdb_data`, `mosquitto_data`. The edge firmware is the only
component outside Docker.

### 2.2 Services in detail

| Service | Language / framework | Role | Key files |
|---|---|---|---|
| `edge/cores3-cnc` | C++ (Arduino/PlatformIO) | Poll 3 sensors, build envelope, publish MQTT every 5 s, touchscreen UI for CNC material/session | `<repo>\edge\cores3-cnc\src\main.cpp` |
| `data-pipeline` | Node.js 18 | MQTT subscriber; **only writer** to `telemetry`; parser resolution; drop logging | `<repo>\data-pipeline\app.js`, `lib\context.js`, `lib\influx.js`, `lib\dropLogger.js` |
| `shared/parsers` | Node.js | Canonical parsers (`parse`, `getAlerts`, `THRESHOLDS`), auto-discovered from the folder | `<repo>\shared\parsers\index.js` + 16 parser files |
| `analysis-service` | Python 3.11 / FastAPI | Proactive analysis loop + reactive REST; anomaly detection, risk, RUL, forecast, state | `<repo>\analysis-service\services\analysis_loop.py`, `anomaly_detection.py`, `risk_engine.py` |
| `dashboard` | Node.js / Express / EJS / Socket.IO | Read-only views, real-time alerts, sensor discovery, `/logs` page | `<repo>\dashboard\src\services\discoveryService.js`, `realtime\mqttAnalysisSubscriber.js` |

### 2.3 Data flow (one telemetry point)

Source: report §4.2–§4.3 (Figura 5 is the sequence diagram),
`<repo>\data-pipeline\app.js` lines 53–98.

1. CoreS3 reads raw registers (no unit conversion on-device), wraps them in a
   JSON envelope with full context, publishes to
   `iiot/{site_id}/{cluster_id}/{sensor_id}/telemetry`.
2. `data-pipeline` receives on `iiot/+/+/+/telemetry`. `resolveTopicContext`
   parses the 3 topic segments; a non-matching topic → `drop:bad_topic`.
3. Envelope parsed; context merged: **registry defaults ← topic ← payload**
   (payload wins). `findMissingContextFields` requires `sensor_type`,
   `sensor_id`, `site_id`, `location_id`, `device_id`, `domain`, `asset_id`;
   missing → `drop:missing_ctx` (logged, not silently dropped).
4. Parser resolved: explicit `parser_key` in payload → registry entry →
   `SENSOR_TYPE_TO_PARSER[sensor_type]`. No parser → `drop:no_parser`.
5. `parser.parse(payload)` normalises field names to canonical; `getAlerts()`
   evaluates thresholds → `ok | warn | critical`; `hasAlert` = any non-ok.
6. `writeTelemetry(ctx, parsed, hasAlert, timestamp)` writes one point to
   `measurement=telemetry` with the canonical tags + fields + `alert` tag.
   Parse exception → `drop:parse_error`.
7. `analysis-service` loop (next cycle) discovers the asset from recent
   telemetry, runs its pipeline, writes `analysis_results`, publishes
   `iiot/{site_id}/{location_id}/analysis`.
8. `dashboard` shows the raw point (Flux poll, default every 2 s) and the
   analysis event (MQTT push).

### 2.4 MQTT topic scheme

Source: `<repo>\data-pipeline\config\sensor-config.js` lines 1–22;
`<repo>\README.md` lines 76–86; `<repo>\mosquitto\config\acl`;
`<repo>\analysis-service\services\analysis_loop.py` line 314;
`<repo>\dashboard\src\realtime\mqttAnalysisSubscriber.js` lines 47–50.

| Topic | Direction | QoS | Purpose |
|---|---|---|---|
| `iiot/{site_id}/{cluster_id}/{sensor_id}/telemetry` | edge/simulator → broker | **0** (see §9) | Raw sensor telemetry. Publisher fills `site_id`, `cluster_id`, `sensor_id` from the topic; `location_id`, `device_id`, `asset_id`, `domain` come from the JSON envelope. |
| `iiot/+/+/+/telemetry` | broker → data-pipeline | 0 | One subscription captures every sensor at every site. |
| `iiot/{site_id}/{location_id}/analysis` | analysis-service → broker → dashboard | **1** | Per-asset analysis result (risk score, classification, RUL, anomalies, alerts, forecast) as `AnalysisResult` JSON. Note: keyed by `location_id`, not `cluster_id`. |
| `iiot/+/+/analysis` | broker → dashboard | 1 | Dashboard subscription for analysis events. |
| `iiot/pipeline/drops` | data-pipeline → broker → dashboard | 0 | Structured drop events for the `/logs` page (in-memory ring buffer of 100). |

Envelope example (`<repo>\README.md` lines 92–105):

```json
{
  "sensor_type": "BME688",
  "site_id":     "fabrica_01",
  "sensor_id":   "bme688_lab_01",
  "cluster_id":  "esp32_cluster_b",
  "timestamp":   "2025-03-24T10:00:00Z",
  "data": { "temperature": 23.5, "humidity": 55.2, "pressure": 1013.1 }
}
```

A flat payload (no `data` wrapper) is also accepted; the parser separates context
keys from domain keys.

**Broker security** (`<repo>\mosquitto\config\mosquitto.conf`, `acl`; report §4.8):
listener `8883` only (no `1883` plaintext), `tls_version tlsv1.2`,
`allow_anonymous false`, `require_certificate false` (no mTLS — that is future
work). Password file uses PBKDF2-SHA512. Three ACL users:
`iiot_pipeline` (readwrite `iiot/#`), `iiot_reader` (read `iiot/#`),
`analysis_svc` (write `iiot/#`). (Report §4.8.3 mentions only the first two; the
code has three.)

### 2.5 Canonical InfluxDB schema

Source: `<repo>\CLAUDE.md` lines 15–112; `<repo>\README.md` lines 146–164;
report Anexo E (`<proj>\Relatorio\AnexoE_SchemaCanonicoInfluxDB.docx`).

- **Two measurements, strict ownership:**
  - `telemetry` — written **only** by `data-pipeline`. Raw normalised readings +
    `alert` tag. Immutable after write.
  - `analysis_results` — written only by `analysis-service` (Z-Score / moving-avg
    results, risk, RUL, counts).
  - `operational_states` — also written by `analysis-service`, event-driven, on
    machine-state transitions only, with the duration of the previous state.
- **Required tags on every `telemetry` point:** `site_id`, `location_id`,
  `cluster_id`, `device_id`, `sensor_id`, `sensor_type`, `domain`, `asset_id`,
  `alert`, `source`.
- **Fields by domain:**

| Domain | Canonical fields |
|---|---|
| `energy` | `voltage_l1/l2/l3`, `current_l1/l2/l3`, `active_power`, `power_factor`, `frequency`, `import_energy`, `total_energy`, `thd_v1`, `thd_i1` |
| `environment` | `temperature`, `humidity`, `pressure`, `iaq`, `gas_resistance`, PM fields (`pm1_0/pm2_5/pm4_0/pm10`), `voc_eq`, `nox_index`, `co2_eq`, `object_temperature`, `ambient_temperature`, `thermocouple_temperature`, `internal_temperature`, MAX31855 `fault_*` |
| `vibration` | `acceleration_x/y/z`, `rms_x/y/z`, `rms_total`, `temperature_internal` |
| `proximity` | `distance_mm`, `distance_m`, `distance_cm`, `sigma_mm`, `signal_rate_mcps`, `ambient_rate_mcps`, `range_status_code`, `liquid_level_percent` |
| `flow` | `flow_velocity`, `volumetric_flow`, `total_net_flow`, `signal_quality` (KLINGER_ST); `flow_rate`, `total_consumption`, `medium_pressure`, `medium_temperature` (SD6501) |
| `cnc` | `rms_x/y/z`, `rms_total` (= √(x²+y²+z²)), `spindle_speed`, `ambient_temperature`; **extra tags** `material`, `session_id` |

- Schema rules (`<repo>\CLAUDE.md` lines 104–112): no measurements named
  `vibration`/`energy`/`environment` — always `telemetry` filtered by `domain`
  tag; no field aliases (`accel_x`, `reactive_power`, `object_temp` …), only
  canonical names; `domain=cnc` isolated from `domain=vibration`; CNC points are
  sparse/event-driven.

---

## 3. Verified engineering decisions + why

The existing page lists 8. Verdict on each, then additions.

### D1. MQTT pub/sub over HTTP/REST — **CONFIRMED (transport), QoS claim WRONG**

Edge publishes telemetry to Mosquitto instead of calling a REST API. Pub/sub
decouples firmware from ingestion; the ESP32 does not know who consumes.
Wildcard `iiot/+/+/+/telemetry` means new sites/sensors need no pipeline
reconfiguration. Source: report §3.3, §4.3; `<repo>\data-pipeline\app.js` 44–51.

**Correction:** the page says telemetry is published at **QoS 1** ("at-least-once
delivery on flaky Wi-Fi"). It is not. The ESP32 uses `PubSubClient`
(`mqtt.publish(topic, buf)` — `<repo>\edge\cores3-cnc\src\main.cpp` line 283),
which only supports **QoS 0** on publish. The pipeline's subscribe
(`<repo>\data-pipeline\app.js` line 47) passes no QoS option → **QoS 0**. The
only QoS-1 path in the system is analysis-service → dashboard on
`iiot/+/+/analysis` (`mqtt_publisher.py` line 67 `qos=1`;
`mqttAnalysisSubscriber.js` line 47 `{ qos: 1 }`). Report §4.3 also claims
"QoS 1 (at least once)" for the pipeline — this appears to be aspirational; it is
not backed by the firmware or the subscribe call. If the page keeps a QoS point,
it should say: telemetry path is QoS 0 (fire-and-forget, 5 s cadence tolerates
loss); the analytics event path is QoS 1.

### D2. Canonical schema + parser registry (Strategy pattern) — **CONFIRMED, one caveat**

Every payload is normalised by a `sensor_type`-keyed parser into the fixed
InfluxDB schema before persistence; no sensor-specific logic in the core
services. New hardware = new parser file. Report §4.2.2 explicitly calls it "a
variant of the Strategy pattern" respecting SRP/SOLID. Auto-discovery:
`shared/parsers/index.js` loads every `*.js` in the folder at startup — no manual
registration of the parser itself.

Evidence for "held up in practice" (report §5.2, Table 17; §6.1): 16 hardware
types integrated at ~45 LOC average, **0 LOC** changed in data-pipeline,
dashboard or analysis-service for the three sensors measured (KLINGER_ST 51,
SD6501 49, SHT31 36 lines — all in `shared/parsers/`). My own `wc -l` on all 16
`shared/parsers/*.js`: total 776 lines, mean ≈ 48, range 36–79.

**Caveat the page overstates:** a genuinely new `sensor_type` still needs (a) a
new entry in `SENSOR_TYPE_TO_PARSER` in
`<repo>\data-pipeline\config\sensor-config.js` and (b) a **partial restart of the
pipeline** to pick up the static catalogue — report §4.2.2 names this as "the
current boundary of the system's scalability" and lists hot-reloading as future
work. Zero-config applies to *new instances of an already-supported type*, not to
new types.

### D3. Single-writer rule — **CONFIRMED**

Only `data-pipeline` writes `measurement=telemetry`; dashboard and
analysis-service are strictly read-only against it. analysis-service writes its
derived results to separate measurements (`analysis_results`,
`operational_states`). Removes write races, makes lineage obvious, simplifies
InfluxDB permissions. Source: `<repo>\CLAUDE.md` 104–106; `<repo>\README.md`
137–144; report §4.3, §4.4 (which explicitly notes analysis keeps "its own
diagnostic metrics" without touching raw telemetry).

### D4. Zero-config sensor discovery — **CONFIRMED**

`discoveryService.js` (`<repo>\dashboard\src\services\discoveryService.js`):
`runDiscovery()` scans InfluxDB for `sensor_id`s not in `sensor-registry.json`,
persists new ones with type-appropriate defaults; **manual entries always win** —
`newOnes = found.filter(s => !manualIds.has(s.sensor_id))`, so a manually
configured entry is never overwritten by a discovery cycle. Runs once at startup
then on `setInterval` (`intervalMs` default `86_400_000` = 24 h, configurable —
`<repo>\dashboard\src\config\runtime.js` lines 27–32). Unsupported types
(`parser_key = null`) are still registered and badged. The analysis-service
extends the same idea: its loop discovers `asset_id`s from telemetry in the last
`-1h` (`analysis_loop.py` line 338) — no asset list to configure. Report §4.5.A,
§5.1.2 (validated by flipping `is_active` on a dormant sensor and watching it
appear next cycle with no restart).

Minor page wording: it calls this "a background job"; discovery actually runs
*inside the dashboard process*, and asset-discovery separately inside the
analysis loop.

### D5. InfluxDB over relational / document stores — **CONFIRMED**

Time-series data in InfluxDB 2.8, queried with Flux. Rationale: write-heavy time
series, tag-indexed querying, retention/downsampling as first-class; tags
(low-cardinality, indexed) vs fields (compressed) split is deliberate and drives
Flux query performance. Source: report §3.4 (Tabela 12 compares DBs), §4.3.
`<repo>\docker-compose.yml` pins `influxdb:2.8`.

### D6. TLS 1.2 + local CA on the LAN — **CONFIRMED, add detail**

Broker: TLS 1.2 on 8883, self-signed local CA, per-user credentials,
topic-level ACLs, `allow_anonymous false`, no plaintext listener. Rationale
(report §4.8.1): the relevant threat is LAN man-in-the-middle / rogue edge device
on a shared industrial network — "internal so it's fine" is the failure mode
being rejected. Details worth using: CA is RSA-4096, 10-year validity; broker
cert RSA-2048; the generator is a committed, reproducible `generate.sh` taking
the host IP; cert material is git-ignored. Two ESP32-specific fixes (report
§4.8.4): mbedTLS on the ESP32 compares an IP host against **DNS** SAN entries, so
the host IP is added as both a DNS and an IP SAN; and TLS validation fails while
the ESP32 clock is at epoch 0, so the firmware gates the MQTT connection on NTP
sync (`time() > 1_700_000_000`). Pipeline connects with full cert verification
(`rejectUnauthorized` not disabled). Source: `<repo>\mosquitto\config\*`,
`<repo>\edge\cores3-cnc\src\main.cpp` 30–37, report §4.8.

### D7. Sequential per-asset analysis, benchmarked honestly — **CONFIRMED (numbers hold), "280" is interpolated**

The analysis loop processes assets one at a time; there is no cross-asset
parallelism. Report §5.3 (Tabela 18, Figura 17) and
`<repo>\benchmarks\results\benchmark_results.json`:

| N assets | total loop (s) | per-asset avg (s) | 30 s SLO | 60 s SLO |
|---:|---:|---:|:--|:--|
| 3 | 0.285 | 0.095 | PASS | PASS |
| 10 | 1.021 | 0.102 | PASS | PASS |
| 25 | 2.619 | 0.105 | PASS | PASS |
| 50 | 5.341 | 0.107 | PASS | PASS |
| 100 | 10.796 | 0.108 | PASS | PASS |
| 300 | 32.056 | 0.107 | **FAIL** | PASS |

Strictly linear O(N), ~107 ms/asset regardless of load (max observed 128 ms — no
outliers), because per asset the cost is one Flux read + one write and network
I/O latency is constant. The 30 s SLO = 50 % of a 60 s loop interval (report
§5.3). SLO broken at N=300 (32.1 s). The **"~280 assets" figure on the page
matches the report's own conclusion (§6.1) but is an interpolation** (30 s ÷
0.107 s ≈ 280) — the highest *measured* passing point is 100, and 300 fails.
Parallelising by `site_id` (a first-class tag) is deliberately deferred; report
§6.2 estimates it would cut the 32 s case to ≈ 11 s. STAR Institute's real scale
is nowhere near this, so it was not built speculatively.

Note: `<repo>\analysis-service\config.py` line 28 default is
`ANALYSIS_INTERVAL_MS = 30000` (30 s); the report's SLO story assumes a 60 s
interval set via `.env`.

### D8. Architecture-as-contract for AI-assisted development — **CONFIRMED**

`<repo>\CLAUDE.md` encodes the canonical schema, the single-writer rule and the
naming ban-list (e.g. `object_temperature` not `object_temp`) as hard
constraints. Workflow (report §4.6, Anexo A): `/grill-me` → `/write-a-prd` →
`/prd-to-issues` (vertical slices as GitHub issues) → `/tdd` (red-green-refactor)
→ `code-reviewer` + `/simplify` agents. Outcome (report §6.1): **56 resolved
issues and 313 automated tests**, schema-consistent throughout. Report §5.6.2
gives a concrete example (GitHub issue #10): TDD on two known bugs surfaced a
third (a `break` that suppressed cross-domain alerts — now the `fired_metrics`
set in `analysis_loop.py`). `<repo>\plans\` holds the actual PRDs; the ralph-loop
script is `<repo>\plans\ralph.sh`.

### Decisions the page is MISSING

- **D9. No silent drops — auditable 3-layer drop log.** The pipeline never
  discards a malformed/uncatalogued message quietly: it increments a typed
  counter, writes a throttled JSON-Lines record (`lib/dropLogger.js`), and emits
  `iiot/pipeline/drops`; the dashboard keeps a 100-entry ring buffer and exposes
  it on `/logs` over Socket.IO. Rationale: integration failures must be traceable
  without SSH-ing to read log files. Source: report §4.2.2, §4.3;
  `<repo>\data-pipeline\app.js` 53–98; `<repo>\dashboard\src\services\dropLogService.js`.
- **D10. Thin edge, fat pipeline (deliberate trade-off).** The CoreS3 does zero
  unit conversion or statistics — it ships raw register values in a
  context-tagged envelope. Trade-off (report §4.2.1): more dependence on network
  + pipeline availability, in exchange for being able to change a conversion
  factor or an alert threshold by editing a server-side parser instead of
  re-flashing field devices.
- **D11. Deterministic, auditable analytics — no unsupervised ML.** Anomaly
  detection is Z-Score + moving-average deviation; risk is a fixed weighted sum
  (vibration 0.5 / imbalance 0.3 / temp-drift 0.2); RUL is a closed-form
  degradation curve; forecast is OLS linear regression with no external deps.
  Report §4.4 explicitly frames this as "deterministic and auditable, dispensing
  with unsupervised ML models". Vibration thresholds are sourced from **ISO
  10816-1 Class I** (< 15 kW machines): Zone A/B < 1.80 mm/s = ok, Zone C
  1.80–4.50 = warn, Zone D ≥ 4.50 = critical
  (`<repo>\analysis-service\config.py` 79–90).
- **D12. Config externalised for portability.** Every service reads credentials /
  URLs / ports / thresholds / loop interval / Z-Score & MA windows from `.env`;
  Docker volumes persist InfluxDB + broker state; adapting to a new site is
  "update the Sensor Registry inventory, images unchanged" (report §4.7).
- **D13. Fallback simulation in the firmware.** If a sensor does not answer at
  boot, the CoreS3 keeps publishing with synthesised values and flags
  `"simulated": true` in the CNC payload; the bundled `ModbusMaster` lib has its
  timeout cut from 2000 ms → 200 ms so one dead sensor cannot freeze the UI.
  Source: `<repo>\edge\cores3-cnc\README.md` lines 43–51.
- **D14. Machine-state inference is event-driven, not sampled.** `StateTracker`
  keeps last state per asset in memory and writes to `operational_states` **only
  on a transition**, with the previous state's exact duration — enough to compute
  a lightweight OEE without continuous polling. Source:
  `<repo>\analysis-service\services\analysis_loop.py` 123–162; report §4.4.D.
- **D15. Stuck-sensor detection is gated on machine state.** The stuck detector
  only runs while the asset is `RUNNING`, so a stable reading during a legitimate
  stop is not flagged. Known limitation (report §4.4.E): it cannot tell a
  hardware fault from a comms fault without CRC/NACK/timeout counters that are not
  persisted.

---

## 4. Hard numbers (verified, with source)

| Number | Value | Source | Notes |
|---|---|---|---|
| Sensor types supported | **16** | `SENSOR_TYPE_TO_PARSER` in `<repo>\data-pipeline\config\sensor-config.js` (16 keys); 16 files in `<repo>\shared\parsers\`; 16 dirs in `<repo>\dashboard\sensors_modules\`; report §5.2 | Page "16" ✔ |
| Sensor types on **real hardware** | **3** (BME688, SDM630MCT, WTVB01 `-485`/`-CNC`) | `<repo>\edge\cores3-cnc\src\main.cpp` — only these three implemented | Not stated on page; the other 13 are simulator + parser only |
| Industrial domains | **6**: energy, environment, vibration, proximity, flow, cnc | `<repo>\CLAUDE.md`; report §5.2 | Page "6" ✔. Note `UBIQUITOUS_LANGUAGE.md` lists only 5 (pre-CNC); the **poster** also says "5" (older). Final report says 6. |
| Sites simulated | **3**: `fabrica_01`, `fabrica_02`, `sede_01` | `<repo>\data-pipeline\config\sensor-config.js`; report §5.2 | Page "3" ✔ |
| Active sensors at validation | **22** (registry); **18** producing telemetry during the throughput test | report §5.2 ("22 sensores ativos"), §5.1.1 ("18 active sensors") | `sensor-config.js` has 20 seed entries; the runtime `sensor-registry.json` is discovery-populated |
| Avg LOC per new sensor | **~45** (report figure); ≈ 48 by my count | report §6.1; Table 17 (KLINGER_ST 51 / SD6501 49 / SHT31 36); my `wc -l` of 16 `shared/parsers/*.js` = 776 total | Page "~45" ✔ (report's own number) |
| LOC changed in core services per new sensor | **0** | report Table 17 (data-pipeline / dashboard / analysis-service columns all 0 for the 3 measured) | True for already-mapped types; new `sensor_type` still needs a 1-line map entry + pipeline restart |
| Analysis latency per asset | **~107 ms** avg (max 128 ms) | `<repo>\benchmarks\results\benchmark_results.json`; report §5.1.1, §5.3 | Page "107ms" ✔ |
| Loop scaling | **linear O(N)**; 30 s SLO fails at N=300 (32.1 s); N=100 = 10.8 s | `<repo>\benchmarks\results\benchmark_results.json`; report §5.3 Tabela 18 | Page "~280 concurrent assets" = interpolation, matches report §6.1 |
| Automated tests | **313** across **23 suites** | report §5.6.1 Tabela 21 | Page "313" ✔. Breakdown: analysis-service 117 (10 files), data-pipeline 95 (6), dashboard 101 (7 = 88 Jest + 13 standalone `alertLabels`) |
| Resolved issues | **56** | report §6.1 | Page "56" ✔ |
| Test coverage | analysis-service 55 % global / 92 % on pure logic; data-pipeline 93 % statements / 96 % lines; dashboard ~55 % statements | report §5.6.1 Tabela 21 | Not on page |
| Cyclomatic complexity | only 1 function rated "C": `_run_asset` (CC 15); nothing D+ | report §5.6.1 | The 8-step per-asset orchestration |
| Throughput (validation) | **216 msg/min (3.6 msg/s)**, ≈ 1080 fields/min, **0 dropped** | report §5.1.1 | 18 sensors × 5 s interval |
| Edge publish interval | **5 s** | `<repo>\edge\cores3-cnc\README.md`; report §5.1.1 | |
| Analysis loop interval | 60 s per report SLO story; **code default 30 s** (`ANALYSIS_INTERVAL_MS`) | report §5.3; `<repo>\analysis-service\config.py` 28 | Discrepancy — real value set in gitignored `.env.docker` |
| Discovery interval | 24 h (`86_400_000` ms), configurable | `<repo>\dashboard\src\config\runtime.js` 30 | |
| Z-Score threshold | 3.0 (warn), ×1.5 → critical | `<repo>\analysis-service\config.py` 31 | |
| Moving-avg deviation | 15 % (window 5), ×2 → critical | `<repo>\analysis-service\config.py` 32–33 | Page/poster "15%" ✔ |
| ISO 10816-1 Class I limits | ok < 1.80 mm/s, warn ≥ 1.80, critical ≥ 4.50 | `<repo>\analysis-service\config.py` 79–90 | |
| CNC materials modelled | **11** (theoretical profiles) | report §5.4 Tabela 19; `<repo>\data-pipeline\cnc-profiles.js` | 0 real machining sessions captured by delivery |
| Fault-injection result | 1 of 3 detected end-to-end (spike ✔; drift ✘; stuck ✘) | `<repo>\benchmarks\results\fault_injection_results.json`; report §5.5 Tabela 20 | drift/stuck failures attributed to the *batch injection method* (future timestamps outside the `-1h` window; gaussian noise resetting the stuck counter), and were separately covered by unit tests |
| Firmware Modbus timeout | cut 2000 ms → 200 ms | `<repo>\edge\cores3-cnc\README.md` 51 | |
| PKI | CA RSA-4096 / 10 yr; broker cert RSA-2048; PBKDF2-SHA512 passwords | report §4.8.2 | |

---

## 5. Stack, by layer

Source: `<repo>\README.md` lines 181–192; report §3.7 Tabela 15; poster.

| Layer | Technology |
|---|---|
| **Edge firmware** | C/C++ (Arduino core / ESP-IDF) via **PlatformIO**; M5Stack **CoreS3 (ESP32-S3)**; libs: M5Unified/M5CoreS3, PubSubClient, ArduinoJson, ModbusMaster, Adafruit BME680; buses: Modbus RTU / RS-485 (2 independent), I2C |
| **Sensors** | Eastron SDM630MCT (energy, 3-phase), Bosch BME688 (environment), WitMotion WTVB01-485 & WTVB01-CNC (vibration); + 12 more supported via parser/simulator (SHT31, SPS30, PMS5003, SEN55, SCD40, MLX90614, AMG8833, MAX31855, VL53L1X, MB7040, KLINGER_ST ultrasonic flow, SD6501 compressed-air flow) |
| **Transport** | MQTT (**Eclipse Mosquitto 2.0**); TLS 1.2 (port 8883); telemetry QoS 0, analysis events QoS 1; MQTT.js (Node), paho-mqtt (Python), PubSubClient (firmware) |
| **Storage** | **InfluxDB 2.8**, Flux query language; bucket `SensorData`, org `Star_Institute_IIOT` |
| **Ingestion (Platform)** | **Node.js 18+**, `@influxdata/influxdb-client`, `mqtt` |
| **Analysis (Business)** | **Python 3.11+ / FastAPI**, Uvicorn, **Pandas**, Pydantic, `influxdb-client`, paho-mqtt; OLS forecast hand-rolled (no statsmodels/sklearn) |
| **Dashboard (Business)** | **Node.js / Express**, **EJS** server-side rendering, **Socket.IO**, **Chart.js** |
| **Infra & tooling** | **Docker + Docker Compose** (5 containers); Git / GitHub (Rekrl/IIoT-STARInstitute); JetBrains IDEs (CLion firmware, IntelliJ IDEA Node, PyCharm Python); **Claude Code** for AI-assisted development; benchmark harness in Python (matplotlib) |

---

## 6. Report figures worth using

All in `<proj>\Relatorio\`. The report PDF is
`<proj>\Relatorio\Relatorio_PDF\relatorio_NunoSantos28447.pdf`. Loose PNGs are in
`<proj>\Relatorio\imagens\` (and `\cap4\`, `\cap5\`). Architecture DOCX anexos in
`<proj>\Relatorio\` (`AnexoB_DiagramaArquitetura`, `AnexoC_...Deployment`,
`AnexoE_SchemaCanonicoInfluxDB`, `AnexoF_SensorRegistry_Discovery`,
`AnexoG_BenchmarksETestes`).

| Figure / file | Shows | Use for |
|---|---|---|
| **Figura 2** – Arquitetura Geral (report §3.1); `<proj>\Relatorio\diagrama_arquitetura.png` | The 3-tier block diagram, edge → broker → pipeline → InfluxDB → dashboard/analysis | Redraw as the page's architecture diagram |
| `<proj>\Relatorio\imagens\Fluxo de Dados_EdgePipelineInfluxDB.png` | Edge → pipeline → InfluxDB data flow | Data-flow strip |
| **Figura 5** – Diagrama de sequência do pipeline (report §4.3) | MQTT publish → context resolve → parser → InfluxDB write, with drop branches | The "one telemetry point" walkthrough (§2.3) |
| `<proj>\Relatorio\diagrama_ligacoes.png` / **Anexo D** | CoreS3 pinout, RS-485 units, Modbus addresses, bauds | "Edge integration" detail box |
| **Figura 17** – Tempo do loop vs N assets; `<proj>\Relatorio\imagens\cap5\benchmark_loop_vs_n.png` | The linear O(N) scaling line, SLO crossing at N≈300 | The benchmark chart (D7) — the single most quotable visual |
| **Figura 18** – Perfis de vibração CNC por material; `<proj>\Relatorio\imagens\cap5\cnc_profiles_teorico.png` | RMS vs spindle speed by material family (polymer → aluminium → steel) | CNC section — label clearly as *theoretical* |
| **Figura 9** – CNC spindle speed vs vibração scatter (report §4.5) | Dashboard CNC comparison view | CNC use-case screenshot |
| **Figura 8 / 12** – Dashboard overview with active sensors; `<proj>\Relatorio\imagens\cap5\dashboardSensoresAtivosDocker.png` | Live monitoring home, location cards, active-alerts panel | Hero / product shot |
| **Figura 7** – AMG8833 thermal sensor detail; `<proj>\Relatorio\imagens\cap4\exemplo_sensor_ambiente.png` | Sensor Detail page (charts + alerts) | "Discovery generates the page" point |
| **Figura 6** – Sidebar navigation; `<proj>\Relatorio\imagens\cap4\exemplo_sidebar.png` + `barra_pesquisa.png` | Sidebar + search-to-navigate | UX detail |
| **Figura 4** – Logs do pipeline; `<proj>\Relatorio\imagens\cap4\logs_exemplo.png` / `<proj>\LogsPage.png` | `/logs` page: drop type, topic, sensor, grouped counts | D9 (no silent drops) |
| **Figura 13** – InfluxDB UI; `<proj>\Relatorio\imagens\cap5\influxUI_Docker.png` | `telemetry` measurement filling up | "single writer / immutable" point |
| **Figura 14** – FastAPI Swagger; `<proj>\Relatorio\imagens\cap5\FastAPISwagger_Docker.png` | Analysis-service endpoints | Stack / API |
| **Figura 10** – `docker compose up -d --build`; `<proj>\Relatorio\imagens\ArquiteturaDeplyment_DockerCompose.png` + **Anexo C** | 5 containers starting on `iiot_net` | Deployment / portability |
| **Figura 11** – CoreS3 ↔ Mosquitto on 8883 (TLS) | Serial log of a successful TLS MQTT connect | Security (D6) |
| **Figura 15 / 16** – `is_active` False → True; `<proj>\Relatorio\imagens\cap5\sensor_iSactive*.png` | Dormant sensor auto-appears next cycle | Zero-config discovery (D4) |
| **Figura 3** – Ciclo de desenvolvimento de uma feature; **Anexo A** + Figuras 21–24 | `/grill-me` → PRD → `/prd-to-issues` → TDD → review | AI-as-contract (D8) |
| `<proj>\PosterIIoT.pdf` | One-page summary: 16 / 3 / 5 / 30s headline stats, layered diagram | Quick reference for framing (numbers slightly older than report) |
| **Anexo B** `AnexoB_DiagramaArquitetura.docx` | Full architecture diagram source | Highest-fidelity diagram to redraw from |

---

## 7. Screenshots / assets on disk

- `<proj>\Banner\IIoT_Trace_Banner_1920x1080.png` — final brand banner.
- `<proj>\Relatorio\AnexoI_BrandMarkSpecification.png` /
  `<proj>\Brand\` — logo lockups (dark + light).
- `<proj>\Banner\exemplo_PaginaInicial.png`, `<proj>\LogsPage.png` — dashboard captures.
- `<proj>\Relatorio\imagens\cap5\simuladorSensores_Docker.png` — simulator output.
- `<proj>\Relatorio\imagens\cap4\pagina_defenicoes.png`, `exemplo_AvisosMain.png`.

---

## 8. Video clips worth using

Source: `<proj>\Video\Planeamento.txt` (storyboard), `<proj>\Video\` (clips),
`<proj>\Apresentacao\`.

| Clip file | ~len | Shows | Use for |
|---|---|---|---|
| `<proj>\Video\IIoT_Trace_Video.mp4` | 2:30 | Full edited demo reel (no narration): hook → edge live → dashboard 6 domains → alerts → analysis → Detect·Predict·Prevent → end card | Embed as the primary demo |
| `<proj>\Video\EdgeAoVivo.mp4` | ~12s | data-pipeline CLI receiving live MQTT from the CoreS3 | "real hardware, real telemetry" proof |
| `<proj>\Video\Clip1_Energy.mp4` | ~5s | SDM630MCT: active_power, power_factor, thd_v1 live | Energy domain |
| `<proj>\Video\Clip2_ Vibration.mp4` / `VibracaoCritica.mp4` | ~5s | WTVB01-485 rms_total with a visible spike; critical-alert popup | Vibration + alerting |
| `<proj>\Video\Clip3_Environment.mp4` | ~5s | BME688 temperature / humidity / IAQ | Environment domain |
| `<proj>\Video\Clip4_ Proximity.mp4` | ~5s | MB7040 liquid_level_percent | Proximity domain |
| `<proj>\Video\Clip5_Flow.mp4` | ~5s | KLINGER_ST flow_velocity / volumetric_flow | Flow domain |
| `<proj>\Video\Clip6_CNC.mp4` / `Clip8_Cnc.mp4` | ~7s | CNC scatter spindle_speed vs rms_total by material | CNC (label theoretical/infra) |
| `<proj>\Video\Clip7_Navegacao.mp4` | ~5s | Sidebar + search-to-navigate | UX |
| `<proj>\Video\Clip_ALertsLogs.mp4` | ~4s | Critical popup → `/logs` live → PDF export | D9 drop log + alerting |

Presentation deck: `<proj>\Apresentacao\IIoT-Trace-Apresentacao.pptx`;
speaker notes `apresentacao_slides.txt`; Q&A prep `perguntas_frequentes.txt`
(useful for anticipating reviewer objections).

---

## 9. Corrections to the existing case-study page

`app/projects/industrial-iot-platform/page.tsx`, as of commit 17c42e0.

1. **QoS 1 is wrong (decision #1, overview).** Telemetry from the ESP32 is
   published at **QoS 0** — `PubSubClient` supports nothing else
   (`<repo>\edge\cores3-cnc\src\main.cpp` L283), and the pipeline's subscribe
   requests no QoS (`<repo>\data-pipeline\app.js` L47). QoS 1 exists only on the
   analysis-service → dashboard `iiot/+/+/analysis` topic. The page's rationale
   ("QoS 1 buys at-least-once delivery on flaky Wi-Fi without the four-way
   handshake cost of QoS 2") is not what the code does. (The project report
   makes the same error, so this is a real discrepancy to fix, not a
   misreading.)

2. **"New hardware becomes a new parser file, not a change to the pipeline"
   (decision #2) is overstated.** A genuinely new `sensor_type` also needs an
   entry in `SENSOR_TYPE_TO_PARSER`
   (`<repo>\data-pipeline\config\sensor-config.js`) **and a partial pipeline
   restart** — the report (§4.2.2) names this as the current scalability
   boundary and lists hot-reloading as future work. The zero-touch story is
   accurate for *new instances of an already-supported type* (that is what
   Discovery handles).

3. **"~280 concurrent assets" (decision #7, results) is an interpolation, not a
   measured ceiling.** Measured: N=100 passes (10.8 s), N=300 fails (32.1 s). The
   report's own §6.1 says "up to 280", derived as 30 s ÷ 0.107 s. Fine to keep
   if phrased as an estimate.

4. **The MQTT topic scheme is absent from the page** — the ticket wants it.
   It is `iiot/{site_id}/{cluster_id}/{sensor_id}/telemetry`, wildcard
   `iiot/+/+/+/telemetry`, plus `iiot/{site_id}/{location_id}/analysis` and
   `iiot/pipeline/drops`. See §2.4.

5. **"16 sensor types integrated" needs an honesty caveat.** Only 3 models ran on
   real hardware (BME688, SDM630MCT, WTVB01); the other 13 are parser +
   simulator. The overview implies a fleet of physical sensors.

6. **CNC is presented as operational; it is not.** The overview lists "CNC
   machining monitoring" alongside working use cases. Per report §5.4/§6.2 the
   sensor is installed and the pipeline works, but **zero real machining sessions
   were captured** and the per-material profiles are theoretical. Phrase as
   "infrastructure complete, real-data validation pending".

7. **Anomaly-detector list is incomplete (overview).** Page says "Z-score, moving
   average, gradient and THD-trend detectors". The service also has a
   **stuck-sensor detector** and a **machine-state detector** (OFF/IDLE/RUNNING,
   feeding OEE). Source: `<repo>\analysis-service\services\analysis_loop.py`
   imports; report §4.4.D–E.

8. **Domain count (6) is right for the final report but not universal in the
   sources.** `<repo>\UBIQUITOUS_LANGUAGE.md` and `<proj>\PosterIIoT.pdf` both
   say 5 (they predate CNC being split into its own domain). `<repo>\CLAUDE.md`
   and the report say 6. Keep 6, but don't be surprised by "5" in older
   material.

9. **Minor:** "InfluxDB 2.8" ✔; stack lists "TLS 1.2 / QoS 1" under Transport —
   QoS 1 should be QoS 0 for telemetry (see #1). "Zero-config sensor discovery …
   background job" — it runs inside the dashboard process (and asset-discovery
   inside the analysis loop), not as a standalone job. Nominal analysis interval
   is quoted implicitly as 60 s via the SLO; code default is 30 s.

### What the page gets RIGHT (verified)

- 3-tier Edge/Platform/Business topology, one-way flow, single writer at the
  persistence boundary. ✔
- Single-writer rule and `telemetry` vs `analysis_results` split. ✔
- Canonical schema + Strategy-pattern parser registry; ~45 LOC/sensor; 0 LOC in
  core services (for already-mapped types). ✔
- Zero-config discovery with manual-entry-wins merge. ✔
- InfluxDB-over-relational rationale. ✔
- TLS 1.2 + self-signed local CA + per-user creds + ACLs + no anon + no plaintext
  listener. ✔ (add PKI detail from §3 D6)
- Sequential O(N) analysis at ~107 ms/asset, benchmarked and documented, parallel
  deferred. ✔
- CLAUDE.md-as-contract, PRD → issue → TDD → review, 313 tests / 56 issues. ✔
- Edge: ESP32-S3 / M5Stack CoreS3, Modbus RTU + I2C, PlatformIO. ✔
- Built solo, end-to-end, as a degree capstone at STAR Institute. ✔
