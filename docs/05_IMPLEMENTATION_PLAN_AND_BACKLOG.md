# Implementation Plan & Prioritized Engineering Backlog

## 1. Phased Implementation Plan

### Phase 1: Project Scaffolding & Dual-Database Setup (`scaffold-app`)
1. Initialize Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + Lucide Icons in `/home/azadmin/OpusClip`.
2. Configure `.gitignore` to strictly exclude `.cred`, `.env*`, `node_modules/`, `.next/`, and `*.db`.
3. Create `prisma/schema.prisma` (SQLite for local dev) and `prisma/schema.postgres.prisma` (PostgreSQL for production).
4. Push SQLite schema (`npx prisma db push`) and copy `/home/azadmin/OpusClip/tmp_videos/sample_podcast.mp4` into `public/videos/sample_podcast.mp4`.

### Phase 2: Invite-Only Authentication, RBAC, Revocation & Audit Logging (`implement-auth-rbac`)
1. Implement `src/lib/account-admission/` (admission policy, token hashing, email normalization, password policy, audit writer) referencing `../Arcade`.
2. Implement `scripts/bootstrap-admin.ts` (`npm run bootstrap:admin`) for CLI-only root admin creation.
3. Implement NextAuth v4 configuration (`src/lib/auth.ts` & `/api/auth/[...nextauth]/route.ts`) with JWT callbacks, live user/role/status verification, and login audit logging.
4. Implement invitation API routes (`/api/invitations`, `/api/invitations/by-id/[id]`, `/api/invitations/[token]`, `/api/invitations/[token]/accept`, `/api/auth/register`) and admin management routes (`/api/admin/users`, `/api/admin/audit-logs`).
5. Build authentication pages (`/auth/login`, `/invite/[token]`) and Admin Console (`/admin/invitations`, `/admin/audit-logs`).

### Phase 3: Core OpusClip Studio, AI Clipping Engine, Editor & Marketing Pages (`implement-core-features`)
1. Build database seeder (`prisma/seed.ts`) loading:
   - Default accounts (`admin@opusclip.local`, `creator@opusclip.local`, `viewer@opusclip.local`) and sample invitations.
   - The authentic 18-clip `demo-danny` (`24 Hours with Danny Duncan (The $150M YouTuber Building A City)`) project from `real_demo_danny_project.json` and `real_demo_danny_clips.json`, wired to local playable MP4 media (`/videos/sample_podcast.mp4`).
   - Additional sample projects, 5 signature Brand Templates (`Karaoke`, `Beasty`, `Mozi`, `Deep Diver`, `Popline`), connected Social Accounts, Scheduled Posts, and Asset Library items.
2. Build the **ClipAnything™ Curation & Virality Score™ Engine** (`src/lib/ai/clip-engine.ts`) and local video upload/FFmpeg slicer (`/api/upload`, `/api/exportable-clips/[clipId]/export`).
3. Build the unified Studio Shell (`src/components/studio/StudioShell.tsx`) with collapsible sidebar (`Create`, `Post`, `Admin`), credit counter, `Add credits` modal, and `Invite members` modal.
4. Implement all Studio views:
   - `/dashboard` (12 AI workflow modes, URL input, real MP4 file upload, inline ClipAnything™ configurator, sample project drawer)
   - `/clip/[projectId]` (Grid View & Detailed List View with Virality Score™ `Hook`/`Flow`/`Value`/`Trend` breakdown, `Scene analysis` vs `Transcript only` tabs, custom prompt re-curation, and animated 9:16 video player)
   - `/editor/[clipId]` (Interactive word-level transcript editor, live `9:16`/`1:1`/`16:9` Karaoke canvas preview, multi-track timeline, and real MP4/XML export)
   - `/projects` (All projects, Saved projects, search/filter, Learning Center)
   - `/brand-templates-ux` (`Setting` and `Style` tabs + live interactive 9:16 preview)
   - `/auto-post/calendar`, `/post/plansocial`, `/analytics` (Social Scheduler Calendar, 9-platform Account Manager, Cross-Platform Analytics)
   - `/collections`, `/search`, `/subscription` (Asset Library, Multimodal Scene Search, Plans & Credits)
5. Implement Public Marketing & Free AI Tool pages (`/`, `/clip-anything`, `/captions`, `/ai-b-roll`, `/reframe`, `/pricing`, `/tools/[slug]`).

### Phase 4: Verification, Unit/API Tests & Playwright E2E Suite (`verify-and-test`)
1. Run unit and integration tests (`vitest`) covering invite-only admission, single-use/expiring/revoked tokens, RBAC enforcement, audit logging, and ClipAnything™ curation.
2. Run production Next.js build (`npm run build`).
3. Run comprehensive Playwright E2E tests across desktop (`1440×900`) and mobile (`390×844`) viewports verifying every workflow end-to-end.

---

## 2. Prioritized Task Backlog

| ID | Epic | Task | Priority | Status |
|---|---|---|---|---|
| `T-01` | Exploration | Explore `opus.pro` & `clip.opus.pro` with `.cred` & video upload | P0 | Done |
| `T-02` | Documentation | Author Exploration Report, ADR, PRD, Spec, Plan, and Parity Matrix | P0 | In Progress |
| `T-03` | Foundation | Scaffold Next.js 16, Tailwind, Prisma (SQLite + Postgres), Dockerfiles | P0 | Pending |
| `T-04` | Auth & RBAC | Implement Invite-Only admission, `tokenHash`, revocation, and `AuditLog` | P0 | Pending |
| `T-05` | Auth & RBAC | Implement CLI `npm run bootstrap:admin` script | P0 | Pending |
| `T-06` | Data & Seed | Seed `demo-danny` (18 real clips), Brand Templates, Social Posts, Users | P0 | Pending |
| `T-07` | Studio Core | Build `/dashboard` with URL input, MP4 file upload, and 12 AI modes | P0 | Pending |
| `T-08` | Studio Core | Build `/clip/[projectId]` Grid & List views with Virality Score™ & Scene Analysis | P0 | Pending |
| `T-09` | Video Editor | Build `/editor/[clipId]` with word-level transcript editing & FFmpeg MP4 export | P0 | Pending |
| `T-10` | Brand Studio | Build `/brand-templates-ux` with `Setting` & `Style` tabs + live 9:16 preview | P0 | Pending |
| `T-11` | Social Suite | Build `/auto-post/calendar`, `/post/plansocial`, and `/analytics` | P1 | Pending |
| `T-12` | Workspace | Build `/projects`, `/collections`, `/search`, and `/subscription` | P1 | Pending |
| `T-13` | Public & Tools | Build `/`, `/clip-anything`, `/captions`, `/ai-b-roll`, `/reframe`, `/pricing`, `/tools/[slug]` | P1 | Pending |
| `T-14` | QA & E2E | Execute Vitest unit/API tests and Playwright E2E verification | P0 | Pending |
