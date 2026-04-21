import { prisma } from "@/lib/prisma";
import { getAdminUserId } from "@/lib/auth/server-session";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const adminId = await getAdminUserId();
  if (!adminId) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const { id } = await ctx.params;
  const p = await prisma.participant.findUnique({
    where: { id },
    include: {
      logs: { orderBy: { at: "desc" } },
    },
  });
  if (!p) {
    return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  }
  return NextResponse.json({
    id: p.id,
    code: p.code,
    active: p.active,
    createdAt: p.createdAt.toISOString(),
    accessToken: p.accessToken,
    logs: p.logs.map((l) => ({
      id: l.id,
      kind: l.kind,
      at: l.at.toISOString(),
      createdAt: l.createdAt.toISOString(),
      payload: l.payload,
    })),
  });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const adminId = await getAdminUserId();
  if (!adminId) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    const body = (await req.json()) as {
      active?: boolean;
      regenerateToken?: boolean;
      pin?: string | null;
    };
    const data: {
      active?: boolean;
      accessToken?: string;
      pinHash?: string | null;
    } = {};
    if (typeof body.active === "boolean") data.active = body.active;
    if (body.regenerateToken) data.accessToken = randomBytes(24).toString("hex");
    if (body.pin === null || body.pin === "") {
      data.pinHash = null;
    } else if (typeof body.pin === "string" && body.pin.length > 0) {
      data.pinHash = bcrypt.hashSync(body.pin, 12);
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nada a actualizar." }, { status: 400 });
    }

    const p = await prisma.participant.update({
      where: { id },
      data,
    });
    return NextResponse.json({
      id: p.id,
      code: p.code,
      accessToken: p.accessToken,
      active: p.active,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao actualizar." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const adminId = await getAdminUserId();
  if (!adminId) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    await prisma.participant.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao apagar." }, { status: 500 });
  }
}
