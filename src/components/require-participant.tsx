"use client";

import { useParticipant } from "@/components/participant-provider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Garante sessão de participante (após middleware). Se a API não devolver perfil,
 * redirecciona para /entrar.
 */
export function RequireParticipant({ children }: { children: React.ReactNode }) {
  const { ready, participant, refresh } = useParticipant();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (participant) return;
    router.replace(`/entrar?next=${encodeURIComponent(pathname)}`);
  }, [ready, participant, router, pathname]);

  useEffect(() => {
    if (typeof document === "undefined" || !document.visibilityState) return;
    const onVis = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [refresh]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-ink-600">A carregar…</p>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-ink-600">A redirecionar…</p>
      </div>
    );
  }

  return <>{children}</>;
}
