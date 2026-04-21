import { SignJWT, jwtVerify } from "jose";
import { getAuthSecretBytes } from "./secret";

export type Role = "admin" | "participant";

export async function signAdminToken(adminUserId: string): Promise<string> {
  const secret = getAuthSecretBytes();
  return new SignJWT({ role: "admin" as const })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminUserId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function signParticipantToken(participantId: string): Promise<string> {
  const secret = getAuthSecretBytes();
  return new SignJWT({ role: "participant" as const })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(participantId)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifyToken(
  token: string
): Promise<{ role: Role; sub: string } | null> {
  try {
    const secret = getAuthSecretBytes();
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role;
    const sub = payload.sub;
    if ((role !== "admin" && role !== "participant") || typeof sub !== "string") {
      return null;
    }
    return { role, sub };
  } catch {
    return null;
  }
}
