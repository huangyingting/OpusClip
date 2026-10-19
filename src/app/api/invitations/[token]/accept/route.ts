import { NextResponse } from "next/server";
import {
  AccountAdmissionError,
  acceptAccountInvitation,
} from "@/lib/account-admission";

export async function POST(
  req: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    const body = await req.json().catch(() => ({}));
    const result = await acceptAccountInvitation({
      token,
      name: String(body.name || ""),
      password: String(body.password || ""),
      email: body.email ? String(body.email) : undefined,
    });

    return NextResponse.json(
      {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
        },
        invitationId: result.invitationId,
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
      { error: "Unable to accept invitation.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
