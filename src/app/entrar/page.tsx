"use client";

import { NaplinLogo } from "@/components/logo";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function EntrarForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/participant/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, pin: pin || undefined }),
        credentials: "include",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Não foi possível entrar.");
        return;
      }
      router.replace(next.startsWith("/") ? next : "/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-5 pb-12 pt-[calc(2rem+var(--app-safe-top))]">
      <div className="mb-8 flex justify-center">
        <NaplinLogo size={40} />
      </div>
      <h1 className="text-center text-xl font-bold text-ink-900 dark:text-white">
        Entrar como participante
      </h1>
      <p className="mt-2 text-center text-sm text-ink-600 dark:text-night-300">
        Use o código que lhe foi atribuído. Se tiver PIN, introduza-o também.
      </p>
      <form onSubmit={onSubmit} className="mt-8 naplin-card p-6">
        <label className="text-xs font-bold uppercase tracking-[0.1em] text-ink-500 dark:text-night-400">
          Código
        </label>
        <input
          className="naplin-input mt-2"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoCapitalize="characters"
          autoComplete="username"
          required
        />
        <label className="mt-4 block text-xs font-bold uppercase tracking-[0.1em] text-ink-500 dark:text-night-400">
          PIN (se aplicável)
        </label>
        <input
          type="password"
          inputMode="numeric"
          className="naplin-input mt-2"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          autoComplete="current-password"
        />
        {error ? (
          <p className="mt-3 text-sm text-red-700 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          className="naplin-btn-primary mt-6 w-full"
          disabled={loading || code.trim().length < 2}
        >
          Entrar
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-ink-600 dark:text-night-300">
        Recebeu um link do estudo? Abra-o directamente — a sessão inicia
        automaticamente (PIN pode ser pedido).
      </p>
      <p className="mt-4 text-center text-xs text-ink-500 dark:text-night-400">
        Equipa:{" "}
        <Link href="/admin/login" className="naplin-link">
          área de administração
        </Link>
      </p>
    </div>
  );
}

export default function EntrarPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-ink-600 dark:text-night-300">
          A carregar…
        </div>
      }
    >
      <EntrarForm />
    </Suspense>
  );
}
