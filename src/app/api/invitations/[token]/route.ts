import { NextResponse } from "next/server";
import { inspectAccountInvitation } from "@/lib/account-admission";

export async function GET(
  _req: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  const inspection = await inspectAccountInvitation(token);
  if (inspection.status === "invalid") {
    return NextResponse.json({ invitation: inspection }, { status: 404 });
  }
  if (inspection.status !== "pending") {
    return NextResponse.json({ invitation: inspection }, { status: 410 });
  }
  return NextResponse.json({ invitation: inspection });
}
