import { cookies } from "next/headers";
import { verifyToken } from "./jwt";
import { cookieNames } from "./cookies";

export async function getAdminUserId(): Promise<string | null> {
  const raw = (await cookies()).get(cookieNames.admin)?.value;
  if (!raw) return null;
  const v = await verifyToken(raw);
  if (!v || v.role !== "admin") return null;
  return v.sub;
}

export async function getParticipantId(): Promise<string | null> {
  const raw = (await cookies()).get(cookieNames.participant)?.value;
  if (!raw) return null;
  const v = await verifyToken(raw);
  if (!v || v.role !== "participant") return null;
  return v.sub;
}
