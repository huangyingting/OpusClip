# Product Requirements Document (PRD) — OpusClip Studio

## 1. Product Vision & Overview
**OpusClip Studio** is an enterprise-ready, AI-powered video clipping, reframing, captioning, and social publishing platform modeled directly on `opus.pro` and `clip.opus.pro`, enhanced with strict **invite-only registration**, **single-use/expiring invitation codes**, **role-based access control (RBAC)**, **revocation**, and **security audit logging**.

Long-form video creators, podcasters, educators, and media teams use OpusClip Studio to turn 1 long video (via URL or local MP4/WebM file upload) into 10+ viral short clips in one click, complete with **Virality Score™** grading, word-level animated **Karaoke Captions**, **ClipAnything™** multimodal prompt curation, **Brand Template Studio**, **Multi-Track Transcript & Timeline Editing**, and a **Multi-Platform Social Scheduler & Analytics Suite**.

---

## 2. Target Personas & Roles

1. **Workspace Administrator (`role = "admin"`)**
   - Bootstrapped via CLI (`npm run bootstrap:admin`) or promoted by an existing Admin.
   - Manages workspace invitations (single-use, expiring links/codes), revokes pending invites, assigns member roles (`admin`, `creator`, `viewer`), reviews the Security Audit Log, and has full access to all studio features.
2. **Content Creator / Video Editor (`role = "creator"`)**
   - Onboards via a valid single-use invitation link/code.
   - Uploads videos or drops links, runs ClipAnything™ curation, customizes Brand Templates, edits clips in the Multi-Track Editor, exports MP4/XML files, connects social accounts, and schedules posts on the Calendar.
3. **Reviewer / Client (`role = "viewer"`)**
   - Onboards via a valid single-use invitation link/code with `viewer` role.
   - Can browse projects, watch generated clips, inspect Virality Score™ breakdowns and scene analysis, and download approved exports, but cannot delete projects or issue workspace invitations.

---

## 3. Core Functional Requirements

### FR-1: Invite-Only Authentication, RBAC & Audit Logging
- **FR-1.1**: Default admission mode is `invitation-only` (fail-closed). Direct self-registration without a valid invitation token is blocked (`403 REGISTRATION_DISABLED`).
- **FR-1.2**: Admins can create single-use invitations bound to a normalized email address, assigned a role (`admin`, `creator`, `viewer`), and configured with an expiration window (`1–30 days`, default `7 days`).
- **FR-1.3**: Only the SHA-256 hash (`tokenHash`) of the 256-bit invitation token is persisted in the database. Only one `PENDING` invitation may exist per email at a time (`activeForEmail @unique`).
- **FR-1.4**: Admins can revoke any `PENDING` invitation immediately; expired or revoked invitations cannot be used to register.
- **FR-1.5**: Root admin provisioning is executed strictly via CLI (`npm run bootstrap:admin`); no HTTP bootstrap admin endpoint is exposed.
- **FR-1.6**: All authentication, invitation lifecycle, role change, and critical workspace mutations are recorded in `AuditLog` and inspectable in the Admin Console (`/admin/invitations`, `/admin/audit-logs`).

### FR-2: Public Marketing & Product Showcase + Free AI Creator Tools
- **FR-2.1**: High-craft dark-mode marketing pages mirroring `opus.pro`:
  - `/` (Home hero, interactive link/upload call-to-action, social proof, workflow showcase)
  - `/clip-anything` (Multimodal visual, audio, and sentiment curation showcase)
  - `/captions` (Animated Karaoke & Hormozi-style caption showcase)
  - `/ai-b-roll` (Contextual Stock & AI B-Roll generator showcase)
  - `/reframe` (`9:16`, `1:1`, `16:9` AI Reframe & active speaker tracking showcase)
  - `/pricing` (Starter, Pro, and Business plans with Monthly/Yearly toggle and Credit FAQ)
- **FR-2.2**: Interactive **Free AI Creator Tools** (`/tools/[slug]`):
  - `youtube-title-generator`
  - `tiktok-caption-generator`
  - `tiktok-hashtag-generator`
  - `transcript-maker`
  - `ai-show-note-generator`
  - `ai-video-summarizer`

### FR-3: Creator Dashboard & Multi-Mode Video Ingestion (`/dashboard`)
- **FR-3.1**: Collapsible left sidebar (`Create`: Home, My Projects, Brand Template, Asset Library; `Post`: Calendar, Analytics, Social Accounts; `Admin`: Invitations & RBAC, Audit Logs) + Top credit bar (`Credits` counter + `Add credits` modal).
- **FR-3.2**: 12 AI Workflow Mode pills (`Long to shorts`, `Edit video`, `AI Captions`, `AI Producer Beta`, `AI B-roll`, `AI Reframe`, `Auto SFX`, `Upscale`, `Voice dubbing`, `Enhance speech`, `Voiceover hook`, `Script to video Beta`), with quick-start drawers/modals.
- **FR-3.3**: Video ingestion via:
  1. **URL Input** (YouTube, Loom, Zoom, Rumble, or direct MP4 URL)
  2. **Local Video File Upload** (`MP4`, `MOV`, `WEBM` via file picker or drag-and-drop, saved to local storage and playable in browser)
  3. **Sample Project Library** (`Try a sample project` drawer including the 18-clip `24 Hours with Danny Duncan` project and podcast/educational samples)
- **FR-3.4**: Inline **ClipAnything™ Configurator** upon video selection/upload:
  - Clipping model (`ClipAnything` / `Fast`)
  - Genre (`Auto`, `Podcast`, `Educational`, `Marketing`, `Gaming`, `Vlog`, `Comedy`)
  - Target clip length (`Auto (0m-3m)`, `<30s`, `30s-60s`, `60s-90s`, `90s-3m`)
  - Topic filter keywords & Natural-language custom prompt (with clickable AI prompt recommendations)
  - Brand Template preset carousel (`Karaoke`, `Beasty`, `Mozi`, `Deep Diver`, `Popline`)
  - `Processing credit saver` time-range slider
  - `Get clips in 1 click` execution with real credit calculation and progress states.

### FR-4: Project Results, Virality Score™ & Clip Curation (`/clip/[projectId]`)
- **FR-4.1**: Switch seamlessly between **Grid View** (`button[aria-label="grid"]`) and **Detailed List View** (`button[aria-label="list"]`).
- **FR-4.2**: Prompt bar at the top of the project page allowing users to filter clips or generate a new curation pass with a custom natural-language prompt (e.g., `"Give me highlight compilations of all the exciting moments in this video"`).
- **FR-4.3**: In **Grid View**, display vertical 9:16 clip cards with rank (`#1`, `#2`, ...), **Virality Score™** (`99`), video preview on click/hover, duration badge, and quick action overlay (`Publish on Social`, `Export`, `Download`, `Edit`).
- **FR-4.4**: In **List View**, display side-by-side:
  - Left: Overall Virality Score™ (`99/100`) + 4 letter-grade sub-metrics (`Hook`, `Flow`, `Value`, `Trend`) and AI judge commentary.
  - Center: Interactive 9:16 video player with animated word-by-word captions, play/pause, scrubbing, and mute.
  - Right: Toggleable **`Scene analysis`** (interleaved visual camera/action descriptions + dialogue) vs **`Transcript only`** view, timestamp range badge (`[04:46-05:54]`), and action toolbar (`Publish on Social`, `Export XML`, `Download HD`, `Duplicate`, `Edit clip`).

### FR-5: Multi-Track AI Video & Transcript Editor (`/editor/[clipId]`)
- **FR-5.1**: Text-based transcript editing: click any word to seek the video to that exact timestamp; edit word text or toggle/cut words to trim the clip.
- **FR-5.2**: Live `9:16` / `1:1` / `16:9` canvas preview with real-time rendering of the active caption animation (`Karaoke`, `Beasty`, `Mozi`, `Deep Diver`, `Popline`), highlight colors (`#04f827`, `#FFFD03`), font family/size, layout mode (`Fill`, `Fit`, `Split`), AI B-roll overlays, and Auto-headline banner.
- **FR-5.3**: Multi-track timeline at the bottom showing Video Track, Caption Track, B-Roll Track, and Audio Track with playhead scrubbing and trim handles.
- **FR-5.4**: Real export capability: download the clipped MP4 segment (using `ffmpeg` time-range slicing when exporting from a local video file) or export Premiere Pro / DaVinci Resolve `.xml` timeline metadata.

### FR-6: Brand Template Studio (`/brand-templates-ux`)
- **FR-6.1**: Manage multiple workspace Brand Templates (`Default Preset`, `Hormozi Neon`, `Podcast Split`, etc.) and create new custom templates.
- **FR-6.2**: Two-tab Left Inspector (`Setting` & `Style`) paired with a live interactive `9:16` / `1:1` / `16:9` preview canvas:
  - **`Setting` tab**: Aspect ratio (`9:16`, `1:1`, `16:9`), Clip layout (`Fill`, `Fit`, `Split`), Caption lines (`1 line` / `3 lines`) & position (`Auto`, `Top`, `Middle`, `Bottom`), `Auto headline` toggle, `Pin first speaker`, Brand (`Overlay logo/CTA`, `Intro/outro`, `Music`), and AI toggles (`Remove filler words`, `Remove pauses`, `AI keywords highlighter`, `AI emojis`, `Stock video B-roll`, `Auto transitions`, `Auto zoom`).
  - **`Style` tab**: Font family (`Montserrat`, `Inter`, `Anton`, `Oswald`, `Rubik`), font size, font weight, text color, `Animation` (`Bounce`, `Pop`, `Slide`, `Fade`, `None`), `Uppercase` toggle, primary & secondary `Highlight` color pickers, `Shadow`, and `Stroke`.

### FR-7: Social Post Scheduler, Accounts & Analytics (`/auto-post/calendar`, `/post/plansocial`, `/analytics`)
- **FR-7.1**: Connect/disconnect social accounts across 9 platforms (YouTube Shorts, TikTok, Instagram Reels, Facebook Reels, LinkedIn, X, Threads, Bluesky, Pinterest) on `/post/plansocial`.
- **FR-7.2**: Schedule clips or uploaded local videos to one or more connected social accounts on `/auto-post/calendar` with Monthly/Weekly calendar views, timezone selection, caption/hashtag editing, and status tracking (`SCHEDULED`, `PUBLISHED`, `DRAFT`, `FAILED`).
- **FR-7.3**: Inspect cross-platform post performance, views, engagement rate, top-performing clips, and credit efficiency on `/analytics`.

### FR-8: Semantic Search, Asset Library & Subscription Management (`/search`, `/collections`, `/subscription`)
- **FR-8.1**: Search across all workspace clips and scene descriptions by spoken dialogue, visual action, emotion, or score on `/search`.
- **FR-8.2**: Manage reusable B-roll clips, brand logos, intro/outro bumpers, and background music tracks in the Asset Library (`/collections`).
- **FR-8.3**: Manage workspace subscription plan (`Starter`, `Pro`, `Business`), billing cycle (`Monthly` / `Yearly`), and top up processing credits on `/subscription`.
