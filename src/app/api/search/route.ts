import { NextResponse } from "next/server";
import { getAuthenticatedActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim().toLowerCase() || "";
  const minScore = Number(searchParams.get("minScore") || 0);

  const allClips = await prisma.exportableClip.findMany({
    where: {
      score: { gte: minScore },
    },
    include: {
      project: {
        select: { id: true, slug: true, title: true, genre: true },
      },
    },
    orderBy: { score: "desc" },
    take: 60,
  });

  const filtered = q
    ? allClips.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.transcriptText.toLowerCase().includes(q) ||
          c.sceneAnalysisText.toLowerCase().includes(q) ||
          c.hashtags.toLowerCase().includes(q)
      )
    : allClips;

  return NextResponse.json({ clips: filtered });
}
