import { NextResponse } from "next/server";
import { getAuthenticatedActor } from "@/lib/auth";
import {
  AccountAdmissionError,
  revokeAccountInvitation,
} from "@/lib/account-admission";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (actor.role !== "admin") {
    return NextResponse.json(
      { error: "Only workspace administrators can revoke invitations." },
      { status: 403 }
    );
  }

  try {
    const { id } = await context.params;
    const invitation = await revokeAccountInvitation(id, {
      id: actor.id,
      email: actor.email,
    });

    return NextResponse.json({ invitation });
  } catch (err) {
    if (err instanceof AccountAdmissionError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.status }
      );
    }
    return NextResponse.json(
      { error: "Failed to revoke invitation.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
