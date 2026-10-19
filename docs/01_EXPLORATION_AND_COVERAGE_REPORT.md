# Opus.pro & Clip.opus.pro Exploration and Coverage Report

## 1. Executive Summary

Using Playwright in headless Chromium, we systematically explored both the public product/marketing platform (`https://www.opus.pro`) and the authenticated creator workspace (`https://clip.opus.pro`) across desktop (`1440×900`) and mobile (`390×844`) viewports.

Key exploration milestones completed:
1. **Credential Analysis & Session Bootstrap (`.cred`)**:
   - Loaded the 9 exported cookies from `.cred` into Playwright browser contexts.
   - Identified the authenticated user (`user_01M58Y5APA2NFC5PR9FMYZVZP2`) and organization (`org_1k58u5bseULdDsyFYVZP2`) embedded in `.opus.pro` cookies.
   - Reverse-engineered `clip.opus.pro`'s static Next.js SPA bootstrap pipeline (`POST https://api.opus.pro/api/auth/session-profile` → `localforage` IndexedDB token store → `POST https://api.opus.pro/api/org-members/prepare-assembled-basic-info`).
2. **Real Video Download & Upload Testing**:
   - Downloaded a CC0 MP4 test video (`/home/azadmin/OpusClip/tmp_videos/sample_podcast.mp4`) and uploaded it to `clip.opus.pro/dashboard` via Playwright's `setInputFiles('input[type="file"]')`.
   - Captured the post-upload inline project configurator (`Genre`, `Clip length`, `Topic filter`, `Prompt`, `Processing credit saver`, `Template` picker, and `Get clips in 1 click`) as well as the backend signed-URL edge/error toast (`"parameters required. signedUrl is not found"`).
3. **Production API Payload & Localization Extraction**:
   - Captured the complete Next.js `_buildManifest.js` route manifest (65+ routes) and all 6 English localization bundles (`common.json`, `auth.json`, `subscription.json`, `plansocial.json`, `clip.json`, `editor.json` — 4,389 translation keys).
   - Extracted authentic production JSON payloads from `https://api.opus.pro/api/clip-projects/demo-danny` (`real_demo_danny_project.json`) and `https://api.opus.pro/api/exportable-clips?projectId=demo-danny` (`real_demo_danny_clips.json`, containing 18 curated clips with Virality Score™, `judgeResult`, word-level timestamps, and visual/verbal `screenplay` chapters).

---

## 2. Exploration Coverage Matrix

### 2.1 Public Product & Marketing Routes (`https://www.opus.pro`)

| Route | Title / Purpose | Desktop (`1440×900`) | Mobile (`390×844`) | Screenshot Artifacts |
|---|---|---|---|---|
| `/` | #1 AI Video Clipping & Editing Tool (OpusClip Hero, URL dropzone, stats) | Covered | Covered | `opus_pro/home_desktop_top.png`, `home_desktop_scroll1.png`, `home_desktop_scroll2.png`, `home_mobile_top.png` |
| `/clip-anything` | ClipAnything Multimodal Visual/Audio/Sentiment Curation | Covered | Covered | `opus_pro/clip_anything_desktop_top.png`, `clip_anything_desktop_scroll1.png`, `clip_anything_mobile_top.png` |
| `/captions` | Animated Karaoke & Hormozi-style AI Captions | Covered | Covered | `opus_pro/captions_desktop_top.png`, `captions_desktop_scroll1.png`, `captions_mobile_top.png` |
| `/ai-b-roll` | AI B-Roll Generator (Contextual Stock & AI B-Roll) | Covered | Covered | `opus_pro/ai_b_roll_desktop_top.png`, `ai_b_roll_desktop_scroll1.png`, `ai_b_roll_mobile_top.png` |
| `/reframe` | AI Reframe (`9:16`, `1:1`, `16:9` Active Speaker Tracking & Split Screen) | Covered | Covered | `opus_pro/reframe_desktop_top.png`, `reframe_desktop_scroll1.png`, `reframe_mobile_top.png` |
| `/pricing` | Starter / Pro / Business Plans, Monthly vs Yearly Billing, Credit FAQ | Covered | Covered | `opus_pro/pricing_desktop_top.png`, `pricing_desktop_scroll1.png`, `pricing_mobile_top.png` |

### 2.2 Authenticated Application Routes (`https://clip.opus.pro`)

| Route | Feature Area | Observed UI States & Interactions | Screenshot Artifacts |
|---|---|---|---|
| `/auth/oauth/login` | Auth & OAuth Entry | Email magic-link / code entry + Google / Apple / Facebook OAuth buttons | `clip_app/01_login.png` |
| `/dashboard` | Creator Home & Ingestion Hub | Collapsible left sidebar (`Create` / `Post`), top credit bar, video link input (`YouTube`, `Zoom`, `Rumble`, `Loom`), file upload (`MP4`, `MOV`, `WEBM`), 12 AI Workflow Mode pills | `clip_app/02_dashboard_desktop.png`, `02_dashboard_mobile.png`, `02b_sidebar_expanded.png`, `02c_sidebar_drawer_open.png` |
| `/dashboard` (Video Uploaded) | Inline Clipping Configurator | Thumbnail card (`sample_podcast`), credit badge, `Clip model` (`ClipAnything`), `Genre`, `Clip length`, `Topic filter`, `Prompt`, `Processing credit saver`, `Preset` carousel (`Karaoke`, `Beasty`, `Mozi`, `Deep Diver`, `Popline`), `Get clips in 1 click` | `clip_app/14_dashboard_video_uploaded.png`, `14b_dashboard_uploaded_scrolled.png`, `14c_dashboard_get_clips_clicked.png` |
| `/dashboard` (AI Mode Modals) | Quick-Start Feature Drawers | Clicking `AI Captions` opens a dedicated modal (`AI Captions: Make loopable shorts with dynamic captions`, `Try now` vs `Create project`); clicking `Try a sample project` opens the sample library drawer | `clip_app/15_dashboard_mode_AI_Captions.png`, `16_sample_projects_modal.png` |
| `/clip/demo-danny` | Project Results & Clip Curation | **Grid View** (18 vertical 9:16 clip cards with `#rank`, Virality Score™ `99`, hover actions `Publish on Social`, `Export`, `Download`, `Edit`) and **List View** (side-by-side Virality Score breakdown `Hook A-`, `Flow A`, `Value A-`, `Trend A-`, 9:16 player, `Scene analysis` vs `Transcript only` tabs, timestamp `[04:46-05:54]`, action buttons) | `clip_app/18c_project_demo_danny_clips.png`, `18d_project_demo_danny_scrolled.png`, `18f_clip_card_hover.png`, `18g_project_list_view.png` |
| `/projects` | My Projects & Team Library | Tabs (`All projects (0)`, `Saved (0)`), `Learning center` toggle, `Total projects` / `Expire soon` counters, `Upload` CTA | `clip_app/03_projects_desktop.png` |
| `/brand-templates-ux` | Brand Template Studio | Two-column studio: Left tabbed configurator (`Setting`: Aspect ratio `9:16`/`1:1`/`16:9`, Clip layout `Fill`/`Fit`/`Split`, Caption lines & position, `Auto headline`, Brand `Overlay`/`Intro-outro`/`Music`, AI toggles `Remove filler words`, `Remove pauses`, `AI keywords highlighter`, `AI emojis`, `Stock video B-roll`, `Auto transitions`, `Auto zoom`; `Style`: Font family, size, color, animation `Bounce`, `Uppercase`, `Highlight`, `Shadow`, `Stroke`, `Position`) + Right interactive 9:16 canvas preview | `clip_app/04_brand_templates_desktop.png`, `19a_brand_template_settings.png`, `19b_brand_template_style_tab.png`, `19c_brand_template_settings_scrolled.png` |
| `/auto-post/calendar` | Social Post Calendar | Monthly/Weekly calendar grid, timezone picker (`GMT+00:00`), `Schedule post` & `Upload local video` actions, social account warning banner | `clip_app/05_calendar_desktop.png` |
| `/post/plansocial` | Social Account Connections | Platform grid for connecting YouTube Shorts, TikTok, Instagram Reels, Facebook Reels, LinkedIn, X (Twitter), Threads, Bluesky, and Pinterest | `clip_app/06_social_accounts_desktop.png` |
| `/analytics` | Social Analytics | Connected account selector (`Overview`), cross-platform engagement metrics, views/likes/comments charts | `clip_app/07_analytics_desktop.png` |
| `/subscription` | Billing & Credits | Monthly/Yearly toggle, Starter (`$15/mo`) vs Pro (`$14.5/mo`, `50% OFF`, `3,600 credits/yr`, `2 seats`, `6 brand templates`) | `clip_app/08_subscription_desktop.png` |
| `/collections` | Asset Library | Media asset management for reusable B-roll, logos, fonts, lut presets, and audio tracks | `clip_app/10_collections_desktop.png` |
| `/search` | AI Semantic Video Search | Search across workspace project moments by dialogue, visual action, emotion, or object | `clip_app/11_search_desktop.png` |
| `/tools/*` | Free AI Creator Tools | Public creator utilities (`YouTube Title Generator`, `TikTok Caption Generator`, `TikTok Hashtag Generator`, `Transcript Maker`, `AI Show Note Generator`, `AI Video Summarizer`) | `clip_app/13_tool_youtube_title_generator.png` |

---

## 3. Observed Architecture & Data Flows

### 3.1 Frontend Architecture
- **Framework**: Next.js with static route chunks, Ant Design (`antd` v5) primitives combined with Tailwind CSS dark-mode styling (`bg-[#09090b]`, `#141416` cards, `#7c3aed` / `#22c55e` accents).
- **Client Storage**: `localforage` (IndexedDB database `localforage`, store `keyvaluepairs`) stores `accessToken`, `auth0User`, and `currentOrgId`.
- **Responsive Design**:
  - Desktop (`>= 1024px`): Persistent left navigation rail (collapsible between 64px icon-only rail and 240px labeled drawer) + fluid main workspace.
  - Mobile (`< 768px`): Compact top header with slide-out navigation drawer and stacked single-column cards.

### 3.2 Backend API Endpoints Observed
1. `POST /api/auth/session-profile` — Exchanges session cookie for JWT `accessToken` and user profile.
2. `POST /api/org-members/prepare-assembled-basic-info` — Returns `userOrgs[]` with `orgId`, `orgName`, `plan`, `role`, `permissions[]`, and feature entitlements (`BrandTemplate`, `OpenApi`, credit balances).
3. `GET /api/clip-projects/:projectId` — Returns project metadata, `sourceInfo` (video dimensions, language, duration, WPM, genre), `curationPref` (`model: "ClipAnything"`, `clipDurations`, `customPrompt`), `renderPref` (aspect ratio, layout modes, font, karaoke colors, AI toggles), and `promptRecommendations[]`.
4. `GET /api/exportable-clips?projectId=:projectId` — Returns curated clips sorted by `score` (Virality Score™ `0–100`), with `judgeResult` (`hookScore`, `hookComment`, `coherenceScore`, `coherenceComment`, `connectionScore`, `connectionComment`, `trendScore`, `trendComment`), `timeRanges`, `screenplay.chapters[].lines[]` (interleaved `verbal` word-level timestamps and `visual` scene descriptions), `hashtags`, and preview/export URIs.
5. `POST /api/upload/signed-url` — Requests presigned upload URL for local video files (observed returning `"parameters required. signedUrl is not found"` when invoked without an active upload session).
6. `GET /api/brand-templates` & `PUT /api/brand-templates/:id` — Manages workspace brand templates.
7. `GET /api/post-tasks` & `POST /api/post-tasks` — Lists and schedules social media posts on the calendar.

---

## 4. Edge & Error States Documented
1. **Unauthenticated Protected Route Access**: Navigating to `/dashboard`, `/projects`, or `/brand-templates-ux` without a valid session redirects immediately to `/auth/oauth/login`.
2. **Signed Upload Validation Failure**: Attempting to submit an uploaded local file when `signedUrl` has not completed initialization displays a non-blocking red toast alert (`"parameters required. signedUrl is not found"`) at the top center of the viewport while preserving form state.
3. **Disconnected Social Accounts Warning**: On `/auto-post/calendar` and `/analytics`, when no social accounts are linked or tokens need re-authorization, an inline amber alert banner prompts the user to connect/re-authorize accounts on `/post/plansocial`.
4. **Empty Workspace States**: On `/projects` and `/collections` with zero items, an illustrated empty state with a primary `Upload` CTA and a `Learning center` tutorial carousel is displayed.
