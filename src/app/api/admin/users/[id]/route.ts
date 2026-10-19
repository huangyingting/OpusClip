import { NextResponse } from "next/server";
import { getAuthenticatedActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeRole, writeAuditLog } from "@/lib/account-admission";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
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

  const { id } = await context.params;
  const body = await req.json().catch(() => ({}));

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const nextRole = body.role ? normalizeRole(String(body.role)) : target.role;
  const nextStatus =
    body.status === "DISABLED" || body.status === "ACTIVE"
      ? body.status
      : target.status;
  const nextCredits =
    typeof body.creditsBalance === "number"
      ? Math.max(0, Math.floor(body.creditsBalance))
      : target.creditsBalance;

  // Prevent admin from disabling or demoting themselves if they are the last active admin
  if (target.id === actor.id && (nextRole !== "admin" || nextStatus !== "ACTIVE")) {
    return NextResponse.json(
      { error: "You cannot demote or disable your own active administrator account." },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      role: nextRole,
      status: nextStatus,
      creditsBalance: nextCredits,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      creditsBalance: true,
      planName: true,
      createdAt: true,
    },
  });

  await writeAuditLog({
    action: "USER_ADMIN_UPDATED",
    actorId: actor.id,
    actorEmail: actor.email,
    targetType: "User",
    targetId: updated.id,
    metadata: {
      targetEmail: updated.email,
      previousRole: target.role,
      newRole: updated.role,
      previousStatus: target.status,
      newStatus: updated.status,
      creditsBalance: updated.creditsBalance,
    },
  });

  return NextResponse.json({ user: updated });
}
