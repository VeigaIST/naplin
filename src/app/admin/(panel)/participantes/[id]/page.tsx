import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAdminUserId } from "@/lib/auth/server-session";
import { logKindLabel } from "@/lib/log-kind-label";
import { prisma } from "@/lib/prisma";
import type { AnyLog } from "@/lib/types";
import { CopyMagicLinkButton } from "./copy-magic-link";

export default async function AdminParticipantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const adminId = await getAdminUserId();
  if (!adminId) redirect("/admin/login");

  const { id } = await params;
  const p = await prisma.participant.findUnique({
    where: { id },
    include: {
      logs: { orderBy: { at: "desc" } },
    },
  });
  if (!p) notFound();

  const appBase =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3030";
  const magicLink = `${appBase}/p/${p.accessToken}`;

  return (
    <>
      <nav className="mb-6 text-sm">
        <Link href="/admin/participantes" className="naplin-link">
          ← Participantes
        </Link>
      </nav>

      <div className="naplin-card mb-6 p-4 text-sm">
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-ink-500 dark:text-night-400">
          Ligação directa (PWA)
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <p className="min-w-0 flex-1 break-all font-mono text-xs text-ink-800 dark:text-night-200">
            {magicLink}
          </p>
          <CopyMagicLinkButton url={magicLink} />
        </div>
        <p className="mt-2 text-xs text-ink-600 dark:text-night-300">
          {p.pinHash
            ? "Partilhe este URL com o participante; o PIN é pedido após abrir o link (ou em /entrar)."
            : "Partilhe este URL; a sessão pode abrir sem pedir PIN se este participante não tiver PIN definido."}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink-900 dark:text-white">{p.code}</h1>
          <p className="mt-2 text-xs text-ink-500 dark:text-night-400">
            Estado: {p.active ? "activo" : "inactivo"} · Criado em{" "}
            {p.createdAt.toLocaleString("pt-PT", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </p>
        </div>
        <a
          href={`/api/admin/participants/${p.id}/export`}
          className="naplin-btn-primary inline-flex shrink-0 items-center justify-center px-4 py-2.5 text-sm"
        >
          Descarregar Excel
        </a>
      </div>

      <h2 className="mt-10 text-sm font-bold text-ink-900 dark:text-white">
        Histórico ({p.logs.length})
      </h2>
      {p.logs.length === 0 ? (
        <p className="mt-4 text-sm text-ink-600 dark:text-night-300">
          Ainda não há registos sincronizados para este participante.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {p.logs.map((log) => (
            <li key={log.id} className="naplin-card p-4 text-sm">
              <AdminLogEntry log={log} participantCode={p.code} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function AdminLogEntry({
  log,
  participantCode,
}: {
  log: {
    id: string;
    kind: string;
    at: Date;
    createdAt: Date;
    payload: unknown;
  };
  participantCode: string;
}) {
  const payload = log.payload as AnyLog;
  const atIso =
    typeof payload.at === "string" ? payload.at : log.at.toISOString();
  const row = {
    ...payload,
    id: log.id,
    subjectId: payload.subjectId ?? "",
    kind: (payload.kind ?? log.kind) as AnyLog["kind"],
    at: atIso,
    createdAt: log.createdAt.toISOString(),
  } as AnyLog;

  const when = new Date(row.at);
  const label = logKindLabel(row.kind);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold text-ink-900 dark:text-white">{label}</p>
        <p className="text-xs tabular-nums text-ink-500 dark:text-night-400">
          {when.toLocaleString("pt-PT", {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </p>
      </div>
      <p className="mt-1 text-xs text-ink-600 dark:text-night-300">
        Participante: {participantCode}
      </p>
      {row.kind === "test_working_memory" ? (
        <p className="mt-2 text-xs text-ink-600">
          Precisão: {Math.round(row.data.accuracy * 100)}% · RT médio:{" "}
          {Math.round(row.data.meanReactionMs)} ms · Ensaios:{" "}
          {row.data.trials.length}
        </p>
      ) : null}
      {row.kind === "test_go_nogo" ? (
        <p className="mt-2 text-xs text-ink-600">
          Acertos P: {row.data.hits} · Falhas: {row.data.misses} · Falsos
          alarmes: {row.data.falseAlarms} · RT médio:{" "}
          {Math.round(row.data.meanReactionMs)} ms
        </p>
      ) : null}
    </div>
  );
}
