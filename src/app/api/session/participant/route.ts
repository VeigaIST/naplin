import { prisma } from "@/lib/prisma";
import { getParticipantId } from "@/lib/auth/server-session";
import { setThemeCookieOnResponse } from "@/lib/auth/cookies";
import { THEME_COOKIE } from "@/lib/theme-constants";
import { parseThemePreference } from "@/lib/theme";
import type { ThemePreference } from "@/lib/types";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function subjectJson(p: {
  id: string;
  code: string;
  createdAt: Date;
  themePreference: string;
}) {
  const themePreference = parseThemePreference(p.themePreference);
  return {
    id: p.id,
    code: p.code,
    createdAt: p.createdAt.getTime(),
    themePreference,
  };
}

export async function GET() {
  const id = await getParticipantId();
  if (!id) {
    return NextResponse.json(null, { status: 401 });
  }
  const p = await prisma.participant.findUnique({ where: { id } });
  if (!p || !p.active) {
    return NextResponse.json(null, { status: 401 });
  }
  const body = subjectJson(p);
  const res = NextResponse.json(body);
  const cookieVal = (await cookies()).get(THEME_COOKIE)?.value;
  if (cookieVal !== body.themePreference) {
    setThemeCookieOnResponse(res, body.themePreference);
  }
  return res;
}

export async function PATCH(req: Request) {
  const id = await getParticipantId();
  if (!id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  let body: { themePreference?: unknown };
  try {
    body = (await req.json()) as { themePreference?: unknown };
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }
  const themePreference = parseThemePreference(body.themePreference) as ThemePreference;
  const p = await prisma.participant.update({
    where: { id },
    data: { themePreference },
  });
  const res = NextResponse.json(subjectJson(p));
  setThemeCookieOnResponse(res, themePreference);
  return res;
}
