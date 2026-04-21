"use client";

import { useParticipant } from "@/components/participant-provider";
import { useEffect, useState } from "react";

function IconSun({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function IconMoon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

/** Aspeto efectivo (inclui preferência "sistema" até ser alterada). */
function useEffectiveDarkMode(): boolean {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const read = () =>
      setDark(document.documentElement.classList.contains("dark"));
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);
  return dark;
}

export function ThemeToggle() {
  const { participant, ready, setThemePreference } = useParticipant();
  const isDark = useEffectiveDarkMode();

  if (!ready || !participant) {
    return null;
  }

  const title = isDark
    ? "Modo escuro activo. Clica para modo claro."
    : "Modo claro activo. Clica para modo escuro.";
  const ariaLabel = isDark
    ? "Modo escuro. Alterar para modo claro."
    : "Modo claro. Alterar para modo escuro.";

  return (
    <button
      type="button"
      onClick={() =>
        void setThemePreference(isDark ? "light" : "dark")
      }
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-ink-200/90 bg-white/90 text-ink-800 shadow-sm transition hover:bg-ink-50 active:scale-[0.98] dark:border-white/10 dark:bg-night-800/90 dark:text-night-100 dark:hover:bg-night-700"
      title={title}
      aria-label={ariaLabel}
    >
      {isDark ? <IconMoon /> : <IconSun />}
    </button>
  );
}
