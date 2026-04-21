"use client";

import { NaplinLogo } from "@/components/logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Falha no login.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-5 pb-12 pt-[calc(2rem+var(--app-safe-top))]">
      <div className="mb-6 flex justify-center">
        <NaplinLogo size={40} />
      </div>
      <h1 className="text-center text-xl font-bold text-ink-900 dark:text-white">
        Administração naplin
      </h1>
      <p className="mt-2 text-center text-sm text-ink-600 dark:text-night-300">
        Acesso reservado à equipa do estudo.
      </p>
      <form onSubmit={onSubmit} className="mt-8 naplin-card p-6">
        <label className="text-xs font-bold uppercase tracking-[0.1em] text-ink-500 dark:text-night-400">
          Email
        </label>
        <input
          type="email"
          autoComplete="email"
          className="naplin-input mt-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-ink-500">
          Palavra-passe
        </label>
        <input
          type="password"
          autoComplete="current-password"
          className="naplin-input mt-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error ? (
          <p className="mt-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className="naplin-btn-primary mt-6 w-full" disabled={loading}>
          Entrar
        </button>
      </form>
      <p className="mt-8 text-center text-sm">
        <Link href="/entrar" className="naplin-link">
          Sou participante
        </Link>
      </p>
    </div>
  );
}
