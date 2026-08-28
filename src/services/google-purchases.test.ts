/** @jest-environment node */
import {
  buildGooglePurchase,
  sendGooglePurchase,
  type GooglePurchaseInput,
} from "./google-purchases";
import { purchaseErrorSummary } from "./purchase-delivery";

const now = new Date("2026-08-28T10:00:00Z");
const input = (): GooglePurchaseInput => ({
  transactionId: "TX-123",
  clientId: "12345.67890",
  sessionId: 1787909400,
  sessionStartedAt: new Date(now.getTime() - 1800_000),
  purchasedAt: now,
  analyticsConsent: "granted",
  adUserData: "GRANTED",
  adPersonalization: "DENIED",
  currency: "ILS",
  paidTotalCents: 12800,
  taxCents: 1800,
  shippingCents: 1000,
  items: [
    { id: "physical-book", name: "Book", unitNetCents: 5000, quantity: 2 },
  ],
});
const job = () => ({
  payload: buildGooglePurchase(input()),
  mode: "test" as const,
  measurementId: "G-TEST123",
  sessionStartedAt: input().sessionStartedAt,
});
const originalEnv = process.env;
beforeEach(() => {
  process.env = {
    ...originalEnv,
    GOOGLE_PURCHASE_MODE: "test",
    GA_PURCHASE_MEASUREMENT_ID: "G-TEST123",
    GA_MEASUREMENT_PROTOCOL_SECRET: "test-only-secret",
  };
  jest.useFakeTimers({ now });
  jest
    .spyOn(globalThis, "fetch")
    .mockImplementation(async (url) =>
      String(url).includes("/debug/")
        ? new Response(JSON.stringify({ validationMessages: [] }))
        : new Response(null, { status: 204 }),
    );
});
afterEach(() => {
  process.env = originalEnv;
  jest.restoreAllMocks();
  jest.useRealTimers();
});

it("uses verified net item value, separate tax/shipping, real IDs and the original timestamp", () => {
  const payload = buildGooglePurchase(input());
  expect(payload).toEqual({
    client_id: "12345.67890",
    timestamp_micros: now.getTime() * 1000,
    consent: { ad_user_data: "GRANTED", ad_personalization: "DENIED" },
    events: [
      {
        name: "purchase",
        params: {
          transaction_id: "TX-123",
          session_id: 1787909400,
          currency: "ILS",
          value: 100,
          tax: 18,
          shipping: 10,
          items: [
            {
              item_id: "physical-book",
              item_name: "Book",
              price: 50,
              quantity: 2,
            },
          ],
        },
      },
    ],
  });
});
it.each([
  { paidTotalCents: 12801 },
  { taxCents: -1 },
  { currency: "USD" },
  { analyticsConsent: "denied" },
  { clientId: "user@example.com" },
  { sessionId: "session-id-chat" },
  { items: [] },
  { transactionId: "" },
  { purchasedAt: new Date(now.getTime() - 3600_000) },
  { email: "user@example.com" },
])("rejects invalid, unconsented or unreconciled input: %j", (patch) => {
  expect(() =>
    buildGooglePurchase({ ...input(), ...patch } as GooglePurchaseInput),
  ).toThrow();
});
it("validates before sending and reports transport receipt rather than attributed success", async () => {
  expect(await sendGooglePurchase(job())).toBe("transport_received");
  const calls = jest.mocked(fetch).mock.calls;
  expect(calls).toHaveLength(2);
  expect(new URL(String(calls[0][0])).pathname).toBe("/debug/mp/collect");
  expect(new URL(String(calls[1][0])).pathname).toBe("/mp/collect");
  expect(JSON.parse(String(calls[0][1]?.body))).toMatchObject({
    validation_behavior: "ENFORCE_RECOMMENDATIONS",
  });
  expect(JSON.parse(String(calls[1][1]?.body))).toEqual(job().payload);
});
it.each([{}, { validationMessages: [{ description: "private response" }] }])(
  "does not collect when validation fails despite HTTP 200: %j",
  async (body) => {
    jest
      .mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify(body)));
    await expect(sendGooglePurchase(job())).rejects.toThrow(
      "google purchase validation",
    );
    expect(fetch).toHaveBeenCalledTimes(1);
  },
);
it.each([
  "GOOGLE_PURCHASE_MODE",
  "GA_MEASUREMENT_PROTOCOL_SECRET",
  "GA_PURCHASE_MEASUREMENT_ID",
])("fails closed without %s", async (key) => {
  delete process.env[key];
  await expect(sendGooglePurchase(job())).rejects.toThrow("configuration");
  expect(fetch).not.toHaveBeenCalled();
});
it("does not migrate test jobs into a changed destination", async () => {
  process.env.GA_PURCHASE_MEASUREMENT_ID = "G-OTHER123";
  await expect(sendGooglePurchase(job())).rejects.toThrow("configuration");
  expect(fetch).not.toHaveBeenCalled();
});
it.each([24, 72, 168])(
  "expires original session/event data after %s hours without refreshing timestamps",
  async (hours) => {
    const original = job();
    jest.setSystemTime(new Date(now.getTime() + hours * 3600_000));
    await expect(sendGooglePurchase(original)).rejects.toThrow("expired");
    expect(original.payload.timestamp_micros).toBe(now.getTime() * 1000);
    expect(fetch).not.toHaveBeenCalled();
  },
);
it("sanitizes network errors containing the secret URL", async () => {
  jest
    .mocked(fetch)
    .mockRejectedValueOnce(
      new Error("https://example.test?api_secret=test-only-secret"),
    );
  const error = await sendGooglePurchase(job()).catch((error) => error);
  expect(purchaseErrorSummary(error)).toBe("google purchase network");
  expect(purchaseErrorSummary(new Error("private data"))).not.toContain(
    "private",
  );
});
it("does not treat a rejected collection request as receipt", async () => {
  jest
    .mocked(fetch)
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ validationMessages: [] })),
    )
    .mockResolvedValueOnce(new Response(null, { status: 400 }));
  await expect(sendGooglePurchase(job())).rejects.toThrow(
    "google purchase rejected (HTTP 400)",
  );
});
