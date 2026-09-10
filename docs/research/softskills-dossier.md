# SoftSkills / E-learning Platform — Fact Dossier

Research for the case-study page. Resolves issue #4 (`wayfinder:research`), part of #1.

Sources are two private repos in the `Pint-SoftSkills` GitHub org, cloned and inspected
at the state of `main` on 2026-09-08:

- `Pint-SoftSkills/SoftSkillsWeb` — web LMS (JavaScript). Cited below as **[web]**.
- `Pint-SoftSkills/SoftSkillsApp` — mobile app (Dart / Flutter). Cited below as **[app]**.

Internal product name in the code is **"The SoftSkills"** (client/theme "Softinsa"; the app
package is `softinsa_app`). "SoftSkills" and "E-learning Platform" are the portfolio labels.

---

## 1. What it is

A full internal **learning-management system (LMS)** for a company's training / upskilling
programme. Two front ends over one shared backend:

- **Web app** with a **FrontOffice** (trainees "Formando" and trainers "Formador") and a
  **BackOffice** (managers "Gestor" and administrators "Administrador"). Course catalogue,
  enrolment, course delivery (materials, tasks, quizzes, attendance), learning-path history
  with grades and PDF certificates, a knowledge-sharing forum, and management dashboards.
  Source: `SoftSkillsWeb/README.md`, `SoftSkillsWeb/frontend/src/view/` **[web]**
- **Mobile app** (Flutter, Android-first) for trainees: browse and enrol in courses, consume
  materials, answer quizzes, follow their learning path, use the forum, receive push
  notifications — **works offline**.
  Source: `SoftSkillsApp/README.md`, `SoftSkillsApp/lib/` **[app]**

### Honest status

- **Shipped / complete.** Academic team project ("PINT" — *Projeto Integrador*), developed
  ~Feb–Jul 2025. **Graded 19/20.**
- Both repos are feature-complete and were deployed:
  - API: `https://api.softskills-academy.pt` (`SoftSkillsWeb/frontend/src/config.js`,
    `SoftSkillsApp/lib/api/ApiService.dart`)
  - Web: `https://softskills-ti.pt` (CORS allow-list in
    `SoftSkillsWeb/backend/src/config/middlewares.js`)
  - Media CDN: `https://cdn-softskills-academy.s3.eu-west-2.amazonaws.com`
    (`SoftSkillsWeb/frontend/src/config.js`)
- **As of this research the hosted environment is torn down** — `softskills-ti.pt` and
  `api.softskills-academy.pt` no longer resolve in DNS. The S3 bucket still exists
  (returns 404 on root). There is **no live public demo** to link.
- Last real commit activity: web July 2025 (one stray commit 2025-12-01), app July 2025.
- Not maintained since delivery.

---

## 2. Team size and Nuno's role

**Not a solo project.** GitHub org `Pint-SoftSkills` has **6 members**:
`AutoMendes`, `Rekrl`, `benjaminlinux`, `davideCardoso`, `BlankMaverick`, `xdAkira`
(`gh api orgs/Pint-SoftSkills/members`).

Identities (from `git shortlog -sne` on both repos):

| GitHub | Name in commits | Notes |
|---|---|---|
| `AutoMendes` | Tiago (Mendes / Lobo) — `automendes30@gmail.com` | Project lead by volume |
| `Rekrl` | **Nuno Gonçalo B. dos Santos** — `Upset` / `nunogoncalobsantos@gmail.com` | Subject of this dossier |
| `benjaminlinux` | Catarina Antunes — `catarinaantunes12385@gmail.com` | |
| `davideCardoso` | Davide Gonçalves Cardoso — `davidecardoso05@gmail.com` | |
| `BlankMaverick` | Rafael Pires Carvalho — `Blank` / `rafaelpirescarvalho04@gmail.com` | |
| `xdAkira` | (only 3 early commits on the app) | Marginal contributor |

Effectively a **5-person core team** (6 on paper).

### Commit share

**SoftSkillsWeb** — 424 commits total (`git rev-list --all --count`):

| Author | Commits | Share |
|---|---|---|
| Tiago (`AutoMendes`) | ~240 | ~57% |
| **Nuno (`Rekrl`)** | **103** | **~24% — clear #2** |
| Catarina | 45 | ~11% |
| Davide | 24 | ~6% |
| Rafael | 8 | ~2% |

**SoftSkillsApp** — 81 commits total:

| Author | Commits | Share |
|---|---|---|
| Tiago | ~60 | ~74% |
| **Nuno** | **13** | **~16%** |
| Rafael | 4 | ~5% |
| xdAkira | 3 | ~4% |
| Catarina | 1 | ~1% |

Nuno active Apr–Jul 2025, ramping up toward the deadline (15 → 18 → 25 → 45 commits/month
on web).

### What Nuno actually built (from commit messages + touched paths)

Predominantly **web frontend**, with supporting backend work:

- **Trainee ("Formando") area** — `FormandoHome`, `Minhasformacoes`,
  `PercursoFormativoFormando` (learning path), `FavoritosFormando`, `PerfilUtilizador` /
  `PerfilFormando`. (`SoftSkillsWeb/frontend/src/view/formando/**` — 48 commits touch this
  tree.)
- **Forum / Community rebuild** — `CommunityPage`, `CommunityDiscussionsPage`,
  `CommunityPublicationsPage`, `PublicacaoPage` (thread + nested replies + hover cards),
  `SnippetsPage`, and the forum sidebar/navigation.
  (`SoftSkillsWeb/frontend/src/view/forum/**` — 36 commits.)
- **Shared UI** — sidebar/menu icon consistency across all four role scopes, notification
  pages, profile pages, carousels. (`frontend/src/components/**` — 78 commits.)
- **Supporting backend** — controllers/routes/models for the forum
  (`publicacaoController`, `badgeController`, `userController`, `notificationsController`),
  and he authored **`recommendationService.js`** (course-recommendation logic).
  (`backend/src/controllers/**` 60 commits, `backend/src/routes/**` 46, `backend/src/models/**` 22.)
- **Mobile (minor)** — the login screen + `AuthenticationAPI.dart` /
  `AuthenticationRepository.dart`, early local-DB plumbing ("Database loop solved", "code
  refactoring … (Database)"), profile pages, `AcademyPage` query fix, `FormationDetailsPage`.
  (`SoftSkillsApp` commits 2025-04 to 2025-07.)

**Summary:** core full-stack contributor with a **frontend + forum focus**, second-largest
contributor on the web app, minor contributor on the mobile app. Honest framing for the
case study: "team of 5; I owned the trainee-facing web UI and the community/forum module,
and contributed across the Node backend."

---

## 3. Architecture (draw-a-diagram level)

```
                         ┌──────────────────────────────┐
   Web (React/Vite SPA)  │  softskills-ti.pt            │
   localStorage: JWT     │  Bootstrap/MUI/Mantine       │
                         └───────────────┬──────────────┘
                                         │ HTTPS / REST + JSON
                                         │ Authorization: Bearer <JWT>
                                         ▼
   Flutter app (Android) ───────► ┌──────────────────────────────┐
   SharedPreferences: JWT         │  api.softskills-academy.pt   │
   local SQLite mirror (sqflite)  │  Node.js + Express 5         │
   background_fetch sync          │  ~30 route modules           │
                                  │  JWT auth + role middleware  │
                                  └───┬───────────┬──────────┬───┘
                                      │           │          │
                        Sequelize 6  │           │ AWS SDK   │ firebase-admin
                                      ▼           ▼           ▼
                            ┌──────────────┐ ┌─────────┐ ┌──────────────┐
                            │ PostgreSQL   │ │  AWS S3 │ │ Firebase     │
                            │ (single DB,  │ │ eu-west-2│ │ Cloud        │
                            │  ~35 tables) │ │ cdn-...  │ │ Messaging    │
                            └──────────────┘ └─────────┘ └──────────────┘
                                                              │ push
                          nodemailer (Gmail SMTP) ──► email   ▼
                          node-cron ──► scheduled jobs   trainee devices
```

### Backend

- **Node.js + Express 5**, CommonJS. Entry `SoftSkillsWeb/backend/src/app.js` →
  `config/middlewares.js`, `routes/index.js`, `schedules/cronJobs.js`, `config/server.js`.
- ~30 route modules mounted under resource prefixes (`/formacoes`, `/ocorrencias`,
  `/inscricoes`, `/materiais`, `/quiz`, `/publicacoes`, `/notificacoes`, `/dashboard`, …),
  each backed by a thin controller. Login is `POST /softinsa/login`.
  Source: `SoftSkillsWeb/backend/src/routes/index.js` **[web]**
- **Swagger** API docs at `/swagger`, protected by HTTP basic auth
  (`config/swaggerConfig.js`, `routes/index.js`).
- **Services**: `emailService.js` (nodemailer), `notificationService.js` (FCM + DB
  notifications + email), `recommendationService.js`.
- **Scheduled jobs** (`node-cron`, `schedules/`): purge users flagged for deletion
  (`cronApagarUtilizadores`), notification / deadline-reminder digests (`cronNotifications`),
  occurrence state transitions (`cronOcorrencias`). `setInterval(() => {}, 1000)` keeps the
  process alive.

### Database

- **PostgreSQL**, one database, accessed via **Sequelize 6 ORM** (`pg` driver).
  `sequelize.sync({ force: false })` on boot — schema is defined by the models, no
  migrations.
  Source: `SoftSkillsWeb/backend/src/models/database.js` **[web]**
  (Note: connection is hard-coded to `localhost:5432` with committed credentials
  `postgres` / `pint1234` — a wart; prod presumably swapped it via env.)
- ~35 models (`backend/src/models/`), relationships in `models/associations.js`. Core graph:
  - `Categoria` → `Area` → `Topico` → `Formacao` (course) → `OcorrenciaFormacao`
    (a scheduled run / "occurrence" of a course, with dates, seats, a responsible trainer).
  - `Utilizador` ↔ `Perfil` many-to-many (`perfis` join) — roles.
  - `Utilizador` + `OcorrenciaFormacao` → `Inscricao` (enrolment; holds `progresso`, `nota`,
    `estado`).
  - `OcorrenciaFormacao` → `Aula` (session) → `AulaFormando` (attendance per enrolment).
  - `OcorrenciaFormacao` → `Tarefa` → `TarefaFormando` (submission, grade 0–20).
  - `OcorrenciaFormacao` → `Quiz` → `Pergunta`; `SubmissaoQuiz` → `RespostaQuiz`.
  - `OcorrenciaFormacao` → `Material` (file or link).
  - Forum: `Topico` → `Publicacao` → `Resposta` (self-referential nested replies) →
    `AnexosPublicacao` / `AnexosResposta`; `AvaliacaoPublicacao` / `AvaliacaoResposta`
    (up/down votes); `Denuncia` (reports); `Snippet` (code snippets).
  - `FavoritosTopico`, `FavoritosFormacao`; `Notification` → `NotificationRecipient`;
    `Badge` → `UserBadge`; `FCMToken`; `TokenBlacklist`.

### Realtime layer

- **There is none.** No `socket.io`, no `ws`, no WebSocket code in either repo — verified
  against `backend/package.json`, `frontend/package.json`, `SoftSkillsApp/pubspec.yaml`, and
  a full-text search of both source trees.
- What stands in for "realtime":
  - **Firebase Cloud Messaging** push notifications. Backend: `firebase-admin`,
    `admin.messaging().sendEachForMulticast({ notification, tokens })` in
    `services/notificationService.js`, fed by the `FCMToken` table. Mobile:
    `firebase_messaging` + `flutter_local_notifications`, token registered on sync
    (`DataSyncAPI.adicionarFcmToken`), foreground + background handlers in
    `lib/services/NotificationService.dart`.
  - **In-app notifications** persisted in `Notification` / `NotificationRecipient` and
    polled via `/notificacoes` (and delivered in the mobile bulk-sync payload).
  - **Email** via `nodemailer` over Gmail SMTP (`services/emailService.js`) for enrolment
    confirmations, course updates, deadline reminders, final grades.
  - The "chat" in the portfolio blurb is actually the **asynchronous forum** (posts +
    nested replies + voting) plus a one-way "Contactar Gestão" contact form
    (`frontend/src/view/ContactarGestao.jsx` → `POST /notificacoes/contactargestao`).

### Auth

- **Hand-rolled JWT + RBAC.** No Passport, no OAuth, no refresh tokens.
- Login: `bcrypt.compare`, then `jwt.sign({ id, nome, email, updated_at, perfis[] }, JWT_SECRET,
  { expiresIn: remember ? '30d' : '1d' })`.
  Source: `SoftSkillsWeb/backend/src/controllers/authenticationController.js` **[web]**
- Middleware (`config/middlewares.js`): `checkToken` (verifies `Authorization: Bearer` /
  `x-access-token`), `authorize([roleNames])` (checks `req.decoded.perfis`).
- **Four roles**: Administrador, Gestor, Formador, Formando (`models/Perfil.js`,
  many-to-many with `Utilizador`).
- **Logout** = insert token into `token_blacklist` table, checked on subsequent requests
  (`controllers/tokenblacklistController.js`).
- Both clients decode the JWT locally for route gating: web `jwt-decode` in
  `frontend/src/routes/AppRoutes.jsx` + `ProtectedRoute.jsx`; Flutter
  `dart_jsonwebtoken` in `lib/api/AuthenticationAPI.dart`.
- **Password set / reset** via emailed **deep-link tokens**:
  `/definir-password/:token`, `/redefinir-password/:token`. The Flutter app handles these
  with `app_links` (`lib/main.dart._handleDeepLink`).
- Token storage: web `localStorage`; Flutter `SharedPreferences` (key `auth_token`) —
  `flutter_secure_storage` + `encrypt` are dependencies and a `TokenStorage` repo exists but
  the active path uses SharedPreferences.

### Media storage

- **AWS S3**, bucket `cdn-softskills-academy`, region `eu-west-2`. Not the DB, not local disk.
- Upload path: `multer` **memory storage**, 500 MB limit (`config/middlewares.js`) →
  `@aws-sdk/lib-storage` multipart `Upload` (`new Upload({ client: S3Client, params: { Bucket,
  Key, Body: req.file.buffer, ContentType } })`).
  Source: `SoftSkillsWeb/backend/src/controllers/materiaisController.js`,
  `controllers/publicacaoController.js`, `controllers/userController.js` **[web]**
- **Deterministic key layout** (no random names, no signed URLs — bucket serves public
  reads):
  - course materials: `ocorrencias/{idocorrencia}/materiais/{normalizedName}{ext}`
  - user avatars: `utilizadores/{idutilizador}.png`
  - course images: `formacoes/{idformacao}.png`
  - forum attachments: under the publication / reply.
- Filenames are normalised before use (`normalizarNomeFicheiro`: strip diacritics, `ç`→`c`,
  drop special chars).
- The DB stores only the key + metadata (`Material` row); `tipo: 'link'` materials store an
  external URL instead of a file.
- Clients build URLs from a constant: web `CONTENT_URL` (`frontend/src/config.js`), mobile
  `contentURL` (`lib/api/DownloadFiles.dart`). The mobile app **downloads** course and user
  images into the app documents directory for offline display.

### How Flutter and web share a backend

- **Same REST API, same JWT, same login endpoint.** No BFF, no GraphQL, no gateway — both
  clients call `api.softskills-academy.pt` directly with `Authorization: Bearer <JWT>`.
  No code is shared between the React and Flutter code bases; the contract is just JSON
  over HTTP.
- **The web app uses granular REST endpoints.** Each screen calls the specific resource it
  needs (`/formacoes/:id`, `/inscricoes/...`, `/publicacoes`, …) via `axios`.
- **The mobile app is offline-first around a single fat sync endpoint.** It keeps a local
  **SQLite mirror** (sqflite, DB `softskills.db`, ~17 tables — `lib/repositories/Database.dart`).
  - On login / refresh / background fetch it calls **`GET /teste/data`**
    (`dataController.getAllData`), which returns the entire per-user dataset in one JSON
    blob — user, categories, areas, topics, courses, occurrences (enrolled + available),
    enrolments, favourites, notifications, tasks, materials, quizzes, questions,
    submissions, trainee-task rows. Repositories upsert it row-by-row
    (`lib/api/DataSyncAPI.fetchDados`).
  - **Offline writes are queued.** Favourite / unfavourite while offline is written to a
    local `sincronizacao` table `{acao, tabela, payload}` and replayed against the real
    endpoints when connectivity returns (`DataSyncAPI.sincronizarDadosApi` /
    `adicionarAcaoSincronizacao`).
  - **`background_fetch`** re-runs the sync (~15 min interval, `stopOnTerminate: false`,
    `startOnBoot: true`, headless task) even when the app is killed (`lib/main.dart`).
  - Connectivity gating via `connectivity_plus` + `internet_connection_checker`.
  - This is a deliberate split: web trades nothing for freshness; mobile trades freshness
    for offline resilience on a commuter's phone.

---

## 4. Real decisions and why they are interesting

1. **Two clients, one plain REST API, zero shared code.** The parity between web-trainee and
   mobile-trainee is maintained by hand against a JSON contract. Worth discussing:
   what that costs (the mobile `GET /teste/data` aggregator is a second, divergent read
   model of the same data) and what it buys (each client optimises its own fetch strategy).

2. **Offline-first mobile with a bulk-sync endpoint + local write queue.** The most
   technically substantial part of the mobile app. A SQLite mirror, one aggregating
   endpoint, an outbox table for offline mutations, and a headless background sync. Good
   story about designing for the actual usage context (employees on the move, patchy
   signal) rather than assuming connectivity.

3. **"Realtime" delivered without a socket layer.** FCM push + persisted in-app
   notifications + email, orchestrated in one `notificationService` that fans a single event
   out to all three channels (and to the right audience: enrolled users, topic followers,
   course-favouriters, the responsible trainer). Cheaper to run than a WebSocket server and
   fits the notification-not-conversation nature of the product. **The portfolio blurb's
   "real-time chat / Socket.io" is inaccurate and should be rewritten.**

4. **Media on S3 with deterministic public keys.** No signed URLs, no DB blobs. Keys are
   derivable from entity IDs (`utilizadores/{id}.png`), which is why the Flutter app can
   pre-download avatars/course art by ID for offline use without an API round-trip. Trade-off
   worth naming: simple and fast vs. everything in the bucket is world-readable.

5. **Quiz auto-grading feeds a weighted progress model.** Server scores the quiz
   (`correct / total * 20`), and for asynchronous courses a pass (>= 9.5/20) adds that
   quiz's `peso` (weight) to the enrolment's `progresso`, capped at 100; retakes allowed
   until you pass, best attempt kept. Synchronous courses instead accrue progress via
   per-session attendance (`AulaFormando.presenca`). Completion produces a `pdfkit`
   certificate.
   Source: `SoftSkillsWeb/backend/src/controllers/quizController.js` (score + progress),
   `controllers/pdfController.js` (certificate) **[web]**

6. **Course-recommendation service.** Recommends up to 5 upcoming course occurrences,
   layered: (1) from favourited topics, (2) from topics of already-completed courses,
   (3) most-recently-updated as a fallback — excluding courses the user is enrolled in,
   has completed, or is responsible for. Authored by Nuno.
   Source: `SoftSkillsWeb/backend/src/services/recommendationService.js` **[web]**

7. **Role model as data, not enum.** `perfis` is a table and a many-to-many, so a user can
   hold several roles; the web app has a "Select Profile" screen
   (`frontend/src/view/SelectProfile.jsx`) to switch the active scope. The JWT carries the
   full `perfis` array so both clients gate routes without a server call.

8. **Stateless auth with a DB blacklist for logout.** Pragmatic middle ground — short-lived
   JWTs, plus a `token_blacklist` table so "log out" actually invalidates server-side.

---

## 5. Stack by layer

### Web — frontend (`SoftSkillsWeb/frontend`, `package.json`)

| Layer | Tech |
|---|---|
| Language / build | JavaScript (no TS), **Vite 6**, ESLint 9 |
| Framework | **React 19**, **React Router 7** |
| UI kits (mixed) | **MUI 7** + `@mui/x-charts`, **Mantine 8**, React-Bootstrap 2 + Bootstrap 5, `lucide-react` / `react-icons` / `bootstrap-icons` |
| Charts | Recharts 2, MUI X Charts |
| HTTP / auth | `axios`, `jwt-decode` |
| UX | `framer-motion`, `sweetalert2`, `swiper` + `embla-carousel-react`, `react-syntax-highlighter` (forum code snippets), `date-fns` / `moment`, jQuery (legacy) |

### Web — backend (`SoftSkillsWeb/backend`, `package.json`)

| Layer | Tech |
|---|---|
| Runtime | **Node.js**, **Express 5** (CommonJS), `nodemon` |
| ORM / DB | **Sequelize 6** over **PostgreSQL** (`pg`) |
| Auth | `jsonwebtoken`, `bcrypt`, `express-session` (configured, secondary), `cookie-parser` |
| Uploads / storage | `multer`, `multer-s3`, `@aws-sdk/client-s3`, `@aws-sdk/lib-storage` → **AWS S3** |
| Push | `firebase-admin` (**FCM**) |
| Email | `nodemailer` (Gmail SMTP) |
| Jobs | `node-cron` |
| Docs | `swagger-jsdoc`, `swagger-ui-express` (`/swagger`, basic-auth) |
| PDF | `pdfkit` (certificates) |
| Misc | `cors`, `body-parser`, `dotenv` |

### Mobile (`SoftSkillsApp`, `pubspec.yaml`)

| Layer | Tech |
|---|---|
| Framework | **Flutter / Dart** (SDK >= 3.7), Material 3, `google_fonts` (Outfit) |
| State | **Provider** (`AuthProvider`, `ThemeProvider`, `ConnectionProvider`, `NotificationProvider`, …) |
| Local DB | **`sqflite`** (+ `path`) — offline mirror, repository-per-entity |
| Key-value / secrets | `shared_preferences`, `flutter_secure_storage`, `encrypt` |
| HTTP / auth | `http` (no Dio), `dart_jsonwebtoken` |
| Push / notifications | `firebase_core`, `firebase_messaging`, `flutter_local_notifications` |
| Background sync | `background_fetch` |
| Connectivity | `connectivity_plus`, `internet_connection_checker` |
| Deep links | `app_links` (password set/reset) |
| Other | `webview_flutter`, `file_picker`, `url_launcher`, `carousel_slider`, `animations` |
| i18n | `flutter_localizations` + `intl_utils` — EN + PT ARB files |
| Targets | Android (primary), iOS/web/desktop scaffolded; `firebase.json` present (Firebase Hosting for the web build) |

### Infra / deployment

- API `api.softskills-academy.pt`, web `softskills-ti.pt`, media
  `cdn-softskills-academy.s3.eu-west-2.amazonaws.com`. **Domains currently offline.**
- No CI config, no Dockerfile, no IaC in either repo. `sequelize.sync()` instead of
  migrations. Secrets: `.env` (not committed) + `firebase_admin.json` (not committed);
  DB credentials hard-coded in `models/database.js`.

---

## 6. Screenshots worth capturing

No screenshots or demo video are committed in either repo (the app only bundles stock
images in `assets/images/`). To capture fresh ones you must run each app — see §7. The
backend needs PostgreSQL + seed data + `.env` + `firebase_admin.json`, so the fastest route
to populated screenshots is a local backend with a seeded DB.

**Web (React):**

- Login + **Select Profile** (multi-role) screens — `view/Login.jsx`, `view/SelectProfile.jsx`
- **Trainee home / dashboard** — course carousels + recommendations — `view/formando/FormandoHome.jsx`
- **Trainee course page** — materials, tasks, quizzes, progress bar —
  `view/formando/FormacaoPageFormando.jsx`, `FormacaoADecorrer.jsx`
- **Learning path** — certificates, grades, history — `view/formando/PercursoFormativoFormando.jsx`
- **Forum / Community** landing — `view/forum/CommunityPage.jsx`
- **Forum thread** — nested replies + up/down voting — `view/forum/PublicacaoPage.jsx`
- **Code snippets** page with syntax highlighting — `view/forum/SnippetsPage.jsx`
- **Manager dashboard** — KPI cards + charts — `view/gestor/DashboardGestor.jsx`
- **Manager** user management / forum-topic management — `view/gestor/UtilizadoresGestor.jsx`,
  `TopicosForumGestor.jsx`
- **Trainer** course management, quiz submissions, task grading —
  `view/formador/FormadorFormacoes.jsx`, `Quiz.jsx`, `Tarefa.jsx`
- Public **Microsite** landing page — `view/Microsite.jsx`
- Light/dark toggle if present, notifications panel — `view/Notificacoes.jsx`

**Mobile (Flutter, Android emulator):**

- Login screen — `lib/authentication/LoginScreen2.dart`
- **Home tab** — course carousels — `lib/tabs/HomeTab.dart`
- **Academy tab** — browse by topic/area — `lib/tabs/AcademyTab.dart`
- Course detail + enrolment — `lib/pages/home/DetalhesCursoInscricao.dart`, `FormationDetailsPage.dart`
- In-progress course detail (materials, quiz) — `lib/pages/home/DetalhesFormacaoEmCurso.dart`,
  `QuizResponderPage.dart`
- **Forum tab** + post detail — `lib/tabs/ForumTab.dart`, `lib/pages/forum/PostDetailPage.dart`,
  `SnippetsPage.dart`
- **Notifications tab** + a received push banner — `lib/tabs/NotificationsTab.dart`
- **Profile tab** — learning path, completed courses, edit profile picture —
  `lib/tabs/ProfileTab.dart`, `lib/pages/profile/*`
- **Offline demo** — enable airplane mode and show the app still browsing synced content
  (the headline feature)

---

## 7. Running each app

### Web backend (`SoftSkillsWeb/backend`)

- `npm install`; needs a local **PostgreSQL** (`models/database.js` expects
  `localhost:5432`, db `softskills`, user `postgres`, pw `pint1234` — or edit it), an `.env`
  (`JWT_SECRET`, `SESSION_SECRET`, `AWS_*`, `S3_BUCKET`, `AWS_REGION`, `EMAIL_USER`,
  `EMAIL_PASS`, `PORT`), and `backend/firebase_admin.json` (a Firebase service-account key).
- `npm run dev` (nodemon) → `http://localhost:3000`. Tables auto-create via
  `sequelize.sync()`; DB starts empty — needs seeding for meaningful screenshots.
- S3 and FCM calls will fail without real credentials but the app boots and serves data.

### Web frontend (`SoftSkillsWeb/frontend`)

- `npm install`; `npm run dev` (Vite) → `http://localhost:5173`.
- Points at `https://api.softskills-academy.pt` (`src/config.js`) — **change `BASE_URL` to
  `http://localhost:3000`** to use a local backend. Add `http://localhost:5173` is already
  in the backend CORS allow-list.

### Mobile (`SoftSkillsApp`)

- `flutter pub get`; needs Firebase config (`lib/firebase_options.dart` +
  `android/app/google-services.json`) — present in repo, tied to the original project.
- `flutter run` on an Android emulator. `ApiService.baseUrl` is hard-coded to
  `https://api.softskills-academy.pt` — change it to the local backend
  (`http://10.0.2.2:3000` from the Android emulator) to run end-to-end.

---

## 8. Portfolio blurb corrections

Current (`app/page.tsx`):

> "Full learning management system with course creation, real-time chat, progress tracking
> and media uploads. Graded 19/20."
> Stack: React, Node.js, PostgreSQL, Socket.io

| Claim | Verdict |
|---|---|
| Full LMS | **Accurate.** |
| Course creation | **Accurate** — managers/trainers create courses, occurrences, quizzes, tasks, materials. |
| **Real-time chat** | **Inaccurate.** No chat, no realtime. There is an asynchronous forum (posts + nested replies + voting), code-snippet sharing, and a "contact management" form. |
| Progress tracking | **Accurate** — weighted quiz progress + attendance + learning path + PDF certificates. |
| Media uploads | **Accurate** — to AWS S3 (course materials, avatars, forum attachments). |
| Graded 19/20 | **Accurate.** |
| React | **Accurate** (React 19 + Vite). |
| Node.js | **Accurate** (Express 5). |
| PostgreSQL | **Accurate** (via Sequelize). |
| **Socket.io** | **Inaccurate** — not a dependency anywhere. |
| *Missing* | Flutter mobile app, AWS S3, Firebase Cloud Messaging, JWT auth. |

Suggested rewrite:

> "Full learning-management system — web (React) + Flutter mobile app on a shared Node/
> Express + PostgreSQL API. Course authoring, quizzes with weighted progress tracking and
> PDF certificates, an async knowledge-sharing forum, S3 media uploads, and Firebase push
> notifications. The mobile app works fully offline via a local SQLite mirror with
> background sync. Academic team project (team of 5), graded 19/20."
> Stack: React, Flutter, Node.js, Express, PostgreSQL, Sequelize, AWS S3, Firebase Cloud Messaging, JWT

---

## Appendix — key source files

**SoftSkillsWeb**
- `backend/src/app.js`, `backend/src/routes/index.js` — wiring
- `backend/src/config/middlewares.js` — CORS, JWT `checkToken`, `authorize`, multer
- `backend/src/models/database.js`, `backend/src/models/associations.js` — DB
- `backend/src/controllers/authenticationController.js` — login / JWT
- `backend/src/controllers/dataController.js` — `GET /teste/data` mobile aggregator
- `backend/src/controllers/materiaisController.js`, `publicacaoController.js`,
  `userController.js` — S3 uploads
- `backend/src/controllers/quizController.js` — auto-grade + progress
- `backend/src/services/notificationService.js` — FCM + in-app + email fan-out
- `backend/src/services/recommendationService.js` — recommendations (Nuno)
- `backend/src/schedules/` — cron jobs
- `frontend/src/config.js` — API + CDN URLs
- `frontend/src/routes/AppRoutes.jsx`, `routes/*Routes.jsx` — role-gated routing
- `frontend/src/view/formando/**`, `frontend/src/view/forum/**` — Nuno's main areas

**SoftSkillsApp**
- `lib/main.dart` — boot, sync, background_fetch, deep links
- `lib/api/ApiService.dart` — HTTP + JWT + multipart uploads
- `lib/api/DataSyncAPI.dart` — bulk sync + offline write queue
- `lib/api/AuthenticationAPI.dart` — login (Nuno)
- `lib/repositories/Database.dart` — SQLite schema (~17 tables)
- `lib/repositories/*Repository.dart` — per-entity upsert / query
- `lib/services/NotificationService.dart` — FCM + local notifications
- `lib/api/DownloadFiles.dart` — S3 image download for offline
- `pubspec.yaml` — dependencies
