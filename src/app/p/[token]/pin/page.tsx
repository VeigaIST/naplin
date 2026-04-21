import { PinGate } from "../pin-gate";

export const dynamic = "force-dynamic";

export default async function ParticipantPinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <PinGate accessToken={token} />;
}
