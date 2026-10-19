import { NextResponse } from "next/server";
import { getAuthenticatedActor } from "@/lib/auth";
import {
  AccountAdmissionError,
  createAccountInvitation,
  listAccountInvitations,
} from "@/lib/account-admission";

export async function GET() {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (actor.role !== "admin") {
    return NextResponse.json(
      { error: "Only workspace administrators can view invitations." },
      { status: 403 }
    );
  }

  const invitations = await listAccountInvitations();
  return NextResponse.json({ invitations });
}

export async function POST(req: Request) {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (actor.role !== "admin") {
    return NextResponse.json(
      { error: "Only workspace administrators can issue invitations." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const grant = await createAccountInvitation({
      email: String(body.email || ""),
      role: body.role ? String(body.role) : "creator",
      expiresInDays: body.expiresInDays ? Number(body.expiresInDays) : 7,
      invitedByUserId: actor.id,
      invitedByEmail: actor.email,
    });

    const origin = new URL(req.url).origin;
    return NextResponse.json(
      {
        invitation: {
          id: grant.invitation.id,
          email: grant.invitation.email,
          role: grant.invitation.role,
          status: grant.invitation.status,
          expiresAt: grant.invitation.expiresAt,
          createdAt: grant.invitation.createdAt,
        },
        token: grant.token,
        acceptPath: grant.acceptPath,
        acceptUrl: `${origin}${grant.acceptPath}`,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof AccountAdmissionError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.status }
      );
    }
    return NextResponse.json(
      { error: "Failed to create invitation.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
