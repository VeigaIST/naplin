"use client";

import { PageHeader } from "@/components/page-header";
import { RequireParticipant } from "@/components/require-participant";
import { useParticipant } from "@/components/participant-provider";
import { useRouter } from "next/navigation";
import { WorkingMemoryClient } from "./working-memory-client";

export default function Teste1Page() {
  return (
    <RequireParticipant>
      <Inner />
    </RequireParticipant>
  );
}

function Inner() {
  const { participant: current } = useParticipant();
  const router = useRouter();

  if (!current) return null;

  return (
    <div className="pb-10 pt-[var(--app-safe-top)]">
      <PageHeader
        title="Teste 1 — Memória de trabalho"
        subtitle="Cerca de 1 minuto. Memorize a sequência e responda à posição pedida."
        backHref="/"
      />
      <div className="mx-auto max-w-lg px-4 pt-4">
        <WorkingMemoryClient
          subjectId={current.id}
          onDone={() => router.replace("/?ok=wm")}
        />
      </div>
    </div>
  );
}
