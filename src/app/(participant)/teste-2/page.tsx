"use client";

import { PageHeader } from "@/components/page-header";
import { RequireParticipant } from "@/components/require-participant";
import { useParticipant } from "@/components/participant-provider";
import { useRouter } from "next/navigation";
import { GoNoGoClient } from "./go-nogo-client";

export default function Teste2Page() {
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
        title="Teste 2 — Go / No-go"
        subtitle="Reaja a p, ignore b. Cerca de 1 minuto."
        backHref="/"
      />
      <div className="mx-auto max-w-lg px-4 pt-4">
        <GoNoGoClient
          subjectId={current.id}
          onDone={() => router.replace("/?ok=gn")}
        />
      </div>
    </div>
  );
}
