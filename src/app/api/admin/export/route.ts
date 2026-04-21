import { prisma } from "@/lib/prisma";
import { getAdminUserId } from "@/lib/auth/server-session";
import { NextResponse } from "next/server";

export async function GET() {
  const adminId = await getAdminUserId();
  if (!adminId) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const participants = await prisma.participant.findMany({
    include: {
      logs: { orderBy: { at: "desc" } },
    },
  });
  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    participants: participants.map((p) => ({
      id: p.id,
      code: p.code,
      accessToken: p.accessToken,
      active: p.active,
      createdAt: p.createdAt.toISOString(),
      logs: p.logs.map((l) => ({
        id: l.id,
        kind: l.kind,
        at: l.at.toISOString(),
        createdAt: l.createdAt.toISOString(),
        payload: l.payload,
      })),
    })),
  });
}
