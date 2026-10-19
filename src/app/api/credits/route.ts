import { NextResponse } from "next/server";
import { getAuthenticatedActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/account-admission";

export async function POST(req: Request) {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const addAmount = Math.max(10, Math.min(5000, Number(body.amount || 100)));
  const nextPlan = body.planName ? String(body.planName) : actor.planName;

  const updated = await prisma.user.update({
    where: { id: actor.id },
    data: {
      creditsBalance: { increment: addAmount },
      creditsTotal: { increment: addAmount },
      planName: nextPlan,
    },
    select: {
      id: true,
      creditsBalance: true,
      creditsTotal: true,
      planName: true,
    },
  });

  await writeAuditLog({
    action: "CREDITS_ADDED",
    actorId: actor.id,
    actorEmail: actor.email,
    targetType: "User",
    targetId: actor.id,
    metadata: {
      addedCredits: addAmount,
      newBalance: updated.creditsBalance,
      planName: updated.planName,
    },
  });

  return NextResponse.json({ user: updated });
}
