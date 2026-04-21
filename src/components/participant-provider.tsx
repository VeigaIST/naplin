"use client";

import type { Subject, ThemePreference } from "@/lib/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Ctx = {
  ready: boolean;
  participant: Subject | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  setThemePreference: (t: ThemePreference) => Promise<void>;
};

const ParticipantCtx = createContext<Ctx | null>(null);

export function ParticipantProvider({ children }: { children: React.ReactNode }) {
  const [participant, setParticipant] = useState<Subject | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/session/participant", {
        credentials: "include",
      });
      if (!r.ok) {
        setParticipant(null);
        return;
      }
      const j = (await r.json()) as Subject;
      setParticipant(j);
    } catch {
      setParticipant(null);
    }
  }, []);

  useEffect(() => {
    void refresh().finally(() => setReady(true));
  }, [refresh]);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/participant/logout", {
      method: "POST",
      credentials: "include",
    });
    setParticipant(null);
    window.location.href = "/entrar";
  }, []);

  const setThemePreference = useCallback(async (themePreference: ThemePreference) => {
    try {
      const r = await fetch("/api/session/participant", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ themePreference }),
      });
      if (!r.ok) return;
      const j = (await r.json()) as Subject;
      setParticipant(j);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      ready,
      participant,
      refresh,
      signOut,
      setThemePreference,
    }),
    [ready, participant, refresh, signOut, setThemePreference]
  );

  return (
    <ParticipantCtx.Provider value={value}>
      {children}
    </ParticipantCtx.Provider>
  );
}

export function useParticipant() {
  const ctx = useContext(ParticipantCtx);
  if (!ctx) {
    throw new Error("useParticipant must be used inside ParticipantProvider");
  }
  return ctx;
}
