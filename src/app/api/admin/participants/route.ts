import { prisma } from "@/lib/prisma";
import { getAdminUserId } from "@/lib/auth/server-session";
import { normalizeParticipantCode } from "@/lib/participant-code";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

const CODE_ALPHABET = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function randomParticipantCode(): string {
  const buf = randomBytes(6);
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += CODE_ALPHABET[buf[i]! % CODE_ALPHABET.length]!;
  }
  return normalizeParticipantCode(`NP-${suffix}`);
}

/** 6 dígitos — útil para memorizar e introduzir em /entrar ou no pedido de PIN. */
function randomInitialPin(): string {
  const buf = randomBytes(6);
  let s = "";
  for (let i = 0; i < 6; i++) {
    s += String(buf[i]! % 10);
  }
  return s;
}

export async function GET() {
  const adminId = await getAdminUserId();
  if (!adminId) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const list = await prisma.participant.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      accessToken: true,
      active: true,
      createdAt: true,
      _count: { select: { logs: true } },
    },
  });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const adminId = await getAdminUserId();
  if (!adminId) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  try {
    let p: Awaited<ReturnType<typeof prisma.participant.create>> | null = null;
    let initialPin: string | null = null;

    for (let attempt = 0; attempt < 40; attempt++) {
      const code = randomParticipantCode();
      const accessToken = randomBytes(24).toString("hex");
      const pinPlain = randomInitialPin();
      const pinHash = bcrypt.hashSync(pinPlain, 12);
      try {
        p = await prisma.participant.create({
          data: {
            code,
            name: null,
            accessToken,
            pinHash,
          },
        });
        initialPin = pinPlain;
        break;
      } catch (err: unknown) {
        const duplicate =
          err &&
          typeof err === "object" &&
          "code" in err &&
          (err as { code?: string }).code === "P2002";
        if (duplicate) continue;
        throw err;
      }
    }
    if (!p || !initialPin) {
      return NextResponse.json(
        { error: "Não foi possível gerar um código único." },
        { status: 500 }
      );
    }
    return NextResponse.json({
      id: p.id,
      code: p.code,
      accessToken: p.accessToken,
      active: p.active,
      createdAt: p.createdAt.toISOString(),
      initialPin,
    });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao criar." }, { status: 500 });
  }
}
