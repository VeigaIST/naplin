import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import {
  adminTokenCookie,
  participantTokenCookie,
  themePreferenceCookie,
} from "./cookie-options";
import { THEME_COOKIE } from "@/lib/theme-constants";
import type { ThemePreference } from "@/lib/types";

const ADMIN = "naplin_admin";
const PT = "naplin_pt";

export async function getAdminCookie(): Promise<string | undefined> {
  return (await cookies()).get(ADMIN)?.value;
}

export async function getParticipantCookie(): Promise<string | undefined> {
  return (await cookies()).get(PT)?.value;
}

export function setAdminCookieOnResponse(
  res: NextResponse,
  token: string
): void {
  res.cookies.set(ADMIN, token, adminTokenCookie);
}

export function setParticipantCookieOnResponse(
  res: NextResponse,
  token: string
): void {
  res.cookies.set(PT, token, participantTokenCookie);
}

export function clearAdminCookieOnResponse(res: NextResponse): void {
  res.cookies.set(ADMIN, "", { path: "/", maxAge: 0 });
}

export function clearParticipantCookieOnResponse(res: NextResponse): void {
  res.cookies.set(PT, "", { path: "/", maxAge: 0 });
}

export function setThemeCookieOnResponse(
  res: NextResponse,
  preference: ThemePreference
): void {
  res.cookies.set(THEME_COOKIE, preference, themePreferenceCookie);
}

export function clearThemeCookieOnResponse(res: NextResponse): void {
  res.cookies.set(THEME_COOKIE, "", { path: "/", maxAge: 0 });
}

export const cookieNames = { admin: ADMIN, participant: PT } as const;
