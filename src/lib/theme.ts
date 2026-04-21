import { THEME_COOKIE } from "@/lib/theme-constants";
import type { ThemePreference } from "@/lib/types";

const VALID = new Set<ThemePreference>(["light", "dark", "system"]);

export function parseThemePreference(v: unknown): ThemePreference {
  if (typeof v === "string" && VALID.has(v as ThemePreference)) {
    return v as ThemePreference;
  }
  return "system";
}

/** Client-only: read `naplin_theme` from `document.cookie`. */
export function readThemeCookie(): ThemePreference | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(
    new RegExp(`(?:^|; )${THEME_COOKIE}=([^;]*)`)
  );
  if (!m?.[1]) return null;
  return parseThemePreference(decodeURIComponent(m[1]));
}

/** Resolved appearance for applying the `dark` class on `<html>`. */
export function resolveDarkClass(
  preference: ThemePreference,
  prefersDark: boolean
): boolean {
  if (preference === "dark") return true;
  if (preference === "light") return false;
  return prefersDark;
}
