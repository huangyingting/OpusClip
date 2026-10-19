import { NextResponse } from "next/server";
import { getAuthenticatedActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category")?.trim();

  const assets = await prisma.mediaAsset.findMany({
    where: category && category !== "all" ? { category } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ assets });
}

export async function POST(req: Request) {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (actor.role === "viewer") {
    return NextResponse.json(
      { error: "Viewers cannot create assets." },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const asset = await prisma.mediaAsset.create({
    data: {
      name: String(body.name || "Studio Media Asset").trim(),
      category: String(body.category || "b-roll"),
      fileUrl: String(body.fileUrl || "/videos/sample_podcast.mp4"),
      mimeType: String(body.mimeType || "video/mp4"),
      durationSec: Number(body.durationSec || 10.0),
      sizeBytes: Number(body.sizeBytes || 1048576),
      tags: String(body.tags || ""),
      ownerId: actor.id,
    },
  });

  return NextResponse.json({ asset }, { status: 201 });
}
