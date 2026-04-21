import { prisma } from "@/lib/prisma";
import { signParticipantToken } from "@/lib/auth/jwt";
import {
  setParticipantCookieOnResponse,
  setThemeCookieOnResponse,
} from "@/lib/auth/cookies";
import { normalizeParticipantCode } from "@/lib/participant-code";
import { parseThemePreference } from "@/lib/theme";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { code?: string; pin?: string };
    const code = body.code ? normalizeParticipantCode(body.code) : "";
    const pin = body.pin ?? "";
    if (!code) {
      return NextResponse.json({ error: "Código obrigatório." }, { status: 400 });
    }
    const p = await prisma.participant.findUnique({ where: { code } });
    if (!p || !p.active) {
      return NextResponse.json(
        { error: "Participante não encontrado ou inactivo." },
        { status: 401 }
      );
    }
    if (p.pinHash) {
      if (!pin || !bcrypt.compareSync(pin, p.pinHash)) {
        return NextResponse.json(
          { error: "PIN incorrecto." },
          { status: 401 }
        );
      }
    }
    const token = await signParticipantToken(p.id);
    const themePreference = parseThemePreference(p.themePreference);
    const res = NextResponse.json({
      ok: true,
      participant: {
        id: p.id,
        code: p.code,
        createdAt: p.createdAt.getTime(),
        themePreference,
      },
    });
    setParticipantCookieOnResponse(res, token);
    setThemeCookieOnResponse(res, themePreference);
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro no servidor." }, { status: 500 });
  }
}
