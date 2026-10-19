import { NextResponse } from "next/server";
import { getAuthenticatedActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const posts = await prisma.scheduledPost.findMany({
    include: {
      clip: {
        select: { id: true, title: true, score: true, durationMs: true },
      },
      socialAccount: {
        select: { id: true, platform: true, handle: true, displayName: true },
      },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json({ posts });
}

export async function POST(req: Request) {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (actor.role === "viewer") {
    return NextResponse.json(
      { error: "Viewers cannot schedule social posts." },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const title = String(body.title || "Scheduled Short Clip").trim();
  const caption = String(body.caption || title).trim();
  const platform = String(body.platform || "tiktok").toLowerCase();
  const scheduledAt = body.scheduledAt
    ? new Date(String(body.scheduledAt))
    : new Date(Date.now() + 24 * 60 * 60 * 1000);
  const publishNow = body.publishNow === true;

  const post = await prisma.scheduledPost.create({
    data: {
      clipId: body.clipId ? String(body.clipId) : null,
      socialAccountId: body.socialAccountId ? String(body.socialAccountId) : null,
      platform,
      title,
      caption,
      hashtags: String(body.hashtags || "#opusclip #viralshorts"),
      videoUrl: String(body.videoUrl || "/videos/sample_podcast.mp4"),
      scheduledAt,
      status: publishNow ? "PUBLISHED" : "SCHEDULED",
      viewsCount: publishNow ? 1240 : 0,
      likesCount: publishNow ? 185 : 0,
      commentsCount: publishNow ? 24 : 0,
      sharesCount: publishNow ? 42 : 0,
      ownerId: actor.id,
    },
    include: {
      clip: {
        select: { id: true, title: true, score: true, durationMs: true },
      },
      socialAccount: {
        select: { id: true, platform: true, handle: true, displayName: true },
      },
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
