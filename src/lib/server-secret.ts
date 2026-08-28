import { createHash, timingSafeEqual } from "node:crypto";

export function matchesServerSecret(
  provided: string | null,
  expected: string | undefined,
) {
  if (!provided || !expected) return false;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(provided), digest(expected));
}
