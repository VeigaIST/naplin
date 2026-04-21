import { getAdminUserId } from "@/lib/auth/server-session";
import { logKindLabel } from "@/lib/log-kind-label";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

type Ctx = { params: Promise<{ id: string }> };

function safeFilenameSegment(s: string): string {
  const t = s.trim().replace(/[^a-zA-Z0-9._-]+/g, "_");
  return t.length > 0 ? t : "participante";
}

export async function GET(_req: Request, ctx: Ctx) {
  const adminId = await getAdminUserId();
  if (!adminId) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const { id } = await ctx.params;
  const p = await prisma.participant.findUnique({
    where: { id },
    include: {
      logs: { orderBy: { at: "asc" } },
    },
  });
  if (!p) {
    return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  }

  const rows = p.logs.map((l) => ({
    Participante: p.code,
    "Tipo de registo": logKindLabel(l.kind),
    "Data/hora (evento)": l.at.toISOString(),
    "Registado no servidor": l.createdAt.toISOString(),
    "ID do registo": l.id,
    "Dados (JSON)": JSON.stringify(l.payload),
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Histórico");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

  const slug = safeFilenameSegment(p.code);
  const date = new Date().toISOString().slice(0, 10);
  const filename = `naplin-${slug}-${date}.xlsx`;

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
