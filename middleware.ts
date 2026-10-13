import { NextRequest, NextResponse } from "next/server";
import { COOKIE, sessionToken } from "@/lib/session";

export async function middleware(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE)?.value;
  if (cookie && cookie === (await sessionToken())) return NextResponse.next();

  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/login", req.url));
}

export const config = { matcher: ["/dashboard/:path*", "/api/links/:path*", "/api/links"] };
