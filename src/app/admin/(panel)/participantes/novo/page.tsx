"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

function CopyPinButton({ pin }: { pin: string }) {
  const [label, setLabel] = useState("Copiar PIN");

  const copy = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(pin);
      } else {
        const ta = document.createElement("textarea");
        ta.value = pin;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setLabel("Copiado");
      window.setTimeout(() => setLabel("Copiar PIN"), 2000);
    } catch {
      setLabel("Erro ao copiar");
      window.setTimeout(() => setLabel("Copiar PIN"), 2500);
    }
  }, [pin]);

  return (
    <button
      type="button"
      onClick={() => void copy()}
      aria-label="Copiar PIN para a área de transferência"
      className="naplin-btn-secondary inline-flex shrink-0 items-center justify-center px-4 py-2.5 text-sm"
    >
      {label}
    </button>
  );
}

export default function NovoParticipantePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{
    id: string;
    code: string;
    initialPin: string;
  } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        credentials: "include",
      });
      const data = (await res.json()) as {
        error?: string;
        id?: string;
        code?: string;
        initialPin?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Erro ao criar");
        return;
      }
      if (data.id && data.initialPin && data.code) {
        setCreated({
          id: data.id,
          code: data.code,
          initialPin: data.initialPin,
        });
        router.refresh();
        return;
      }
      setError("Resposta inesperada do servidor.");
    } finally {
      setLoading(false);
    }
  }

  if (created) {
    return (
      <div>
        <nav className="mb-6 text-sm">
          <Link href="/admin/participantes" className="text-brand-700">
            ← Participantes
          </Link>
        </nav>
        <h1 className="text-xl font-bold text-ink-900 dark:text-white">
          Participante criado
        </h1>
        <p className="mt-2 text-sm text-amber-800 dark:text-amber-200/90">
          Guarde o PIN agora — não voltamos a mostrá-lo na aplicação (apenas o hash
          fica na base de dados).
        </p>
        <div className="mt-8 naplin-card p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-500">
            Código do participante
          </p>
          <p className="mt-2 font-mono text-base font-semibold text-ink-900 dark:text-white">
            {created.code}
          </p>
          <p className="mt-6 text-xs font-bold uppercase tracking-wide text-ink-500">
            PIN inicial
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <p className="font-mono text-xl font-semibold tracking-[0.2em] text-ink-900 dark:text-white">
              {created.initialPin}
            </p>
            <CopyPinButton pin={created.initialPin} />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/admin/participantes/${created.id}`}
              className="naplin-btn-primary inline-flex items-center justify-center px-4 py-2.5 text-sm"
            >
              Ver ficha e ligação directa
            </Link>
            <button
              type="button"
              className="naplin-btn-secondary inline-flex items-center justify-center px-4 py-2.5 text-sm"
              onClick={() => setCreated(null)}
            >
              Criar outro
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <nav className="mb-6 text-sm">
        <Link href="/admin/participantes" className="text-brand-700">
          ← Participantes
        </Link>
      </nav>
      <h1 className="text-xl font-bold text-ink-900 dark:text-white">Novo participante</h1>
      <p className="mt-2 text-sm text-ink-600">
        São gerados automaticamente um <strong>código</strong> único e um{" "}
        <strong>PIN inicial de 6 dígitos</strong>. O PIN será mostrado uma vez após
        criar — guarde-o para partilhar com o participante (entradas em{" "}
        <strong>/entrar</strong> ou ligação directa).
      </p>
      <form onSubmit={onSubmit} className="mt-8 naplin-card p-5">
        {error ? (
          <p className="mb-4 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          className="naplin-btn-primary w-full sm:w-auto"
          disabled={loading}
        >
          {loading ? "A criar…" : "Criar participante"}
        </button>
      </form>
    </div>
  );
}
