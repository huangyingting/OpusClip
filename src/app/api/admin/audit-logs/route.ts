import { NextResponse } from "next/server";
import { getAuthenticatedActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (actor.role !== "admin") {
    return NextResponse.json(
      { error: "Administrator access required." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const actionFilter = searchParams.get("action")?.trim() || undefined;
  const limit = Math.min(200, Math.max(10, Number(searchParams.get("limit") || 100)));

  const logs = await prisma.auditLog.findMany({
    where: actionFilter ? { action: actionFilter } : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ logs });
}
