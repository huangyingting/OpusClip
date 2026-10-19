import { NextResponse } from "next/server";
import { getAuthenticatedActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const accounts = await prisma.socialAccount.findMany({
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ accounts });
}

export async function POST(req: Request) {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (actor.role === "viewer") {
    return NextResponse.json(
      { error: "Viewers cannot manage social accounts." },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => ({}));

  if (body.id) {
    const existing = await prisma.socialAccount.findUnique({
      where: { id: String(body.id) },
    });
    if (!existing) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }
    const nextStatus =
      existing.status === "CONNECTED" ? "DISCONNECTED" : "CONNECTED";
    const updated = await prisma.socialAccount.update({
      where: { id: existing.id },
      data: { status: nextStatus },
    });
    return NextResponse.json({ account: updated });
  }

  const platform = String(body.platform || "tiktok").toLowerCase();
  const handle = String(body.handle || `@${platform}_studio`).trim();
  const displayName = String(body.displayName || `${platform.toUpperCase()} Channel`).trim();

  const created = await prisma.socialAccount.create({
    data: {
      platform,
      handle,
      displayName,
      status: "CONNECTED",
      followersCount: Number(body.followersCount || 15000),
      ownerId: actor.id,
    },
  });

  return NextResponse.json({ account: created }, { status: 201 });
}
