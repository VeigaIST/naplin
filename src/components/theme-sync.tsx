"use client";

import { useParticipant } from "@/components/participant-provider";
import { readThemeCookie, resolveDarkClass } from "@/lib/theme";
import type { ThemePreference } from "@/lib/types";
import { useEffect } from "react";

export function ThemeSync() {
  const { participant } = useParticipant();
  const pref: ThemePreference =
    participant?.themePreference ?? readThemeCookie() ?? "system";

  useEffect(() => {
    const apply = () => {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const dark = resolveDarkClass(pref, prefersDark);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (pref === "system") {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [pref]);

  return null;
}
