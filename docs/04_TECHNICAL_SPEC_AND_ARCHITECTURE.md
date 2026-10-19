# Technical Specification, Architecture & Data Model

## 1. System Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        Browser Client (React 19 / Next.js)                 │
│                                                                            │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │ Public & SEO Routes  │  │ Authenticated Studio │  │ Admin Security   │  │
│  │ /, /clip-anything,   │  │ /dashboard, /clip/*, │  │ Console          │  │
│  │ /captions, /reframe, │  │ /editor/*, /projects │  │ /admin/invites,  │  │
│  │ /ai-b-roll, /pricing │  │ /brand-templates-ux, │  │ /admin/users,    │  │
│  │ /tools/[slug]        │  │ /auto-post/calendar  │  │ /admin/audit-log │  │
│  └──────────┬───────────┘  └──────────┬───────────┘  └────────┬─────────┘  │
└─────────────┼─────────────────────────┼───────────────────────┼────────────┘
              │                         │                       │
              ▼                         ▼                       ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                     Next.js 16 App Router Server Layer                     │
│                                                                            │
│  ┌──────────────────────────────┐  ┌────────────────────────────────────┐  │
│  │ NextAuth v4 + RBAC Guard     │  │ Studio & AI REST APIs              │  │
│  │ - Invite-Only Admission      │  │ - POST /api/upload (MP4/WebM)      │  │
│  │ - SHA-256 Token Verification │  │ - POST /api/clip-projects          │  │
│  │ - Role Check (admin/creator/ │  │ - GET/PATCH /api/exportable-clips  │  │
│  │   viewer)                    │  │ - GET/POST /api/brand-templates    │  │
│  │ - AuditLog Writer            │  │ - GET/POST /api/post-tasks         │  │
│  └──────────────┬───────────────┘  └─────────────────┬──────────────────┘  │
└─────────────────┼────────────────────────────────────┼─────────────────────┘
                  │                                    │
                  ▼                                    ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────────┐
│ Prisma ORM (SQLite Dev / Postgres)   │  │ Local Media & FFmpeg Engine      │
│ - User, PasswordCredential           │  │ - public/uploads/*.mp4           │
│ - AccountInvitation, AuditLog        │  │ - public/videos/sample_podcast   │
│ - Workspace, ClipProject, Clip       │  │ - FFmpeg clip slicer & XML gen   │
│ - BrandTemplate, SocialAccount, Post │  │                                  │
└──────────────────────────────────────┘  └──────────────────────────────────┘
```

---

## 2. Invite-Only Authentication & RBAC Specification

Adapted from `../Arcade/docs/NEXTAUTH_INVITE_ONLY_SPEC.md`:

1. **Admission Policy (`ACCOUNT_ADMISSION_MODE`)**:
   - Reads `process.env.ACCOUNT_ADMISSION_MODE?.trim().toLowerCase() || "invitation-only"`.
   - Any value other than `"invitation-only"` or `"open"` fails closed to `"invitation-only"`.
   - When `"invitation-only"`, `POST /api/auth/register` rejects requests (`403 REGISTRATION_DISABLED`). New users can only be created via CLI bootstrap (`npm run bootstrap:admin`) or by redeeming a valid invitation (`POST /api/invitations/[token]/accept`).
2. **Cryptographic Token & Single-Active-Invite Invariant**:
   - Raw token: `randomBytes(32).toString("base64url")`.
   - Stored hash: `tokenHash = createHash("sha256").update(token).digest("hex")`.
   - While `status === "PENDING"`, `activeForEmail = normalizedEmail` (`@unique`).
   - Transitioning to any terminal state (`ACCEPTED`, `REVOKED`, `EXPIRED`) sets `tokenHash = null` and `activeForEmail = null`.
3. **Role Hierarchy (`admin`, `creator`, `viewer`)**:
   - `admin`: Full access to `/admin/*` (issue/revoke invitations, update user roles/status, inspect `AuditLog`) + all studio operations.
   - `creator`: Create/edit/delete projects, clips, brand templates, assets, and scheduled social posts.
   - `viewer`: Read-only access to workspace projects, clips, Virality Score™ reports, and clip downloads; cannot mutate workspace resources or manage invitations.
4. **CLI Bootstrap Admin (`npm run bootstrap:admin`)**:
   - Executed via `scripts/bootstrap-admin.ts`.
   - Never exposed over HTTP.
   - Reads `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD`, `BOOTSTRAP_ADMIN_NAME` (or CLI flags `--email`, `--password`, `--name`), creates/updates the admin account inside a Prisma transaction, revokes any pending invitations for that email, and records a `BOOTSTRAP_ADMIN_CREATED` audit log entry.

---

## 3. Complete Data Model (`prisma/schema.prisma` & `prisma/schema.postgres.prisma`)

### 3.1 Authentication, Invitation & Security Audit Models
- **`User`**:
  - `id` (`String @id @default(cuid())`)
  - `email` (`String`), `normalizedEmail` (`String @unique`)
  - `name` (`String`), `avatarUrl` (`String?`)
  - `role` (`String @default("creator")`) — `"admin" | "creator" | "viewer"`
  - `status` (`String @default("ACTIVE")`) — `"ACTIVE" | "DISABLED"`
  - `creditsBalance` (`Int @default(360)`)
  - `planName` (`String @default("Pro")`)
  - `billingCycle` (`String @default("yearly")`)
  - `workspaceName` (`String @default("Opus Studio Workspace")`)
  - `createdAt`, `updatedAt`
- **`PasswordCredential`**:
  - `userId` (`String @id`), `passwordHash` (`String`), `createdAt`, `updatedAt`
- **`AccountInvitation`**:
  - `id` (`String @id @default(cuid())`)
  - `email` (`String`), `normalizedEmail` (`String`)
  - `activeForEmail` (`String? @unique`)
  - `role` (`String @default("creator")`)
  - `status` (`String @default("PENDING")`) — `"PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED"`
  - `tokenHash` (`String? @unique`)
  - `expiresAt` (`DateTime`), `acceptedAt` (`DateTime?`), `revokedAt` (`DateTime?`)
  - `invitedByUserId` (`String`), `acceptedByUserId` (`String?`)
  - `createdAt`, `updatedAt`
- **`AccountEmailOutbox`**:
  - `id`, `invitationId`, `recipientEmail`, `subject`, `bodyText`, `deliveryState`, `createdAt`, `updatedAt`
- **`AuditLog`**:
  - `id`, `action`, `actorId`, `actorEmail`, `targetType`, `targetId`, `ipAddress`, `userAgent`, `metadataJson`, `createdAt`

### 3.2 OpusClip Core Domain Models
- **`ClipProject`**:
  - `id` (`String @id @default(cuid())`)
  - `slug` (`String @unique`) — e.g. `"demo-danny"`
  - `title` (`String`)
  - `status` (`String @default("COMPLETED")`) — `"PROCESSING" | "COMPLETED" | "FAILED"`
  - `sourceType` (`String`) — `"youtube" | "upload" | "loom" | "zoom" | "rumble" | "sample"`
  - `sourceUrl` (`String`)
  - `videoUrl` (`String`) — playable local/remote MP4 path
  - `thumbnailUrl` (`String`)
  - `durationMs` (`Int`)
  - `videoLang` (`String @default("en")`)
  - `genre` (`String @default("Podcast")`)
  - `workflowMode` (`String @default("long-to-shorts")`)
  - `customPrompt` (`String?`)
  - `creditsUsed` (`Int @default(15)`)
  - `isSaved` (`Boolean @default(false)`)
  - `sourceInfoJson` (`String`) — full `sourceInfo` structure matching `api.opus.pro`
  - `curationPrefJson` (`String`) — `model`, `clipDurations`, `topicKeywords`, `customPrompt`
  - `renderPrefJson` (`String`) — aspect ratio, layout mode, font, karaoke colors, AI toggles
  - `promptRecommendationsJson` (`String`) — array of recommended ClipAnything prompts
  - `brandTemplateId` (`String?`)
  - `ownerId` (`String`)
  - `createdAt`, `updatedAt`
- **`ExportableClip`**:
  - `id` (`String @id @default(cuid())`)
  - `projectId` (`String`)
  - `rank` (`Int`)
  - `title` (`String`)
  - `description` (`String`)
  - `hashtags` (`String`)
  - `score` (`Int`) — 0–100 Virality Score™
  - `hookGrade` (`String`), `flowGrade` (`String`), `valueGrade` (`String`), `trendGrade` (`String`)
  - `judgeResultJson` (`String`) — `hookScore`, `hookComment`, `coherenceScore`, `coherenceComment`, `connectionScore`, `connectionComment`, `trendScore`, `trendComment`
  - `startMs` (`Int`), `endMs` (`Int`), `durationMs` (`Int`)
  - `videoUrl` (`String`), `thumbnailUrl` (`String`)
  - `transcriptText` (`String`)
  - `sceneAnalysisText` (`String`)
  - `screenplayJson` (`String`) — `chapters[].lines[]` with word-level `words: [{ text, tr: [startSec, endSec] }]` and visual scene descriptions
  - `renderPrefOverrideJson` (`String?`) — clip-level overrides from Multi-Track Editor
  - `isFavorite` (`Boolean @default(false)`)
  - `createdAt`, `updatedAt`
- **`BrandTemplate`**:
  - `id` (`String @id @default(cuid())`)
  - `name` (`String`)
  - `isDefault` (`Boolean @default(false)`)
  - `aspectRatio` (`String @default("9:16")`) — `"9:16" | "1:1" | "16:9"`
  - `layoutMode` (`String @default("fill")`) — `"fill" | "fit" | "split"`
  - `presetKey` (`String @default("karaoke")`) — `"karaoke" | "beasty" | "mozi" | "deep-diver" | "popline"`
  - `configJson` (`String`) — full `Setting` + `Style` configuration (`captionLines`, `captionPosition`, `autoHeadline`, `pinFirstSpeaker`, `overlayLogoUrl`, `introOutroUrl`, `musicTrack`, `removeFillerWords`, `removePauses`, `keywordsHighlighter`, `aiEmojis`, `autoBroll`, `autoTransitions`, `autoZoom`, `fontFamily`, `fontSize`, `fontColor`, `animation`, `uppercase`, `highlightPrimary`, `highlightSecondary`, `shadow`, `stroke`)
  - `ownerId` (`String?`)
  - `createdAt`, `updatedAt`
- **`SocialAccount`**:
  - `id`, `platform` (`"youtube" | "tiktok" | "instagram" | "facebook" | "linkedin" | "x" | "threads" | "bluesky" | "pinterest"`), `handle`, `displayName`, `avatarUrl`, `status` (`"CONNECTED" | "DISCONNECTED"`), `followersCount`, `ownerId`, `createdAt`, `updatedAt`
- **`ScheduledPost`**:
  - `id`, `clipId`, `socialAccountId`, `platform`, `title`, `caption`, `hashtags`, `scheduledAt`, `status` (`"SCHEDULED" | "PUBLISHED" | "DRAFT" | "FAILED"`), `viewsCount`, `likesCount`, `commentsCount`, `sharesCount`, `ownerId`, `createdAt`, `updatedAt`
- **`MediaAsset`**:
  - `id`, `name`, `category` (`"b-roll" | "logo" | "music" | "intro-outro" | "video"`), `fileUrl`, `mimeType`, `durationSec`, `sizeBytes`, `ownerId`, `createdAt`, `updatedAt`

---

## 4. REST API Specification

| Method & Endpoint | Auth / Role | Description |
|---|---|---|
| `POST /api/auth/[...nextauth]` | Public | NextAuth v4 session & JWT sign-in/sign-out |
| `POST /api/auth/register` | Public (Blocked in Invite-Only) | Returns `403 REGISTRATION_DISABLED` in `invitation-only` mode |
| `GET /api/invitations` | `admin` | Lists all invitations (`PENDING`, `ACCEPTED`, `REVOKED`, `EXPIRED`) |
| `POST /api/invitations` | `admin` | Creates a single-use invitation (`email`, `role`, `expiresInDays`) and returns the one-time `acceptUrl` + raw `token` |
| `DELETE /api/invitations/by-id/[id]` | `admin` | Revokes a pending invitation and writes to `AuditLog` |
| `GET /api/invitations/[token]` | Public | Validates token hash and returns masked invitation state |
| `POST /api/invitations/[token]/accept` | Public | Redeems a `PENDING` invitation, creates the user + password hash, marks `ACCEPTED`, and writes to `AuditLog` |
| `GET /api/admin/users` | `admin` | Lists workspace users with role and status |
| `PATCH /api/admin/users/[id]` | `admin` | Updates user role (`admin`, `creator`, `viewer`), status, or credit balance |
| `GET /api/admin/audit-logs` | `admin` | Lists security and operational audit logs with action/email filters |
| `POST /api/upload` | `admin`, `creator` | Uploads a local video/asset file (`MP4`, `WEBM`, `MOV`, `PNG`, `MP3`) to `public/uploads/`, probes duration, and returns `{ fileUrl, durationMs, sizeBytes }` |
| `GET /api/clip-projects` | Authenticated | Lists projects (supports `?saved=true`, `?search=`) |
| `POST /api/clip-projects` | `admin`, `creator` | Creates a new project from URL, uploaded video, or sample template and runs the ClipAnything™ curation engine |
| `GET /api/clip-projects/[id]` | Authenticated | Returns full project detail (`sourceInfo`, `curationPref`, `renderPref`, `promptRecommendations`) + curated clips |
| `PATCH /api/clip-projects/[id]` | `admin`, `creator` | Updates project title, `isSaved`, `renderPref`, or runs a new prompt curation pass |
| `DELETE /api/clip-projects/[id]` | `admin`, `creator` | Deletes a project and its clips |
| `GET /api/exportable-clips/[clipId]` | Authenticated | Fetches a single clip with word-level `screenplay` and `renderPref` |
| `PATCH /api/exportable-clips/[clipId]` | `admin`, `creator` | Saves transcript edits, trim boundaries (`startMs`, `endMs`), title, or clip style overrides |
| `GET /api/exportable-clips/[clipId]/export` | Authenticated | Exports clip as a trimmed `.mp4` file (via `ffmpeg`) or `.xml` NLE timeline (`?format=mp4\|xml`) |
| `GET /api/brand-templates` | Authenticated | Lists workspace Brand Templates |
| `POST /api/brand-templates` | `admin`, `creator` | Creates a new Brand Template |
| `PATCH /api/brand-templates/[id]` | `admin`, `creator` | Updates Brand Template `Setting` & `Style` config |
| `GET /api/social-accounts` | Authenticated | Lists social platform connections |
| `POST /api/social-accounts` | `admin`, `creator` | Connects or toggles a social account |
| `GET /api/post-tasks` | Authenticated | Lists scheduled and published social posts |
| `POST /api/post-tasks` | `admin`, `creator` | Schedules a clip or uploaded video to social platforms |
| `DELETE /api/post-tasks/[id]` | `admin`, `creator` | Cancels/deletes a scheduled post |
| `GET /api/assets` / `POST /api/assets` | Authenticated | Lists or uploads Asset Library media |
| `GET /api/search` | Authenticated | Multimodal semantic search across clip dialogue, visual scene analysis, and Virality Score™ |
| `POST /api/tools/generate` | Public | Powers Free AI Creator Tools (YouTube Titles, TikTok Captions, Hashtags, Transcripts, Show Notes, Summaries) |
