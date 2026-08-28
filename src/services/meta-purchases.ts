import { createHash } from "node:crypto";
import { FB_PIXEL_ID, PRODUCTION_FB_ID } from "./analytics-config";
import { PurchaseDeliveryError, serverDeliveryMode } from "./purchase-delivery";

export type MetaPurchaseDestination = {
  pixelId: string;
  mode: "production" | "test";
};

export function getMetaPurchaseDestination(): MetaPurchaseDestination | null {
  const mode = serverDeliveryMode("meta");
  const pixelId = process.env.META_PIXEL_ID;
  if (
    !mode ||
    !pixelId ||
    !/^\d+$/.test(pixelId) ||
    !process.env.META_CAPI_ACCESS_TOKEN ||
    (mode === "production" && pixelId !== FB_PIXEL_ID) ||
    (mode === "test" &&
      (pixelId === PRODUCTION_FB_ID || !process.env.META_TEST_EVENT_CODE))
  )
    return null;
  return { pixelId, mode };
}

export type MetaPurchaseEvent = {
  event_name: "Purchase";
  event_id: string;
  event_time: number;
  action_source: "website";
  event_source_url: string;
  user_data: { em: string[] };
  custom_data: {
    currency: "ILS";
    value: number;
    order_id: string;
    content_type: "product";
    content_ids: string[];
    contents: { id: string; quantity: number }[];
    num_items: number;
  };
};

export function hashEmail(email: string) {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

export async function sendMetaPurchase(
  event: MetaPurchaseEvent,
  testEventCode: string | null,
  destination: MetaPurchaseDestination,
) {
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  const configured = getMetaPurchaseDestination();
  if (
    !token ||
    !configured ||
    configured.mode !== destination.mode ||
    configured.pixelId !== destination.pixelId ||
    (destination.mode === "test" && !testEventCode) ||
    (destination.mode === "production" && testEventCode)
  )
    throw new PurchaseDeliveryError("meta", "configuration");

  // Server-only API. Never use the browser track() helper or also send to Google:
  // Grow already owns Google purchase reporting. Do not log request/response bodies.
  const response = await fetch(
    `https://graph.facebook.com/v26.0/${destination.pixelId}/events`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: [event],
        ...(testEventCode ? { test_event_code: testEventCode } : {}),
      }),
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    },
  ).catch(() => {
    throw new PurchaseDeliveryError("meta", "network");
  });
  const result: unknown = await response.json().catch(() => null);
  if (
    !response.ok ||
    !result ||
    typeof result !== "object" ||
    !("events_received" in result) ||
    result.events_received !== 1 ||
    "error" in result
  ) {
    const code =
      result &&
      typeof result === "object" &&
      "error" in result &&
      result.error &&
      typeof result.error === "object" &&
      "code" in result.error &&
      typeof result.error.code === "number" &&
      Number.isSafeInteger(result.error.code)
        ? result.error.code
        : undefined;
    throw new PurchaseDeliveryError("meta", "rejected", response.status, code);
  }
}
