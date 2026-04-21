import { prisma } from "@/lib/prisma";
import { signParticipantToken } from "@/lib/auth/jwt";
import { participantTokenCookie } from "@/lib/auth/cookie-options";
import { cookieNames } from "@/lib/auth/cookies";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { PinGate } from "./pin-gate";

export const dynamic = "force-dynamic";

export default async function ParticipantLinkPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const p = await prisma.participant.findUnique({
    where: { accessToken: token },
  });
  if (!p || !p.active) notFound();

  if (p.pinHash) {
    return <PinGate accessToken={token} />;
  }

  const jwt = await signParticipantToken(p.id);
  (await cookies()).set(cookieNames.participant, jwt, participantTokenCookie);
  redirect("/");
}
