import { NextResponse } from "next/server";
import {
  AccountAdmissionError,
  getAccountAdmissionMode,
  registerDirectAccount,
} from "@/lib/account-admission";

export async function GET() {
  return NextResponse.json({
    admissionMode: getAccountAdmissionMode(),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const user = await registerDirectAccount({
      email: String(body.email || ""),
      name: String(body.name || ""),
      password: String(body.password || ""),
    });
    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
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
      { error: "Unable to complete registration.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
