import { createHash, randomUUID } from "node:crypto";

export function hashEmail(email: string): string {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

export type MetaPurchaseInput = {
  email: string;
  transactionCode: string | null;
  value: number;
  currency: string;
  contentIds: string[];
  contentType: string;
  contentName?: string;
  eventSourceUrl: string;
  eventTime: Date;
};

export async function sendMetaPurchase(input: MetaPurchaseInput): Promise<void> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    console.warn("sendMetaPurchase: META_PIXEL_ID/META_CAPI_ACCESS_TOKEN not configured, skipping");
    return;
  }

  const event = {
    event_name: "Purchase",
    event_id: `grow-purchase-${input.transactionCode ?? randomUUID()}`,
    event_time: Math.floor(input.eventTime.getTime() / 1000),
    action_source: "website",
    event_source_url: input.eventSourceUrl,
    user_data: {
      em: [hashEmail(input.email)],
    },
    custom_data: {
      currency: input.currency,
      value: input.value,
      content_ids: input.contentIds,
      content_type: input.contentType,
      content_name: input.contentName,
      order_id: input.transactionCode,
    },
  };

  const testEventCode = process.env.META_TEST_EVENT_CODE;

  const url = new URL(`https://graph.facebook.com/v21.0/${pixelId}/events`);
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: [event],
      ...(testEventCode ? { test_event_code: testEventCode } : {}),
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });

  const json = await response.json();

  if (!response.ok || json.error) {
    throw new Error(`Meta CAPI Purchase failed: ${response.status} ${JSON.stringify(json)}`);
  }
}
