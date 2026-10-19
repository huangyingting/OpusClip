# Acceptance Criteria & Feature Parity Matrix

## 1. Acceptance Criteria (Given / When / Then)

### AC-1: Invite-Only Registration & Single-Use / Expiring / Revocable Codes
- **AC-1.1 (Direct Sign-Up Blocked)**:
  - *Given* `ACCOUNT_ADMISSION_MODE=invitation-only` (default),
  - *When* an unauthenticated client sends `POST /api/auth/register` or visits `/auth/login`,
  - *Then* direct self-registration is rejected with `403 REGISTRATION_DISABLED` and an `AUDIT_LOG` entry is recorded.
- **AC-1.2 (Single-Use Invitation Lifecycle)**:
  - *Given* an Admin creates an invitation for `neweditor@opusclip.local` with role `creator` and expiry `7 days`,
  - *When* the recipient opens `/invite/[token]` and submits their name and a valid password (`>= 8` chars),
  - *Then* their account is created with `role = "creator"`, the invitation transitions to `ACCEPTED` (`tokenHash = null`, `activeForEmail = null`), and reusing the same `/invite/[token]` URL immediately shows an invalid/consumed state.
- **AC-1.3 (Invitation Revocation & Expiration)**:
  - *Given* a `PENDING` invitation exists,
  - *When* an Admin clicks `Revoke` in `/admin/invitations` (or the invitation's `expiresAt` timestamp passes),
  - *Then* any attempt to accept that token fails with `410 Gone` and writes an audit event.
- **AC-1.4 (CLI-Only Bootstrap Admin)**:
  - *Given* a fresh deployment,
  - *When* the operator runs `npm run bootstrap:admin` with `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD`,
  - *Then* the root `admin` user is created/updated in the database and logged in `AuditLog`, while no HTTP bootstrap endpoint exists.
- **AC-1.5 (Role-Based Access Control)**:
  - *Given* users with roles `admin`, `creator`, and `viewer`,
  - *When* a `viewer` attempts to create/delete a project or access `/admin/invitations`,
  - *Then* the request is rejected (`403 Forbidden`), whereas `creator` can create/edit projects and `admin` can manage invitations, roles, and audit logs.

### AC-2: Video Ingestion, Upload & ClipAnything™ Curation
- **AC-2.1 (Local Video Upload & Configurator)**:
  - *Given* an authenticated `creator` or `admin` on `/dashboard`,
  - *When* they upload a local `.mp4` video file (e.g. `sample_podcast.mp4`) or enter a YouTube/video URL,
  - *Then* the inline ClipAnything™ configurator appears with `Clip model`, `Genre`, `Clip length`, `Topic filter`, `Prompt`, `Preset` selector (`Karaoke`, `Beasty`, `Mozi`, `Deep Diver`, `Popline`), and `Get clips in 1 click`.
- **AC-2.2 (1-Click Clip Generation)**:
  - *Given* a video is configured in `/dashboard`,
  - *When* the user clicks `Get clips in 1 click`,
  - *Then* a new `ClipProject` and ranked `ExportableClip` records with Virality Score™ (`0–100`), letter-grade breakdowns (`Hook`, `Flow`, `Value`, `Trend`), and word-level transcripts are generated and the user is navigated to `/clip/[projectId]`.

### AC-3: Project Results (`Grid View` & `List View`), Editor, Brand Studio & Social Suite
- **AC-3.1 (Grid View & List View Parity)**:
  - *Given* a project page `/clip/demo-danny` (or newly created project),
  - *When* toggling between Grid View (`aria-label="grid"`) and List View (`aria-label="list"`),
  - *Then* Grid View displays the 9:16 vertical clip grid with Virality Score™ badges, and List View displays the 3-column layout (`99/100` + `Hook`/`Flow`/`Value`/`Trend` letter grades, 9:16 player, and `Scene analysis` vs `Transcript only` tabs with `[start-end]` timestamps).
- **AC-3.2 (Multi-Track Editor & Real MP4/XML Export)**:
  - *Given* a user clicks `Edit clip` on any clip,
  - *When* `/editor/[clipId]` opens,
  - *Then* the user can click words to seek the video, edit transcript text, change aspect ratio (`9:16`, `1:1`, `16:9`) or layout (`Fill`, `Fit`, `Split`), customize caption styles, and export a real trimmed `.mp4` or `.xml` timeline file.
- **AC-3.3 (Brand Template Studio)**:
  - *Given* `/brand-templates-ux`,
  - *When* the user modifies `Setting` (aspect ratio, layout, caption lines, AI toggles) or `Style` (font, animation, highlight colors) and clicks `Save`,
  - *Then* the live 9:16 canvas updates immediately and the template persists to the database.
- **AC-3.4 (Social Calendar, Accounts & Analytics)**:
  - *Given* `/post/plansocial`, `/auto-post/calendar`, and `/analytics`,
  - *When* the user connects a social platform and schedules a clip on the calendar,
  - *Then* the scheduled post appears on the calendar date cell and updates workspace analytics.

---

## 2. Feature Parity Matrix (`opus.pro` / `clip.opus.pro` vs. OpusClip Studio)

| Feature Category | `opus.pro` / `clip.opus.pro` Reference | OpusClip Studio Implementation | Parity Status |
|---|---|---|---|
| **Marketing & Product Pages** | `/`, `/clip-anything`, `/captions`, `/ai-b-roll`, `/reframe`, `/pricing` | Implemented with responsive desktop & mobile dark-mode UI | 100% Parity |
| **Free AI Creator Tools** | `/tools/youtube-title-generator`, TikTok Caption/Hashtag, Transcript, Show Notes, Summarizer | Implemented at `/tools/[slug]` with interactive AI generation API | 100% Parity |
| **Authentication & Security** | Email / OAuth login + Workspace Team Invite modal | NextAuth v4 + Invite-Only Admission (`tokenHash`), Single-Use/Expiring Codes, Revocation, RBAC (`admin`, `creator`, `viewer`), CLI `bootstrap:admin`, and `AuditLog` | 100% Parity + Enhanced Security |
| **Dashboard & 12 AI Modes** | Collapsible sidebar, credit counter, URL input, MP4 file upload, 12 AI Mode pills, Sample project drawer | Full parity on `/dashboard` including inline post-upload ClipAnything™ configurator and AI mode modals | 100% Parity |
| **ClipAnything™ & Virality Score™** | Multimodal prompt curation, 0–100 Virality Score™, `Hook`/`Flow`/`Value`/`Trend` letter grades, `Scene analysis` vs `Transcript only` | Full parity on `/clip/[projectId]` (including authentic 18-clip `demo-danny` dataset + real-time curation for new uploads/links) | 100% Parity |
| **Multi-Track Video & Caption Editor** | Word-level transcript editing, animated Karaoke captions, `9:16`/`1:1`/`16:9` Reframe (`Fill`/`Fit`/`Split`), timeline | Full parity on `/editor/[clipId]` + real FFmpeg MP4 slicing and XML timeline export | 100% Parity |
| **Brand Template Studio** | `Setting` & `Style` tabs + live 9:16 preview canvas (`Karaoke`, `Beasty`, `Mozi`, `Deep Diver`, `Popline`) | Full parity on `/brand-templates-ux` with database persistence | 100% Parity |
| **Social Calendar & Accounts** | `/auto-post/calendar` (Month/Week, Schedule post) + `/post/plansocial` (9 platforms) + `/analytics` | Full parity across `/auto-post/calendar`, `/post/plansocial`, and `/analytics` | 100% Parity |
| **Search, Assets & Billing** | `/search` (scene search), `/collections` (Asset Library), `/subscription` (Plans & Credits) | Full parity across `/search`, `/collections`, and `/subscription` | 100% Parity |
| **Database Portability** | Cloud Database | Prisma ORM with SQLite (`prisma/schema.prisma`) for local dev and PostgreSQL (`prisma/schema.postgres.prisma`) for production | 100% Parity |
