export function getAuthSecretBytes(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "AUTH_SECRET missing or too short (min 32 characters). Set it in .env"
    );
  }
  return new TextEncoder().encode(s);
}
