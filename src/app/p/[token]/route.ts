import { prisma } from "@/lib/prisma";
import { signParticipantToken } from "@/lib/auth/jwt";
import { participantTokenCookie } from "@/lib/auth/cookie-options";
import { cookieNames } from "@/lib/auth/cookies";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";

/**
 * Magic links must set the session cookie in a Route Handler — `cookies().set()` in a
 * Server Component page throws in production (cookies are mutable only in handlers/actions).
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  const p = await prisma.participant.findUnique({
    where: { accessToken: token },
  });
  if (!p || !p.active) notFound();

  if (p.pinHash) {
    const pinUrl = new URL(`/p/${encodeURIComponent(token)}/pin`, request.url);
    return NextResponse.redirect(pinUrl);
  }

  const jwt = await signParticipantToken(p.id);
  const res = NextResponse.redirect(new URL("/", request.url));
  res.cookies.set(cookieNames.participant, jwt, participantTokenCookie);
  return res;
}
