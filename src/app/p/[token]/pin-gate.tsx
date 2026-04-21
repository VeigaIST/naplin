"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PinGate({ accessToken }: { accessToken: string }) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/participant/from-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, pin }),
        credentials: "include",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Erro ao entrar.");
        return;
      }
      router.replace("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5">
      <h1 className="text-lg font-bold text-ink-900 dark:text-white">
        PIN do participante
      </h1>
      <p className="mt-2 text-sm text-ink-600 dark:text-night-300">
        Este acesso está protegido. Introduza o PIN que lhe foi comunicado pela
        equipa do estudo.
      </p>
      <form onSubmit={onSubmit} className="mt-6 naplin-card p-5">
        <label className="text-xs font-bold uppercase tracking-[0.1em] text-ink-500 dark:text-night-400">
          PIN
        </label>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="one-time-code"
          className="naplin-input mt-2"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
        {error ? (
          <p className="mt-2 text-sm text-red-700 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          className="naplin-btn-primary mt-5 w-full"
          disabled={loading || pin.length < 1}
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
