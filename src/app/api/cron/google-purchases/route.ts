import { type NextRequest, NextResponse } from "next/server";
import { matchesServerSecret } from "@/lib/server-secret";
import { getGooglePurchaseDestination } from "@/services/google-purchases";
import { retryGooglePurchases } from "@/services/google-purchase-delivery";

export const maxDuration = 60;
export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET || !getGooglePurchaseDestination())
    return NextResponse.json(
      { error: "Google purchase retry not configured" },
      { status: 503 },
    );
  if (
    !matchesServerSecret(
      request.headers.get("authorization"),
      `Bearer ${process.env.CRON_SECRET}`,
    )
  )
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await retryGooglePurchases();
  const healthy =
    !result.retry && !result.failed && !result.disabled && !result.workerErrors;
  return NextResponse.json(
    { ...result, healthy },
    { status: healthy ? 200 : 503 },
  );
}
