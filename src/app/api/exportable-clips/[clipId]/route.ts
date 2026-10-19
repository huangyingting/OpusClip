import { NextResponse } from "next/server";
import { getAuthenticatedActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildWordsFromTranscript } from "@/lib/ai/clip-engine";

export async function GET(
  _req: Request,
  context: { params: Promise<{ clipId: string }> }
) {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { clipId } = await context.params;
  const clip = await prisma.exportableClip.findUnique({
    where: { id: clipId },
    include: {
      project: {
        include: {
          brandTemplate: true,
          clips: {
            select: {
              id: true,
              rank: true,
              title: true,
              score: true,
              durationMs: true,
            },
            orderBy: { rank: "asc" },
          },
        },
      },
    },
  });

  if (!clip) {
    return NextResponse.json({ error: "Clip not found." }, { status: 404 });
  }

  return NextResponse.json({ clip });
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ clipId: string }> }
) {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (actor.role === "viewer") {
    return NextResponse.json(
      { error: "Viewers have read-only access and cannot edit clips." },
      { status: 403 }
    );
  }

  const { clipId } = await context.params;
  const body = await req.json().catch(() => ({}));

  const existing = await prisma.exportableClip.findUnique({
    where: { id: clipId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Clip not found." }, { status: 404 });
  }

  if (body.action === "duplicate") {
    const siblingCount = await prisma.exportableClip.count({
      where: { projectId: existing.projectId },
    });
    const duplicate = await prisma.exportableClip.create({
      data: {
        projectId: existing.projectId,
        rank: siblingCount + 1,
        title: `${existing.title} (Copy)`,
        description: existing.description,
        hashtags: existing.hashtags,
        score: existing.score,
        hookGrade: existing.hookGrade,
        flowGrade: existing.flowGrade,
        valueGrade: existing.valueGrade,
        trendGrade: existing.trendGrade,
        judgeResultJson: existing.judgeResultJson,
        startMs: existing.startMs,
        endMs: existing.endMs,
        durationMs: existing.durationMs,
        videoUrl: existing.videoUrl,
        thumbnailUrl: existing.thumbnailUrl,
        transcriptText: existing.transcriptText,
        sceneAnalysisText: existing.sceneAnalysisText,
        screenplayJson: existing.screenplayJson,
        renderPrefOverrideJson: existing.renderPrefOverrideJson,
      },
    });
    return NextResponse.json({ clip: duplicate }, { status: 201 });
  }

  const nextStartMs =
    typeof body.startMs === "number" ? Math.max(0, body.startMs) : existing.startMs;
  const nextEndMs =
    typeof body.endMs === "number"
      ? Math.max(nextStartMs + 1000, body.endMs)
      : existing.endMs;
  const nextDurationMs =
    typeof body.startMs === "number" || typeof body.endMs === "number"
      ? nextEndMs - nextStartMs
      : existing.durationMs;

  let nextScreenplayJson = existing.screenplayJson;
  const nextTranscriptText =
    typeof body.transcriptText === "string"
      ? body.transcriptText.trim()
      : existing.transcriptText;

  if (typeof body.transcriptText === "string") {
    const durationSec = Math.max(5, Math.round(nextDurationMs / 1000));
    const words = buildWordsFromTranscript(nextTranscriptText, durationSec);
    nextScreenplayJson = JSON.stringify({
      chapters: [
        {
          id: "chap_edited",
          title: body.title || existing.title,
          lines: [
            {
              id: "vis_edited",
              type: "visual",
              text: existing.sceneAnalysisText,
              tr: [0, durationSec],
            },
            {
              id: "verb_edited",
              type: "verbal",
              speaker: "Speaker 1",
              text: nextTranscriptText,
              tr: [0, durationSec],
              words,
            },
          ],
        },
      ],
    });
  }

  const updated = await prisma.exportableClip.update({
    where: { id: clipId },
    data: {
      title: typeof body.title === "string" ? body.title.trim() : existing.title,
      transcriptText: nextTranscriptText,
      sceneAnalysisText:
        typeof body.sceneAnalysisText === "string"
          ? body.sceneAnalysisText.trim()
          : existing.sceneAnalysisText,
      startMs: nextStartMs,
      endMs: nextEndMs,
      durationMs: nextDurationMs,
      screenplayJson: nextScreenplayJson,
      isFavorite:
        typeof body.isFavorite === "boolean" ? body.isFavorite : existing.isFavorite,
      feedbackRating:
        body.feedbackRating !== undefined
          ? body.feedbackRating
          : existing.feedbackRating,
      renderPrefOverrideJson:
        body.renderPrefOverride !== undefined
          ? JSON.stringify(body.renderPrefOverride)
          : existing.renderPrefOverrideJson,
    },
  });

  return NextResponse.json({ clip: updated });
}
