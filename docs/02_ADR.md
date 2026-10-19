# Architecture Decision Records (ADR)

## ADR-001: Next.js 16 App Router Full-Stack Monolith

- **Status**: Accepted
- **Context**: `opus.pro` and `clip.opus.pro` split marketing pages, authenticated studio pages, and backend REST APIs across separate deployments. For our self-contained, full-parity OpusClip Studio application, we need a unified architecture that supports public marketing pages (`/`, `/clip-anything`, `/captions`, `/ai-b-roll`, `/reframe`, `/pricing`, `/tools/*`), authenticated workspace routes (`/dashboard`, `/projects`, `/clip/[id]`, `/editor/[clipId]`, `/brand-templates`, `/calendar`, `/social-accounts`, `/analytics`, `/assets`, `/search`, `/admin/*`), and REST API endpoints (`/api/*`).
- **Decision**: Use **Next.js 16 (App Router)** with React 19 and TypeScript in a single cohesive codebase. Route groups (`(marketing)`, `(auth)`, `(studio)`) isolate layouts while sharing design tokens, types, and server utilities.
- **Consequences**:
  - Zero CORS friction between the studio UI and backend API routes.
  - Server Components accelerate initial page loads while Client Components power interactive video playback, canvas caption rendering, timeline scrubbing, and drag-and-drop uploads.

---

## ADR-002: NextAuth v4 JWT Session Strategy with Invite-Only Admission & RBAC

- **Status**: Accepted
- **Context**: The application requires invite-only registration with single-use/expiring invitation codes, role-based access control (`admin`, `creator`, `viewer`), invitation revocation, a CLI bootstrap admin script (`npm run bootstrap:admin`), and comprehensive audit logging, following the proven patterns in `../Arcade`.
- **Decision**:
  - Use `next-auth` v4 with `CredentialsProvider` and `strategy: "jwt"`.
  - Default `ACCOUNT_ADMISSION_MODE` to `"invitation-only"` (fail-closed if misconfigured).
  - Store only `tokenHash = sha256(token)` (`32` random bytes encoded as `base64url`) on `AccountInvitation`, and enforce single-pending-invite-per-email via `activeForEmail @unique`.
  - Clear `tokenHash = null` and `activeForEmail = null` upon transition to any terminal state (`ACCEPTED`, `REVOKED`, `EXPIRED`).
  - Never expose an HTTP bootstrap admin endpoint; provision root admins strictly via `npm run bootstrap:admin` (`scripts/bootstrap-admin.ts`).
  - Re-verify user existence, `status === "ACTIVE"`, and current `role` in NextAuth callbacks and API route guards.
- **Consequences**:
  - Database never stores plaintext invitation tokens or plaintext passwords (`bcryptjs` cost 12).
  - Revoked or expired invitations immediately fail validation and emit structured `AuditLog` entries.

---

## ADR-003: Dual Database Support via Prisma (SQLite Local Dev + PostgreSQL Production)

- **Status**: Accepted
- **Context**: Local development and automated E2E testing require zero external infrastructure dependencies (SQLite), whereas production deployments require concurrent write scalability and relational durability (PostgreSQL).
- **Decision**:
  - Maintain `prisma/schema.prisma` configured for SQLite (`file:./dev.db`) for instant local setup and CI/Playwright testing.
  - Maintain `prisma/schema.postgres.prisma` configured for PostgreSQL (`env("DATABASE_URL")`) for production and Docker deployments.
  - Use portable scalar types (`String`, `Int`, `Float`, `Boolean`, `DateTime`) and JSON-serialized string columns for structured metadata (`sourceInfoJson`, `curationPrefJson`, `renderPrefJson`, `judgeResultJson`, `screenplayJson`, `metadataJson`) with typed Zod/TypeScript parsers in the data access layer.
- **Consequences**:
  - 100% schema compatibility between SQLite and PostgreSQL without provider-specific column divergences.

---

## ADR-004: Multimodal ClipAnything Curation & Virality Score™ Engine

- **Status**: Accepted
- **Context**: OpusClip's signature capability is ingesting a long-form video (via URL or local MP4/WebM upload) and generating ranked short clips with a 0–100 **Virality Score™** broken down into four sub-metrics (`Hook`, `Flow`, `Value`/`Connection`, `Trend`), plus interleaved visual scene analysis and word-level transcripts.
- **Decision**:
  - Implement a deterministic + heuristic **ClipAnything Curation Engine** (`src/lib/ai/clip-engine.ts`) that processes uploaded video files (extracting real duration/metadata via `ffprobe`/`ffmpeg` when available or HTML5 media metadata) and video URLs.
  - Support natural-language prompts (`customPrompt`), `genre` selection, target `clipDurations`, and `topicKeywords` filtering.
  - Compute structured `judgeResult` scores (`score`, `hookScore`, `hookComment`, `coherenceScore`, `coherenceComment`, `connectionScore`, `connectionComment`, `trendScore`, `trendComment`) and letter grades (`A+`, `A`, `A-`, `B+`, `B`) matching `api.opus.pro`'s exact schema.
  - Pre-seed the authentic 18-clip `demo-danny` project (`24 Hours with Danny Duncan`) plus additional sample projects backed by real playable local MP4 video files (`/videos/sample_podcast.mp4`).
- **Consequences**:
  - Users can both explore rich pre-curated projects immediately and upload real MP4 files or submit video links to generate playable, editable clips in real time.

---

## ADR-005: Interactive HTML5 Video + Dynamic Karaoke Caption Overlay & Multi-Track Timeline Editor

- **Status**: Accepted
- **Context**: In `clip.opus.pro`, users preview clips in `9:16` Portrait, `1:1` Square, or `16:9` Landscape aspect ratios with real-time animated word-by-word karaoke captions (`Karaoke`, `Beasty`, `Mozi`, `Deep Diver`, `Popline`), active speaker reframing (`Fill`, `Fit`, `Split`), AI B-roll overlays, and an interactive transcript + timeline editor.
- **Decision**:
  - Build a unified `<ClipVideoPlayer />` component that synchronizes an HTML5 `<video>` element with a real-time animated caption overlay layer driven by word-level timestamps (`words: [{ text, tr: [startSec, endSec] }]`) and the active Brand Template (`renderPref`).
  - Build a full-featured **Multi-Track AI Video Editor** (`/editor/[clipId]`) where clicking any word in the transcript seeks the video, editing or deleting words updates the caption stream and trim ranges, and users can adjust layout (`9:16`, `1:1`, `16:9`, `Fill`, `Fit`, `Split`), toggle AI B-roll/Auto-zoom/Emoji overlays, and export an MP4 clip (using server-side `ffmpeg` slicing when exporting real local video segments).
- **Consequences**:
  - Instant 60fps preview responsiveness in the browser when switching Brand Templates, caption animations, colors, or aspect ratios, plus real downloadable MP4 exports.

---

## ADR-006: Comprehensive Security & Operational Audit Logging

- **Status**: Accepted
- **Context**: Enterprise and invite-only workspaces require full visibility into account admissions, invitation lifecycle events, role changes, login attempts, and critical workspace mutations.
- **Decision**:
  - Persist all security and administrative events in the `AuditLog` table (`action`, `actorId`, `actorEmail`, `targetType`, `targetId`, `ipAddress`, `userAgent`, `metadataJson`, `createdAt`).
  - Expose an Admin Security & Invitation Console (`/admin/invitations` and `/admin/audit-logs`) accessible strictly to users with `role === "admin"`.
- **Consequences**:
  - Every invitation creation, acceptance, revocation, expiration failure, login failure, and role update is auditable from both the CLI/database and the Admin UI.
