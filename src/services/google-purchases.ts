import { z } from "zod";
import { GA_MEASUREMENT_ID, PRODUCTION_GA_ID } from "./analytics-config";
import { PurchaseDeliveryError, serverDeliveryMode } from "./purchase-delivery";

const cents = z.number().int().nonnegative().max(100_000_000);
const inputSchema = z
  .object({
    transactionId: z.string().trim().min(1).max(100),
    // Must be obtained from the actual browser, never generated on the webhook.
    clientId: z.string().regex(/^\d+\.\d+$/),
    sessionId: z.number().int().positive().safe(),
    sessionStartedAt: z.date(),
    purchasedAt: z.date(),
    analyticsConsent: z.literal("granted"),
    adUserData: z.enum(["GRANTED", "DENIED"]),
    adPersonalization: z.enum(["GRANTED", "DENIED"]),
    currency: z.literal("ILS"),
    paidTotalCents: cents.positive(),
    taxCents: cents,
    shippingCents: cents,
    items: z
      .array(
        z
          .object({
            id: z.string().min(1).max(100),
            name: z.string().min(1).max(100),
            // Discounted, tax-exclusive unit amount from a VERIFIED payment contract.
            unitNetCents: cents,
            quantity: z.number().int().positive().max(10000),
          })
          .strict(),
      )
      .min(1)
      .max(100),
  })
  .strict();

export type GooglePurchaseInput = z.infer<typeof inputSchema>;

// No Grow payload mapping lives here until the owner verifies its amount and
// checkout-reference contracts. This function is server-only integration code,
// not an endpoint accepting browser assertions of a paid purchase.
export function buildGooglePurchase(input: GooglePurchaseInput) {
  const data = inputSchema.parse(input);
  const netCents = data.items.reduce(
    (sum, item) => sum + item.unitNetCents * item.quantity,
    0,
  );
  if (
    !Number.isSafeInteger(netCents) ||
    netCents + data.taxCents + data.shippingCents !== data.paidTotalCents
  )
    throw new PurchaseDeliveryError("google", "validation");
  if (data.purchasedAt < data.sessionStartedAt)
    throw new PurchaseDeliveryError("google", "validation");
  return {
    client_id: data.clientId,
    timestamp_micros: data.purchasedAt.getTime() * 1000,
    consent: {
      ad_user_data: data.adUserData,
      ad_personalization: data.adPersonalization,
    },
    events: [
      {
        name: "purchase" as const,
        params: {
          transaction_id: data.transactionId,
          session_id: data.sessionId,
          currency: data.currency,
          value: netCents / 100,
          tax: data.taxCents / 100,
          shipping: data.shippingCents / 100,
          items: data.items.map((item) => ({
            item_id: item.id,
            item_name: item.name,
            price: item.unitNetCents / 100,
            quantity: item.quantity,
          })),
        },
      },
    ],
  };
}

export type GooglePurchasePayload = ReturnType<typeof buildGooglePurchase>;
export function getGooglePurchaseDestination() {
  const mode = serverDeliveryMode("google");
  const measurementId = process.env.GA_PURCHASE_MEASUREMENT_ID;
  if (
    !mode ||
    !measurementId ||
    !/^G-[A-Z0-9]+$/.test(measurementId) ||
    !process.env.GA_MEASUREMENT_PROTOCOL_SECRET ||
    (mode === "production" && measurementId !== GA_MEASUREMENT_ID) ||
    (mode === "test" && measurementId === PRODUCTION_GA_ID)
  )
    return null;
  return { mode, measurementId };
}
export type GooglePurchaseJob = {
  payload: GooglePurchasePayload;
  measurementId: string;
  mode: "production" | "test";
  sessionStartedAt: Date;
};

export async function sendGooglePurchase(job: GooglePurchaseJob) {
  const mode = getGooglePurchaseDestination()?.mode;
  const apiSecret = process.env.GA_MEASUREMENT_PROTOCOL_SECRET;
  // Pin destination and mode to the job. Rotating a secret is allowed; silently
  // moving a queued test event into a production property is not.
  if (
    !mode ||
    mode !== job.mode ||
    !apiSecret ||
    !/^G-[A-Z0-9]+$/.test(job.measurementId) ||
    job.measurementId !== process.env.GA_PURCHASE_MEASUREMENT_ID ||
    (mode === "test" && job.measurementId === PRODUCTION_GA_ID)
  )
    throw new PurchaseDeliveryError("google", "configuration");
  const now = Date.now();
  const eventAt = job.payload.timestamp_micros / 1000;
  const sessionAt = job.sessionStartedAt.getTime();
  // Conservative attribution deadline as well as Google's separate 72h event
  // deadline. Expiry must be surfaced, never hidden by moving the timestamp.
  if (
    !Number.isFinite(eventAt) ||
    !Number.isFinite(sessionAt) ||
    eventAt > now ||
    eventAt < sessionAt ||
    now - eventAt >= 72 * 3600_000 ||
    now - sessionAt >= 24 * 3600_000
  )
    throw new PurchaseDeliveryError("google", "expired");

  const query = new URLSearchParams({
    measurement_id: job.measurementId,
    api_secret: apiSecret,
  });
  async function post(path: string, body: unknown) {
    try {
      return await fetch(`https://www.google-analytics.com/${path}?${query}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: AbortSignal.timeout(8_000),
      });
    } catch {
      // fetch errors can include the URL containing api_secret: do not propagate.
      throw new PurchaseDeliveryError("google", "network");
    }
  }
  const validation = await post("debug/mp/collect", {
    ...job.payload,
    validation_behavior: "ENFORCE_RECOMMENDATIONS",
  });
  const body: unknown = await validation.json().catch(() => null);
  if (
    !validation.ok ||
    !body ||
    typeof body !== "object" ||
    !("validationMessages" in body) ||
    !Array.isArray(body.validationMessages) ||
    body.validationMessages.length !== 0
  )
    throw new PurchaseDeliveryError("google", "validation", validation.status);

  const receipt = await post("mp/collect", job.payload);
  if (!receipt.ok)
    throw new PurchaseDeliveryError("google", "rejected", receipt.status);
  // This is deliberately NOT named accepted/attributed: MP 2xx confirms transport
  // receipt only. Provider account/report verification remains a launch gate.
  return "transport_received" as const;
}
