"use client";

import { PageHeader } from "@/components/page-header";
import { RequireParticipant } from "@/components/require-participant";
import { useParticipant } from "@/components/participant-provider";
import { logKindLabel } from "@/lib/log-kind-label";
import type { AnyLog } from "@/lib/types";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function RegistosPage() {
  return (
    <RequireParticipant>
      <RegistosInner />
    </RequireParticipant>
  );
}

function RegistosInner() {
  const { participant } = useParticipant();
  const [logs, setLogs] = useState<AnyLog[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/logs", { credentials: "include" });
      if (!r.ok) {
        setLogs([]);
        return;
      }
      setLogs((await r.json()) as AnyLog[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className="mx-auto max-w-lg px-4 pb-10 pt-[var(--app-safe-top)]">
      <PageHeader
        title="Registos"
        subtitle={`Os seus registos como ${participant?.code ?? ""}.`}
        backHref="/"
      />

      {loading ? (
        <p className="mt-8 text-center text-sm text-ink-600 dark:text-night-300">
          A carregar…
        </p>
      ) : logs.length === 0 ? (
        <p className="mt-8 text-center text-sm text-ink-600 dark:text-night-300">
          Ainda não há registos.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {logs.map((row) => (
            <li key={row.id} className="naplin-card p-4 text-sm">
              <LogRow row={row} code={participant?.code ?? ""} />
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8 text-center text-sm text-ink-600 dark:text-night-300">
        Os dados são guardados de forma segura no servidor do estudo.
      </p>

      <p className="mt-4 text-center text-sm">
        <Link href="/" className="naplin-link">
          Voltar ao início
        </Link>
      </p>
    </div>
  );
}

function LogRow({ row, code }: { row: AnyLog; code: string }) {
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
        Participante: {code}
      </p>
      {row.kind === "test_working_memory" ? (
        <p className="mt-2 text-xs text-ink-600 dark:text-night-300">
          Precisão: {Math.round(row.data.accuracy * 100)}% · RT médio:{" "}
          {Math.round(row.data.meanReactionMs)} ms · Ensaios:{" "}
          {row.data.trials.length}
        </p>
      ) : null}
      {row.kind === "test_go_nogo" ? (
        <p className="mt-2 text-xs text-ink-600 dark:text-night-300">
          Acertos P: {row.data.hits} · Falhas: {row.data.misses} · Falsos
          alarmes: {row.data.falseAlarms} · RT médio:{" "}
          {Math.round(row.data.meanReactionMs)} ms
        </p>
      ) : null}
    </div>
  );
}

