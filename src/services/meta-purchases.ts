import { createHash, randomUUID } from "node:crypto";

export function hashEmail(email: string): string {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

export function hashPhone(phone: string, defaultCountryCode = "972"): string {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("0") ? `${defaultCountryCode}${digits.slice(1)}` : digits;
  return createHash("sha256").update(normalized).digest("hex");
}

function splitName(fullName: string): { firstName: string; lastName: string } | null {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;
  const [firstName, ...rest] = parts;
  return { firstName, lastName: rest.join(" ") };
}

export function hashName(name: string): string {
  return createHash("sha256").update(name.trim().toLowerCase()).digest("hex");
}

export type MetaPurchaseInput = {
  email: string;
  phone?: string;
  fullName?: string;
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

  const name = input.fullName ? splitName(input.fullName) : null;

  const event = {
    event_name: "Purchase",
    event_id: `grow-purchase-${input.transactionCode ?? randomUUID()}`,
    event_time: Math.floor(input.eventTime.getTime() / 1000),
    action_source: "website",
    event_source_url: input.eventSourceUrl,
    user_data: {
      em: [hashEmail(input.email)],
      ...(input.phone ? { ph: [hashPhone(input.phone)] } : {}),
      ...(name?.firstName ? { fn: [hashName(name.firstName)] } : {}),
      ...(name?.lastName ? { ln: [hashName(name.lastName)] } : {}),
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
