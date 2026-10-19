import { NextResponse } from "next/server";
import { getAuthenticatedActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
      { error: "Viewers cannot delete scheduled posts." },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  await prisma.scheduledPost.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
