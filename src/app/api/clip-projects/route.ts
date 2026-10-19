import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getAuthenticatedActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { curateClipsForProject } from "@/lib/ai/clip-engine";
import { writeAuditLog } from "@/lib/account-admission";

export async function GET(req: Request) {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const savedOnly = searchParams.get("saved") === "true";
  const search = searchParams.get("search")?.trim() || "";

  const projects = await prisma.clipProject.findMany({
    where: {
      ...(savedOnly ? { isSaved: true } : {}),
      ...(search
        ? {
            title: {
              contains: search,
            },
          }
        : {}),
    },
    include: {
      _count: {
        select: { clips: true },
      },
      brandTemplate: {
        select: { id: true, name: true, presetKey: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (actor.role === "viewer") {
    return NextResponse.json(
      { error: "Viewers have read-only access and cannot create new projects." },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const sourceUrl = String(body.sourceUrl || "").trim();
  const videoUrl = String(body.videoUrl || "/videos/sample_podcast.mp4").trim();
  const title =
    String(body.title || "").trim() ||
    (sourceUrl
      ? `AI Curated Session — ${sourceUrl.replace(/^https?:\/\//, "").slice(0, 42)}`
      : "Studio Upload Session");
  const genre = String(body.genre || "Podcast");
  const workflowMode = String(body.workflowMode || "long-to-shorts");
  const customPrompt = body.customPrompt ? String(body.customPrompt).trim() : null;
  const sourceType = String(body.sourceType || (sourceUrl.includes("youtube") ? "youtube" : "upload"));
  const durationMs = Number(body.durationMs || 900000);
  const creditsRequired = Math.max(5, Math.min(30, Math.round(durationMs / 60000)));

  if (!sourceUrl && !body.videoUrl) {
    return NextResponse.json(
      { error: "Please provide a video link or upload a video file." },
      { status: 400 }
    );
  }

  const slug = `proj-${randomBytes(4).toString("hex")}`;
  const defaultTemplate = await prisma.brandTemplate.findFirst({
    where: { isDefault: true },
  });

  const thumbnailUrl =
    String(body.thumbnailUrl || "") ||
    "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80";

  const generatedClips = curateClipsForProject({
    projectTitle: title,
    genre,
    customPrompt: customPrompt ?? undefined,
    videoUrl,
    thumbnailUrl,
    durationMs,
  });

  const project = await prisma.$transaction(async (tx) => {
    const createdProject = await tx.clipProject.create({
      data: {
        slug,
        title,
        status: "COMPLETED",
        sourceType,
        sourceUrl: sourceUrl || videoUrl,
        videoUrl,
        thumbnailUrl,
        durationMs,
        videoLang: String(body.videoLang || "en"),
        genre,
        workflowMode,
        customPrompt,
        creditsUsed: creditsRequired,
        isSaved: false,
        curationPrefJson: JSON.stringify({
          model: body.clipModel || "ClipAnything",
          clipLength: body.clipLength || "Auto (0m-3m)",
          topicKeywords: body.topicKeywords || [],
          customPrompt,
        }),
        renderPrefJson: defaultTemplate?.configJson || "{}",
        promptRecommendationsJson: JSON.stringify([
          "Give me highlight compilations of all the exciting moments in this video",
          "Extract all contrarian hooks and tactical frameworks",
          "Compile funny behind-the-scenes reactions",
          "Find moments discussing revenue, growth, and strategy",
        ]),
        brandTemplateId: body.brandTemplateId || defaultTemplate?.id || null,
        ownerId: actor.id,
      },
    });

    for (const c of generatedClips) {
      await tx.exportableClip.create({
        data: {
          ...c,
          projectId: createdProject.id,
        },
      });
    }

    await tx.user.update({
      where: { id: actor.id },
      data: {
        creditsBalance: Math.max(0, actor.creditsBalance - creditsRequired),
      },
    });

    return createdProject;
  });

  await writeAuditLog({
    action: "CLIP_PROJECT_CREATED",
    actorId: actor.id,
    actorEmail: actor.email,
    targetType: "ClipProject",
    targetId: project.id,
    metadata: {
      title: project.title,
      sourceType,
      workflowMode,
      clipsGenerated: generatedClips.length,
      creditsUsed: creditsRequired,
    },
  });

  return NextResponse.json({ project }, { status: 201 });
}
