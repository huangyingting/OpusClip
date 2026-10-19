import fs from "node:fs";
import path from "node:path";
import { prisma } from "../src/lib/prisma";
import {
  hashPassword,
  createOpaqueToken,
  hashOpaqueToken,
  writeAuditLog,
} from "../src/lib/account-admission";
import {
  DEFAULT_BRAND_TEMPLATES,
  curateClipsForProject,
  scoreToGrade,
} from "../src/lib/ai/clip-engine";

async function main() {
  console.log("Seeding OpusClip Studio database...");

  // 1. Seed Users (Admin, Creator, Viewer)
  const adminPasswordHash = await hashPassword(
    process.env.BOOTSTRAP_ADMIN_PASSWORD || "AdminPassword123!"
  );
  const creatorPasswordHash = await hashPassword("CreatorPass123!");
  const viewerPasswordHash = await hashPassword("ViewerPass123!");

  const adminUser = await prisma.user.upsert({
    where: { normalizedEmail: "admin@opusclip.local" },
    update: {
      name: "Alex Rivera (Admin)",
      role: "admin",
      status: "ACTIVE",
      creditsBalance: 3559,
      creditsTotal: 3600,
      planName: "Pro",
      billingCycle: "yearly",
      workspaceName: "Alex Studio Workspace",
    },
    create: {
      email: "admin@opusclip.local",
      normalizedEmail: "admin@opusclip.local",
      name: "Alex Rivera (Admin)",
      role: "admin",
      status: "ACTIVE",
      creditsBalance: 3559,
      creditsTotal: 3600,
      planName: "Pro",
      billingCycle: "yearly",
      workspaceName: "Alex Studio Workspace",
      passwordCredential: {
        create: { passwordHash: adminPasswordHash },
      },
    },
  });

  await prisma.passwordCredential.upsert({
    where: { userId: adminUser.id },
    create: { userId: adminUser.id, passwordHash: adminPasswordHash },
    update: { passwordHash: adminPasswordHash },
  });

  const creatorUser = await prisma.user.upsert({
    where: { normalizedEmail: "creator@opusclip.local" },
    update: {
      name: "Maya Lin (Creator)",
      role: "creator",
      status: "ACTIVE",
      creditsBalance: 420,
      creditsTotal: 600,
      planName: "Pro",
      billingCycle: "yearly",
      workspaceName: "Alex Studio Workspace",
    },
    create: {
      email: "creator@opusclip.local",
      normalizedEmail: "creator@opusclip.local",
      name: "Maya Lin (Creator)",
      role: "creator",
      status: "ACTIVE",
      creditsBalance: 420,
      creditsTotal: 600,
      planName: "Pro",
      billingCycle: "yearly",
      workspaceName: "Alex Studio Workspace",
      passwordCredential: {
        create: { passwordHash: creatorPasswordHash },
      },
    },
  });

  await prisma.passwordCredential.upsert({
    where: { userId: creatorUser.id },
    create: { userId: creatorUser.id, passwordHash: creatorPasswordHash },
    update: { passwordHash: creatorPasswordHash },
  });

  const viewerUser = await prisma.user.upsert({
    where: { normalizedEmail: "viewer@opusclip.local" },
    update: {
      name: "Jordan Vance (Viewer)",
      role: "viewer",
      status: "ACTIVE",
      creditsBalance: 50,
      creditsTotal: 50,
      planName: "Starter",
      billingCycle: "monthly",
      workspaceName: "Alex Studio Workspace",
    },
    create: {
      email: "viewer@opusclip.local",
      normalizedEmail: "viewer@opusclip.local",
      name: "Jordan Vance (Viewer)",
      role: "viewer",
      status: "ACTIVE",
      creditsBalance: 50,
      creditsTotal: 50,
      planName: "Starter",
      billingCycle: "monthly",
      workspaceName: "Alex Studio Workspace",
      passwordCredential: {
        create: { passwordHash: viewerPasswordHash },
      },
    },
  });

  await prisma.passwordCredential.upsert({
    where: { userId: viewerUser.id },
    create: { userId: viewerUser.id, passwordHash: viewerPasswordHash },
    update: { passwordHash: viewerPasswordHash },
  });

  // 2. Seed Brand Templates
  await prisma.brandTemplate.deleteMany({ where: { ownerId: adminUser.id } });
  const createdTemplates = [];
  for (const tpl of DEFAULT_BRAND_TEMPLATES) {
    const bt = await prisma.brandTemplate.create({
      data: {
        name: tpl.name,
        isDefault: tpl.isDefault,
        aspectRatio: tpl.aspectRatio,
        layoutMode: tpl.layoutMode,
        presetKey: tpl.presetKey,
        configJson: JSON.stringify(tpl.config),
        ownerId: adminUser.id,
      },
    });
    createdTemplates.push(bt);
  }
  const defaultTemplate = createdTemplates[0];

  // 3. Seed Authentic "demo-danny" Project & 18 Curated Clips from captured production JSON
  await prisma.exportableClip.deleteMany({});
  await prisma.clipProject.deleteMany({});

  const demoProjectPath = path.join(
    process.cwd(),
    "screenshots/exploration/clip_app/real_demo_danny_project.json"
  );
  const demoClipsPath = path.join(
    process.cwd(),
    "screenshots/exploration/clip_app/real_demo_danny_clips.json"
  );

  let rawDemoProject: Record<string, unknown> | null = null;
  let rawDemoClips: Array<Record<string, unknown>> = [];

  if (fs.existsSync(demoProjectPath) && fs.existsSync(demoClipsPath)) {
    const parsedProj = JSON.parse(fs.readFileSync(demoProjectPath, "utf8"));
    rawDemoProject = parsedProj.data || parsedProj;
    const parsedClips = JSON.parse(fs.readFileSync(demoClipsPath, "utf8"));
    rawDemoClips = parsedClips.data || [];
  }

  const demoTitle =
    (rawDemoProject?.sourceInfo as { title?: string } | undefined)?.title ||
    "24 Hours with Danny Duncan (The $150M YouTuber Building A City)";

  const demoProject = await prisma.clipProject.create({
    data: {
      id: "demo-danny",
      slug: "demo-danny",
      title: demoTitle,
      status: "COMPLETED",
      sourceType: "youtube",
      sourceUrl: "https://www.youtube.com/watch?v=xF8a9Gq6B2E",
      videoUrl: "/videos/sample_podcast.mp4",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80",
      durationMs: 1445000,
      videoLang: "en",
      genre: "Vlog & Interview",
      workflowMode: "long-to-shorts",
      customPrompt: "Give me highlight compilations of all the exciting moments in this video",
      creditsUsed: 24,
      isSaved: true,
      sourceInfoJson: JSON.stringify(
        rawDemoProject?.sourceInfo || {
          type: "YouTube",
          title: demoTitle,
          durationMs: 1445000,
          videoLang: "en",
          wordsPerMinute: 211,
        }
      ),
      curationPrefJson: JSON.stringify(
        rawDemoProject?.curationPref || {
          model: "ClipAnything",
          clipDurations: [[0, 180]],
          customPrompt:
            "Give me highlight compilations of all the exciting moments in this video",
        }
      ),
      renderPrefJson: JSON.stringify(
        rawDemoProject?.renderPref || defaultTemplate.configJson
      ),
      promptRecommendationsJson: JSON.stringify(
        rawDemoProject?.promptRecommendations || [
          "compile segments showing the retail store",
          "highlight all moments of generosity",
          "moments of driving different vehicles",
          "moments with retail store employees",
          "extract all conversations about revenue and business",
        ]
      ),
      brandTemplateId: defaultTemplate.id,
      ownerId: adminUser.id,
    },
  });

  if (rawDemoClips.length > 0) {
    for (let idx = 0; idx < rawDemoClips.length; idx++) {
      const c = rawDemoClips[idx];
      const rank = idx + 1;
      const score = Math.round(Number(c.score ?? 90));
      const jr = (c.judgeResult || {}) as Record<string, unknown>;
      const hookScoreNum = Math.round(Number(jr.hookScore ?? 0.88) * 100);
      const flowScoreNum = Math.round(Number(jr.coherenceScore ?? 0.91) * 100);
      const valueScoreNum = Math.round(Number(jr.connectionScore ?? 0.89) * 100);
      const trendScoreNum = Math.round(Number(jr.trendScore ?? 0.88) * 100);

      const screenplay = (c.screenplay || { chapters: [] }) as {
        chapters?: Array<{
          lines?: Array<{ type?: string; text?: string }>;
        }>;
      };

      const visualLines: string[] = [];
      for (const ch of screenplay.chapters || []) {
        for (const line of ch.lines || []) {
          if (line.type === "visual" && line.text) {
            visualLines.push(line.text);
          }
        }
      }

      const timeRanges = (c.timeRanges as number[][] | undefined) || [[286000, 354000]];
      const startMs = timeRanges[0]?.[0] ?? idx * 45000;
      const endMs =
        timeRanges[timeRanges.length - 1]?.[1] ??
        startMs + Number(c.durationMs || 65000);

      await prisma.exportableClip.create({
        data: {
          id: `demo-danny-clip-${rank}`,
          projectId: demoProject.id,
          rank,
          title: String(c.title || `Viral Highlight #${rank}`),
          description: String(c.description || ""),
          hashtags: String(
            c.hashtags || "#dannyduncan #creatorbusiness #viralshorts #opusclip"
          ),
          score,
          hookGrade: scoreToGrade(hookScoreNum),
          flowGrade: scoreToGrade(flowScoreNum),
          valueGrade: scoreToGrade(valueScoreNum),
          trendGrade: scoreToGrade(trendScoreNum),
          judgeResultJson: JSON.stringify({
            score,
            curvedScore: score,
            hookScore: hookScoreNum,
            hookComment: String(
              jr.hookComment ||
                "The hook immediately grabs attention with high curiosity and visual movement."
            ),
            coherenceScore: flowScoreNum,
            coherenceComment: String(
              jr.coherenceComment ||
                "Smooth conversational pacing with clear narrative progression."
            ),
            connectionScore: valueScoreNum,
            connectionComment: String(
              jr.connectionComment ||
                "Strong emotional resonance and relatable founder energy."
            ),
            trendScore: trendScoreNum,
            trendComment: String(
              jr.trendComment ||
                "High viral potential across TikTok, YouTube Shorts, and Reels."
            ),
            relevanceScore: 95,
          }),
          startMs,
          endMs,
          durationMs: Number(c.durationMs || endMs - startMs),
          videoUrl: "/videos/sample_podcast.mp4",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
          transcriptText: String(c.text || ""),
          sceneAnalysisText:
            visualLines.join(" ") ||
            "Dynamic studio and on-location camera tracking following the main speakers with high-contrast framing.",
          screenplayJson: JSON.stringify(c.screenplay || {}),
          isFavorite: rank <= 3,
        },
      });
    }
  } else {
    const fallbackClips = curateClipsForProject({
      projectTitle: demoTitle,
      genre: "Vlog & Interview",
      videoUrl: "/videos/sample_podcast.mp4",
      thumbnailUrl: demoProject.thumbnailUrl,
    });
    for (const fc of fallbackClips) {
      await prisma.exportableClip.create({
        data: {
          ...fc,
          projectId: demoProject.id,
        },
      });
    }
  }

  // 4. Seed a second Creator Studio Project ("The Future of AI Video Workflows - Ep. 142")
  const secondProject = await prisma.clipProject.create({
    data: {
      id: "ai-podcast-ep142",
      slug: "ai-podcast-ep142",
      title: "Deep Dive: How Top Podcasters Scale to 50M Monthly Shorts Views",
      status: "COMPLETED",
      sourceType: "upload",
      sourceUrl: "/videos/sample_podcast.mp4",
      videoUrl: "/videos/sample_podcast.mp4",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&auto=format&fit=crop&q=80",
      durationMs: 960000,
      videoLang: "en",
      genre: "Podcast",
      workflowMode: "long-to-shorts",
      customPrompt: "Extract tactical growth frameworks and contrarian hooks",
      creditsUsed: 16,
      isSaved: false,
      promptRecommendationsJson: JSON.stringify([
        "Extract 3-step retention framework",
        "Moments discussing monetization and sponsors",
        "Contrarian opinions on editing automation",
      ]),
      brandTemplateId: createdTemplates[1]?.id ?? defaultTemplate.id,
      ownerId: adminUser.id,
    },
  });

  const secondClips = curateClipsForProject({
    projectTitle: secondProject.title,
    genre: "Podcast",
    customPrompt: secondProject.customPrompt ?? undefined,
    videoUrl: "/videos/sample_podcast.mp4",
    thumbnailUrl: secondProject.thumbnailUrl,
  });

  for (const clip of secondClips) {
    await prisma.exportableClip.create({
      data: {
        ...clip,
        projectId: secondProject.id,
      },
    });
  }

  // 5. Seed Social Accounts
  await prisma.scheduledPost.deleteMany({});
  await prisma.socialAccount.deleteMany({});

  const socialPlatforms = [
    {
      platform: "youtube",
      handle: "@AlexStudioShorts",
      displayName: "Alex Studio Shorts",
      status: "CONNECTED",
      followersCount: 148000,
    },
    {
      platform: "tiktok",
      handle: "@alexriveraclips",
      displayName: "Alex Rivera Clips",
      status: "CONNECTED",
      followersCount: 312500,
    },
    {
      platform: "instagram",
      handle: "@alexstudio.reels",
      displayName: "Alex Studio Reels",
      status: "CONNECTED",
      followersCount: 89400,
    },
    {
      platform: "linkedin",
      handle: "alex-rivera-media",
      displayName: "Alex Rivera",
      status: "CONNECTED",
      followersCount: 41200,
    },
    {
      platform: "x",
      handle: "@alexrivera_ai",
      displayName: "Alex Rivera ⚡",
      status: "CONNECTED",
      followersCount: 67800,
    },
    {
      platform: "facebook",
      handle: "AlexStudioOfficial",
      displayName: "Alex Studio Page",
      status: "DISCONNECTED",
      followersCount: 19500,
    },
  ];

  const createdSocials = [];
  for (const sp of socialPlatforms) {
    const acc = await prisma.socialAccount.create({
      data: {
        ...sp,
        ownerId: adminUser.id,
      },
    });
    createdSocials.push(acc);
  }

  // 6. Seed Scheduled & Published Social Posts on Calendar
  const now = new Date();
  const postsData = [
    {
      clipId: "demo-danny-clip-1",
      socialAccountId: createdSocials[1].id,
      platform: "tiktok",
      title: 'Hilarious Hoodie Trend Goes Viral! "I Love Hot Moms"',
      caption:
        'Wait for the $150M merch breakdown 🔥 Would you rock this hoodie? #dannyduncan #viralclips #opusclip',
      hashtags: "#dannyduncan #viralclips #opusclip",
      scheduledAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      status: "PUBLISHED",
      viewsCount: 428900,
      likesCount: 39100,
      commentsCount: 1420,
      sharesCount: 8340,
    },
    {
      clipId: "demo-danny-clip-2",
      socialAccountId: createdSocials[0].id,
      platform: "youtube",
      title: "From Office to Store: How Viral Merch Created an Ice Cream Empire!",
      caption:
        "How Danny turned a retail store into a fan destination 🍦 #shorts #creatorbusiness",
      hashtags: "#shorts #creatorbusiness",
      scheduledAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      status: "PUBLISHED",
      viewsCount: 194200,
      likesCount: 16800,
      commentsCount: 612,
      sharesCount: 2910,
    },
    {
      clipId: "demo-danny-clip-3",
      socialAccountId: createdSocials[2].id,
      platform: "instagram",
      title: "Why Relocating to Your Hometown Unlocks Creative Freedom",
      caption:
        "Building an entire creator compound in Englewood, Florida 🌴 #reels #founderstory",
      hashtags: "#reels #founderstory",
      scheduledAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
      status: "SCHEDULED",
      viewsCount: 0,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
    },
    {
      clipId: "demo-danny-clip-4",
      socialAccountId: createdSocials[3].id,
      platform: "linkedin",
      title: "The 3-Step Retention Playbook Behind 15M Organic Views",
      caption:
        "Most media teams overcomplicate short-form distribution. Here is the exact system we run.",
      hashtags: "#mediastrategy #contentmarketing #aiworkflow",
      scheduledAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      status: "SCHEDULED",
      viewsCount: 0,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
    },
  ];

  for (const p of postsData) {
    await prisma.scheduledPost.create({
      data: {
        ...p,
        ownerId: adminUser.id,
      },
    });
  }

  // 7. Seed Asset Library Items
  await prisma.mediaAsset.deleteMany({});
  const assetsData = [
    {
      name: "Studio Podcast Master Recording.mp4",
      category: "video",
      fileUrl: "/videos/sample_podcast.mp4",
      mimeType: "video/mp4",
      durationSec: 30.0,
      sizeBytes: 1057759,
      tags: "podcast,raw,studio",
    },
    {
      name: "Revenue Chart Zoom B-Roll.mp4",
      category: "b-roll",
      fileUrl: "/videos/sample_podcast.mp4",
      mimeType: "video/mp4",
      durationSec: 6.5,
      sizeBytes: 420100,
      tags: "finance,chart,growth,b-roll",
    },
    {
      name: "Opus Neon Corner Watermark.svg",
      category: "logo",
      fileUrl: "/videos/sample_podcast.mp4",
      mimeType: "image/svg+xml",
      durationSec: 0,
      sizeBytes: 18400,
      tags: "brand,logo,watermark",
    },
    {
      name: "Upbeat Synth Pulse (124 BPM).mp3",
      category: "music",
      fileUrl: "/videos/sample_podcast.mp4",
      mimeType: "audio/mpeg",
      durationSec: 94.0,
      sizeBytes: 2140000,
      tags: "synth,energetic,background",
    },
    {
      name: "Subscribe CTA 9:16 Outro Bumper.mp4",
      category: "intro-outro",
      fileUrl: "/videos/sample_podcast.mp4",
      mimeType: "video/mp4",
      durationSec: 3.5,
      sizeBytes: 310000,
      tags: "outro,cta,vertical",
    },
  ];

  for (const asset of assetsData) {
    await prisma.mediaAsset.create({
      data: {
        ...asset,
        ownerId: adminUser.id,
      },
    });
  }

  // 8. Seed a Pending Invitation & Audit Log Baseline
  await prisma.accountInvitation.deleteMany({});
  const sampleInviteToken = createOpaqueToken();
  await prisma.accountInvitation.create({
    data: {
      email: "producer@opusclip.local",
      normalizedEmail: "producer@opusclip.local",
      activeForEmail: "producer@opusclip.local",
      role: "creator",
      status: "PENDING",
      tokenHash: hashOpaqueToken(sampleInviteToken),
      expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      invitedByUserId: adminUser.id,
    },
  });

  await writeAuditLog({
    action: "DATABASE_SEEDED",
    actorId: adminUser.id,
    actorEmail: adminUser.email,
    targetType: "Workspace",
    targetId: "Alex Studio Workspace",
    metadata: {
      seededProjects: 2,
      demoDannyClips: rawDemoClips.length || 4,
      admissionMode: "invitation-only",
    },
  });

  console.log("Database seed completed successfully!");
}

main()
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
