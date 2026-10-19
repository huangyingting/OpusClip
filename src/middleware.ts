import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret:
      process.env.NEXTAUTH_SECRET ||
      "opusclip-enterprise-studio-secret-key-2026-dev",
  });

  if (!token) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/brand-templates-ux/:path*",
    "/auto-post/:path*",
    "/post/:path*",
    "/analytics/:path*",
    "/collections/:path*",
    "/search/:path*",
    "/subscription/:path*",
    "/admin/:path*",
  ],
};
