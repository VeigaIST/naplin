import {
  clearParticipantCookieOnResponse,
  clearThemeCookieOnResponse,
} from "@/lib/auth/cookies";
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearParticipantCookieOnResponse(res);
  clearThemeCookieOnResponse(res);
  return res;
}
