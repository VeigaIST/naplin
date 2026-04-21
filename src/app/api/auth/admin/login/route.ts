import { prisma } from "@/lib/prisma";
import { signAdminToken } from "@/lib/auth/jwt";
import { setAdminCookieOnResponse } from "@/lib/auth/cookies";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";
    if (!email) {
      return NextResponse.json({ error: "Email obrigatório." }, { status: 400 });
    }
    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin || !bcrypt.compareSync(password, admin.passwordHash)) {
      return NextResponse.json(
        { error: "Credenciais inválidas." },
        { status: 401 }
      );
    }
    const token = await signAdminToken(admin.id);
    const res = NextResponse.json({ ok: true });
    setAdminCookieOnResponse(res, token);
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro no servidor." }, { status: 500 });
  }
}
