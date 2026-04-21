import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

const SKIP_AUTH = new Set([
  "/manifest.webmanifest",
  "/favicon.ico",
  "/icon",
  "/apple-icon",
]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static") ||
    SKIP_AUTH.has(pathname)
  ) {
    return NextResponse.next();
  }

  if (/\.(ico|png|svg|jpg|jpeg|gif|webp|json|webmanifest)$/.test(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (pathname === "/entrar" || pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/p/")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("naplin_admin")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    const v = await verifyToken(token);
    if (!v || v.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  const token = request.cookies.get("naplin_pt")?.value;
  if (!token) {
    const nextPath = `${pathname}${request.nextUrl.search || ""}`;
    const q = encodeURIComponent(nextPath || "/");
    return NextResponse.redirect(new URL(`/entrar?next=${q}`, request.url));
  }
  const v = await verifyToken(token);
  if (!v || v.role !== "participant") {
    const nextPath = `${pathname}${request.nextUrl.search || ""}`;
    return NextResponse.redirect(
      new URL(`/entrar?next=${encodeURIComponent(nextPath)}`, request.url)
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
