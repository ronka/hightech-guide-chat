import { type NextRequest, NextResponse } from "next/server";
import { matchesServerSecret } from "@/lib/server-secret";
import { retryMetaPurchases } from "@/services/meta-purchase-delivery";
import { getMetaPurchaseDestination } from "@/services/meta-purchases";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET || !getMetaPurchaseDestination()) {
    return NextResponse.json(
      { error: "Purchase retry not configured" },
      { status: 503 },
    );
  }
  if (
    !matchesServerSecret(
      request.headers.get("authorization"),
      `Bearer ${process.env.CRON_SECRET}`,
    )
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await retryMetaPurchases();
  const healthy =
    result.retry === 0 &&
    result.expired === 0 &&
    result.disabled === 0 &&
    result.workerErrors === 0;
  return NextResponse.json(
    { ...result, healthy },
    { status: healthy ? 200 : 503 },
  );
}
