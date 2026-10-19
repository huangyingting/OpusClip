# OpusClip Studio — AI Video Clipping, Editing & Social Repurposing Platform

Full-parity enterprise web application modeled after `https://www.opus.pro` and `https://clip.opus.pro`, built with **Next.js 16 (App Router)**, **Auth.js / NextAuth v4**, **Prisma 6 (SQLite for local dev, PostgreSQL for production)**, **Tailwind CSS**, **FFmpeg**, **Vitest**, and **Playwright**.

---

## Architecture & Engineering Documentation (`/docs`)

1. [`docs/01_EXPLORATION_AND_COVERAGE_REPORT.md`](docs/01_EXPLORATION_AND_COVERAGE_REPORT.md) — Exhaustive Playwright exploration coverage report (`opus.pro` & `clip.opus.pro`), route inventory, captured states, edge cases, and screenshots.
2. [`docs/02_ADR.md`](docs/02_ADR.md) — Architectural Decision Records (ADR-001 through ADR-006).
3. [`docs/03_PRD.md`](docs/03_PRD.md) — Product Requirements Document.
4. [`docs/04_TECHNICAL_SPEC_AND_ARCHITECTURE.md`](docs/04_TECHNICAL_SPEC_AND_ARCHITECTURE.md) — Technical Specification, Dual-Database Prisma Data Model, REST API Contracts, and Security Architecture.
5. [`docs/05_IMPLEMENTATION_PLAN_AND_BACKLOG.md`](docs/05_IMPLEMENTATION_PLAN_AND_BACKLOG.md) — Phased Implementation Plan & Task Backlog.
6. [`docs/06_ACCEPTANCE_CRITERIA_AND_PARITY_MATRIX.md`](docs/06_ACCEPTANCE_CRITERIA_AND_PARITY_MATRIX.md) — Acceptance Criteria (`AC-1` through `AC-8`) & Feature-Parity Matrix.

---

## Quick Start (Local SQLite Development)

```bash
# 1. Install dependencies
npm install

# 2. Push Prisma SQLite schema & seed sample workspace, 18-clip demo-danny project, templates & accounts
npx prisma db push
npm run db:seed

# 3. Bootstrap or update the Administrator account via CLI (never exposed via HTTP)
npm run bootstrap:admin -- --email=admin@opusclip.local --password=AdminPassword123! --name="Alex Rivera"

# 4. Run development or production server
npm run dev
# or
npm run build && npm run start
```

### Seeded Workspace Accounts

| Role | Email | Password | Capabilities |
|---|---|---|---|
| **Admin** | `admin@opusclip.local` | `AdminPassword123!` | Full Studio + `/admin/invitations` (single-use invite generation, revocation, RBAC) + `/admin/audit-logs` |
| **Creator** | `creator@opusclip.local` | `CreatorPass123!` | Full Studio access (video upload, ClipAnything™ curation, Multi-Track Editor, Brand Templates, Social Scheduler) |
| **Viewer** | `viewer@opusclip.local` | `ViewerPass123!` | Read-only Studio review & playback |

---

## Testing & Verification

```bash
# Run Vitest unit & integration tests (Invite-only admission, single-use tokens, revocation, expiry, audit logs, AI curation)
npm test

# Run Playwright End-to-End browser verification suite
npm run test:e2e
```

---

## Production Deployment (PostgreSQL + Docker)

```bash
# Validate PostgreSQL Prisma schema
npx prisma validate --schema=prisma/schema.postgres.prisma

# Build & start with PostgreSQL 16 via Docker Compose
docker compose up --build -d
```
