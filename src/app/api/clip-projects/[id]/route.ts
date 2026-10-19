import { NextResponse } from "next/server";
import { getAuthenticatedActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { curateClipsForProject } from "@/lib/ai/clip-engine";
import { writeAuditLog } from "@/lib/account-admission";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { id } = await context.params;
  const project = await prisma.clipProject.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
    include: {
      clips: {
        orderBy: [{ rank: "asc" }, { score: "desc" }],
      },
      brandTemplate: true,
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json({ project });
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (actor.role === "viewer") {
    return NextResponse.json(
      { error: "Viewers have read-only access and cannot modify projects." },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));

  const existing = await prisma.clipProject.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: { clips: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  // If user submitted a new ClipAnything prompt on the project page, curate a new top clip
  if (typeof body.reCuratePrompt === "string" && body.reCuratePrompt.trim()) {
    const prompt = body.reCuratePrompt.trim();
    const extraClips = curateClipsForProject({
      projectTitle: existing.title,
      genre: existing.genre,
      customPrompt: prompt,
      videoUrl: existing.videoUrl,
      thumbnailUrl: existing.thumbnailUrl,
      durationMs: existing.durationMs,
    });

    const topMatch = extraClips[0];
    if (topMatch) {
      await prisma.exportableClip.create({
        data: {
          ...topMatch,
          projectId: existing.id,
          rank: existing.clips.length + 1,
          title: `[Prompt Match] ${ prompt.slice(0, 48) }`,
        },
      });
    }
  }

  const updated = await prisma.clipProject.update({
    where: { id: existing.id },
    data: {
      title: typeof body.title === "string" ? body.title.trim() : existing.title,
      isSaved: typeof body.isSaved === "boolean" ? body.isSaved : existing.isSaved,
      customPrompt:
        typeof body.reCuratePrompt === "string"
          ? body.reCuratePrompt.trim()
          : existing.customPrompt,
      brandTemplateId:
        typeof body.brandTemplateId === "string"
          ? body.brandTemplateId
          : existing.brandTemplateId,
    },
    include: {
      clips: {
        orderBy: [{ rank: "asc" }, { score: "desc" }],
      },
      brandTemplate: true,
    },
  });

  return NextResponse.json({ project: updated });
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (actor.role === "viewer") {
    return NextResponse.json(
      { error: "Viewers cannot delete projects." },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  const existing = await prisma.clipProject.findFirst({
    where: { OR: [{ id }, { slug: id }] },
  });

  if (!existing) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  await prisma.clipProject.delete({ where: { id: existing.id } });

  await writeAuditLog({
    action: "CLIP_PROJECT_DELETED",
    actorId: actor.id,
    actorEmail: actor.email,
    targetType: "ClipProject",
    targetId: existing.id,
    metadata: { title: existing.title },
  });

  return NextResponse.json({ ok: true });
}
