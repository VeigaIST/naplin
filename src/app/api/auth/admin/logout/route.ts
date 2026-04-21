import { clearAdminCookieOnResponse } from "@/lib/auth/cookies";
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearAdminCookieOnResponse(res);
  return res;
}
