import { prisma } from "@/lib/prisma";
import { getParticipantId } from "@/lib/auth/server-session";
import type { AnyLog } from "@/lib/types";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import type { Prisma } from "@prisma/client";

export async function GET() {
  const participantId = await getParticipantId();
  if (!participantId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const rows = await prisma.log.findMany({
    where: { participantId },
    orderBy: { at: "desc" },
  });
  const logs: AnyLog[] = rows.map((r) => {
    const payload = r.payload as unknown as AnyLog;
    return {
      ...payload,
      id: r.id,
      subjectId: participantId,
      at:
        typeof payload.at === "string" ? payload.at : r.at.toISOString(),
      createdAt: r.createdAt.toISOString(),
    };
  });
  return NextResponse.json(logs);
}

export async function POST(req: Request) {
  const participantId = await getParticipantId();
  if (!participantId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  try {
    const body = (await req.json()) as AnyLog;
    if (!body?.kind || !body?.at) {
      return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
    }
    const id = randomUUID();
    const createdAt = body.createdAt ?? new Date().toISOString();
    const full = {
      ...body,
      id,
      subjectId: participantId,
      createdAt,
    };
    await prisma.log.create({
      data: {
        id,
        participantId,
        kind: body.kind,
        at: new Date(body.at),
        payload: JSON.parse(JSON.stringify(full)) as Prisma.InputJsonValue,
      },
    });
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao guardar." }, { status: 500 });
  }
}
