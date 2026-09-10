import type { CaseStudy } from "./types";

// Written from docs/research/softskills-dossier.md (branch research/softskills-dossier),
// which is a read of the two private repos Pint-SoftSkills/SoftSkillsWeb (JS) and
// Pint-SoftSkills/SoftSkillsApp (Flutter). Internal name in code is "The SoftSkills";
// the client/theme is "Softinsa". Corrects the old landing blurb (no Socket.io, no
// real-time chat; PostgreSQL not MySQL). Team project (Nuno was #2 by commits on the
// web app and owned the trainee UI + forum; the hosted environment is torn down.

const softskills: CaseStudy = {
  slug: "softskills",
  name: "SoftSkills",
  tagline:
    "A company learning-management platform \u2014 a React web app and an offline-first Flutter app over one shared Node + PostgreSQL API. Built for Softinsa as a five-person capstone project.",
  accent: "purple",
  status: "shipped",
  role: "Team of 5 \u00b7 academic capstone (PINT) with Softinsa as client \u2014 I owned the trainee web UI and the forum",
  links: [],
  linksNote:
    "Team project \u2014 private repositories; the hosted environment (softskills-ti.pt) has been taken down, so there is no live demo.",
  metaDescription:
    "SoftSkills: a full learning-management system with a React web app and an offline-first Flutter mobile client over a shared Node/Express + PostgreSQL API. Architecture, the offline-sync design, and honest notes on a five-person team project.",
  card: {
    blurb:
      "Learning-management platform with a web app and an offline-first Flutter companion \u2014 course delivery, quizzes with weighted progress tracking, PDF certificates and an async community forum. Graded 19/20.",
    stack: ["React", "Node.js", "PostgreSQL", "Flutter", "Firebase", "AWS S3"],
    signatureStack: ["React", "Flutter", "Node.js"],
  },

  overview: [
    "SoftSkills is an internal learning-management system for a company's training programme. The web app has a front office for trainees and trainers and a back office for managers and administrators: a course catalogue, enrolment, course delivery (materials, tasks, quizzes, attendance), a learning-path history with grades and PDF certificates, a knowledge-sharing forum, achievement badges, and management dashboards. A Flutter app gives trainees the same catalogue, courses and forum on their phone \u2014 and it works offline.",
    "It was a five-person academic capstone (PINT \u2014 Projeto Integrado) built over about five months in 2025 for Softinsa, an IBM subsidiary in Viseu, as the real client. It shipped and ran at softskills-ti.pt during the course before the hosting was taken down. I was the second-largest contributor on the web app \u2014 I owned the trainee-facing UI and the community/forum module, and worked across the Node backend, including the course-recommendation service and the badges.",
    "The parts worth writing about are architectural: two clients over one plain REST API with no shared code; a mobile app built offline-first around a local SQLite mirror, one bulk-sync endpoint and an offline write queue; and \u201crealtime\u201d delivered with push, in-app notifications and email rather than a socket layer \u2014 which is why the old one-line description of this project as a Socket.io chat app was wrong.",
  ],

  architecture: {
    intro: [
      "One Node/Express + PostgreSQL API serves both clients over plain REST with a bearer JWT \u2014 no BFF, no GraphQL, and no code shared between the React and Flutter codebases; the contract is just JSON over HTTP. Where the clients diverge is how they read: the web app fetches per screen, the mobile app syncs its whole dataset at once.",
    ],
    figures: [
      {
        caption:
          "Two clients, one API, one login. The web app fetches per screen; the Flutter app pulls everything from GET /teste/data in a single blob \u2014 a second read model of the same data, maintained by hand alongside the granular endpoints.",
        ascii:
          "web SPA (React/Vite) --granular REST-->  [ Node + Express 5 API ]  <--GET /teste/data-- Flutter app\n                                          ~30 route modules \u00b7 JWT \u00b7 4 roles\n                                                     |  Sequelize\n                                                     v\n                                          PostgreSQL (~35 tables)\n  also: AWS S3 (deterministic keys) \u00b7 Firebase FCM \u00b7 nodemailer \u00b7 node-cron",
        diagram: {
          viewBox: [0, 0, 640, 400],
          aria:
            "SoftSkills system overview: a React web SPA and a Flutter app both call one Node/Express API with a bearer JWT; the web app uses granular per-screen endpoints while the Flutter app uses a single aggregating endpoint, GET /teste/data; the API persists to PostgreSQL via Sequelize.",
          accentColor: "purple",
          nodes: [
            { id: "web", x: 64, y: 24, w: 224, h: 44, label: ["web SPA \u2014 React / Vite", "softskills-ti.pt"] },
            { id: "app", x: 352, y: 24, w: 224, h: 44, label: ["Flutter app \u2014 Android", "offline-first"] },
            { id: "api", x: 192, y: 184, w: 256, h: 48, label: ["Node + Express 5 API", "~30 route modules \u00b7 JWT \u00b7 4 roles"] },
            { id: "db", x: 208, y: 320, w: 224, h: 48, label: ["PostgreSQL", "Sequelize \u00b7 ~35 tables"] },
          ],
          edges: [
            { from: "web", to: "api", label: "granular REST" },
            { from: "app", to: "api", label: "GET /teste/data", accent: true },
            { from: "api", to: "db", label: "Sequelize" },
          ],
        },
      },
      {
        caption:
          "The mobile app's offline-first loop. One sync pulls the whole dataset into SQLite; every screen reads from SQLite, never the network directly; writes made offline go to an outbox table and are replayed against the real endpoints when the connection returns.",
        ascii:
          "API  GET /teste/data\n  |  one JSON blob (whole per-user dataset)\n  v\nDataSyncAPI --row upsert--> SQLite mirror (sqflite, ~17 tables) --> Flutter screens\n                                   ^                                     |\n                                   |                            offline writes\n                             on reconnect                              v\n                                   +------------------- sincronizacao (outbox)",
        diagram: {
          viewBox: [0, 0, 620, 340],
          aria:
            "SoftSkills mobile offline-first sync: GET /teste/data returns one JSON blob that DataSyncAPI upserts row-by-row into a local SQLite mirror; Flutter screens read from SQLite; offline writes are queued in a sincronizacao outbox table and replayed to the API on reconnect.",
          accentColor: "purple",
          nodes: [
            { id: "api", x: 40, y: 24, w: 240, h: 44, label: ["API", "GET /teste/data"] },
            { id: "sync", x: 40, y: 120, w: 240, h: 44, label: ["DataSyncAPI", "row-by-row upsert"] },
            { id: "sqlite", x: 40, y: 216, w: 240, h: 44, label: ["SQLite mirror", "sqflite \u00b7 ~17 tables"] },
            { id: "ui", x: 360, y: 216, w: 220, h: 44, label: ["Flutter screens", "read from SQLite"] },
            { id: "outbox", x: 360, y: 120, w: 220, h: 44, label: ["sincronizacao (outbox)", "{acao, tabela, payload}"] },
          ],
          edges: [
            { from: "api", to: "sync", label: "one JSON blob" },
            { from: "sync", to: "sqlite", label: "row upsert" },
            { from: "sqlite", to: "ui", label: "screens read" },
            { from: "ui", to: "outbox", label: "offline writes", accent: true },
            { from: "outbox", to: "api", label: "on reconnect" },
          ],
        },
      },
    ],
    notes: [
      "The API also fans out to AWS S3 for media (course materials, avatars, forum attachments), Firebase Cloud Messaging for push, Gmail SMTP via nodemailer for email, and node-cron for scheduled jobs \u2014 purging flagged users, deadline-reminder digests, and course-occurrence state transitions.",
      "background_fetch re-runs the mobile sync on a ~15-minute headless interval, even after the app is force-killed; every network call is gated on a connectivity check first.",
    ],
  },

  decisions: [
    {
      tag: "clients",
      title: "Two clients, one plain REST API, zero shared code",
      decision:
        "The React web app and the Flutter app talk to the same Node/Express API with the same bearer JWT and the same login endpoint. No BFF, no GraphQL, no gateway, and nothing shared between the two codebases \u2014 the contract is JSON over HTTP.",
      why: "Parity between web-trainee and mobile-trainee is maintained by hand against that contract. The cost is real \u2014 the mobile app's GET /teste/data aggregator is a second, divergent read model of the same data \u2014 but each client gets to optimise its own fetch strategy without the other constraining it.",
    },
    {
      tag: "offline",
      title: "Offline-first mobile: a SQLite mirror, a bulk sync, an outbox",
      decision:
        "The Flutter app keeps a local SQLite mirror of the user's data (~17 tables). One endpoint returns the entire per-user dataset in a single blob; the app upserts it row-by-row. Every screen reads from SQLite, never the network. Writes made offline go to a sincronizacao outbox table and are replayed when connectivity returns; a headless background task re-runs the sync on a schedule.",
      why: "It's designed for the actual usage context \u2014 employees on the move, patchy signal \u2014 rather than assuming connectivity. The web app trades nothing for freshness; the mobile app trades freshness for resilience, and that's the right call for a phone on a commute.",
    },
    {
      tag: "notifications",
      title: "\u201cRealtime\u201d without a socket layer",
      decision:
        "There is no WebSocket code anywhere in either repo. What stands in for realtime is one notificationService that fans a single event out to three channels \u2014 Firebase Cloud Messaging push, in-app notifications persisted in the database, and email \u2014 and to the right audience: enrolled users, topic followers, course-favouriters, the responsible trainer.",
      why: "The product needs notification, not conversation. A fan-out service over FCM and SMTP is cheaper to run than a WebSocket server and fits a training platform, where the \u201cchat\u201d is really an asynchronous forum with threads, nested replies and voting.",
    },
    {
      tag: "storage",
      title: "Media on S3 with deterministic public keys",
      decision:
        "Uploads go straight to AWS S3 with keys derived from entity IDs \u2014 user avatars at utilizadores/{id}.png, course art at formacoes/{id}.png, materials under their occurrence. No random names, no signed URLs; the bucket serves public reads. The database stores only the key.",
      why: "Because keys are derivable from IDs, the Flutter app can pre-download avatars and course images by ID for offline display with no API round-trip. The trade-off, named plainly: everything in the bucket is world-readable.",
    },
    {
      tag: "progress",
      title: "Quiz auto-grading feeds a weighted progress model",
      decision:
        "The server scores a quiz as correct \u00f7 total \u00d7 20. For self-paced courses, a pass (\u2265 9.5/20) adds that quiz's configured weight to the enrolment's progress, capped at 100, best attempt kept, retakes allowed until you pass. Scheduled courses accrue progress from per-session attendance instead. Completion generates a PDF certificate.",
      why: "One progress number has to mean something for both a self-paced course and a classroom-style one. Splitting the accrual rule by course type \u2014 quiz weight vs attendance \u2014 keeps the learning-path view consistent across both.",
    },
    {
      tag: "roles",
      title: "Roles are data, not an enum",
      decision:
        "perfis is a table joined many-to-many to users, so one person can hold several roles. A \u201cSelect Profile\u201d screen switches the active scope, and the JWT carries the full roles array so both clients gate their routes without a server call.",
      why: "Real organisations have people who are both a trainer and a trainee. Modelling the role as a row rather than a column on the user means that's a data state, not a schema change.",
    },
    {
      tag: "auth",
      title: "Stateless JWT with a database blacklist for logout",
      decision:
        "Auth is a hand-rolled JWT \u2014 bcrypt on login, a 1-day token (30 days with \u201cremember me\u201d), no refresh tokens, no Passport. Logout inserts the token into a token_blacklist table that middleware checks on every subsequent request.",
      why: "A pragmatic middle ground: no session store to operate, but \u201clog out\u201d actually invalidates the token server-side instead of trusting the client to forget it.",
    },
    {
      tag: "recommendations",
      title: "Layered course recommendations",
      decision:
        "The recommendation service (which I wrote) returns up to five upcoming course occurrences, layered: first from the user's favourited topics, then from topics of courses they've completed, then the most recently updated as a fallback \u2014 always excluding courses they're enrolled in, have completed, or are responsible for.",
      why: "The fallback layer is the point: a brand-new user with no favourites and no history still gets a sensible list, so the feature doesn't cold-start into an empty state.",
    },
  ],

  stack: [
    {
      layer: "Web frontend",
      items: ["React 19", "Vite 6", "React Router 7", "MUI 7 + Mantine 8 + Bootstrap 5", "Recharts", "axios", "framer-motion"],
    },
    {
      layer: "Web backend",
      items: ["Node.js", "Express 5 (CommonJS)", "Sequelize 6", "jsonwebtoken", "bcrypt", "multer", "pdfkit", "swagger-jsdoc"],
    },
    { layer: "Database", items: ["PostgreSQL", "~35 models", "sequelize.sync() \u2014 no migrations"] },
    {
      layer: "Mobile",
      items: ["Flutter / Dart (Material 3)", "Provider", "sqflite", "http", "dart_jsonwebtoken", "background_fetch", "connectivity_plus", "app_links"],
    },
    { layer: "Media & push", items: ["AWS S3 (eu-west-2)", "Firebase Cloud Messaging", "flutter_local_notifications"] },
    { layer: "Email & jobs", items: ["nodemailer (Gmail SMTP)", "node-cron (purge \u00b7 digests \u00b7 state transitions)"] },
    { layer: "Auth", items: ["hand-rolled JWT + RBAC", "4 roles (many-to-many)", "token blacklist for logout"] },
  ],

  stats: [
    { value: "19/20", label: "final grade" },
    { value: "5", label: "person team" },
    { value: "~35", label: "PostgreSQL tables" },
    { value: "~17", label: "tables mirrored offline" },
    { value: "4", label: "user roles" },
    { value: "2", label: "client apps, one API" },
  ],
  statsNote:
    "Academic capstone (PINT) for Softinsa, built February\u2013July 2025. Second-largest contributor on the web app \u2014 103 of 424 commits \u2014 and a minor contributor on the Flutter app. Deployed to softskills-ti.pt and api.softskills-academy.pt during the course; the hosted environment has since been taken down and it has not been maintained since.",

  reality: {
    intro:
      "An academic team project, framed honestly \u2014 including where the old one-line description of it was simply wrong.",
    rows: [
      {
        claim: "real-time chat",
        reality:
          "There isn't one, and there never was. Communication is an asynchronous forum \u2014 threads, nested replies, voting, code-snippet sharing \u2014 plus push, in-app notifications and email. No WebSocket layer exists in either repo.",
      },
      {
        claim: "built with Socket.io",
        reality:
          "Not a dependency in the web frontend, the backend, or the Flutter app. The stack is plain REST with a bearer JWT; the earlier portfolio blurb naming Socket.io was incorrect.",
      },
      {
        claim: "a solo project",
        reality:
          "A team of five over about five months. I was the second-largest contributor on the web app and owned the trainee-facing UI and the forum module; the Flutter app was mostly another developer's work, with me on its auth and early local-database plumbing.",
      },
      {
        claim: "shipped",
        reality:
          "Feature-complete and deployed for the course \u2014 then the hosting was torn down. There is no live demo to link and it has not been maintained since July 2025.",
      },
      {
        claim: "one shared backend for web and mobile",
        reality:
          "One API, yes \u2014 but the mobile app reads through a separate aggregating endpoint that returns the whole per-user dataset in one blob, a second read model maintained alongside the web app's granular endpoints.",
      },
    ],
  },

  cta: {
    blurb:
      "A five-person academic capstone for Softinsa. My work was the trainee-facing web app and the community forum, plus backend across the Node API \u2014 the course-recommendation service and the badge logic among it.",
  },
};

export default softskills;
