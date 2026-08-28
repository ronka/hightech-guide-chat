/** @jest-environment node */
jest.mock("@/db", () => ({ db: { update: jest.fn(), select: jest.fn() } }));
jest.mock("./google-purchases", () => ({
  ...jest.requireActual("./google-purchases"),
  sendGooglePurchase: jest.fn(),
}));
import { db } from "@/db";
import {
  deliverGooglePurchase,
  retryGooglePurchases,
} from "./google-purchase-delivery";
import { sendGooglePurchase } from "./google-purchases";
import { PurchaseDeliveryError } from "./purchase-delivery";
import { PgDialect } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";

const returning = jest.fn();
const where = jest.fn((_condition: unknown) => ({ returning }));
const set = jest.fn((_values: unknown) => ({ where }));
const now = new Date("2026-08-28T10:00:00Z");
const job = {
  transactionId: "TX-123",
  payload: { timestamp_micros: now.getTime() * 1000 },
  measurementId: "G-TEST123",
  mode: "test",
  sessionStartedAt: now,
  attempts: 1,
};
const originalEnv = process.env;
beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers({ now });
  process.env = {
    ...originalEnv,
    GOOGLE_PURCHASE_MODE: "test",
    GA_PURCHASE_MEASUREMENT_ID: "G-TEST123",
    GA_MEASUREMENT_PROTOCOL_SECRET: "test-secret",
  };
  jest.mocked(db.update).mockReturnValue({ set } as never);
  returning.mockResolvedValue([{ ...job }]);
  jest.mocked(sendGooglePurchase).mockResolvedValue("transport_received");
});
afterEach(() => {
  process.env = originalEnv;
  jest.useRealTimers();
});

it("claims only eligible due jobs with a lease and records transport receipt", async () => {
  expect(await deliverGooglePurchase("TX-123")).toBe("transport_received");
  const sql = new PgDialect().sqlToQuery(where.mock.calls[0][0] as SQL).sql;
  expect(sql).toContain('"suppressedReason" is null');
  expect(sql).toContain('"sentAt" is null');
  expect(sql).toContain('"lockedUntil" <=');
  expect(set.mock.calls[1][0]).toMatchObject({ sentAt: now, lockId: null });
});
it("does not send concurrently claimed/previously sent/suppressed jobs", async () => {
  returning.mockResolvedValueOnce([]);
  expect(await deliverGooglePurchase("TX-123")).toBe("skipped");
  expect(sendGooglePurchase).not.toHaveBeenCalled();
});
it("leaves unresolved network delivery retryable without a new transaction identity", async () => {
  jest
    .mocked(sendGooglePurchase)
    .mockRejectedValueOnce(new PurchaseDeliveryError("google", "network"));
  expect(await deliverGooglePurchase("TX-123")).toBe("retry");
  expect(set.mock.calls[1][0]).toMatchObject({
    nextAttemptAt: new Date(now.getTime() + 60_000),
    lastError: "google purchase network",
  });
  expect(set.mock.calls[1][0]).not.toHaveProperty("sentAt");
});
it.each(["expired", "validation", "rejected"] as const)(
  "quarantines %s without retimestamping/retrying the same invalid request",
  async (reason) => {
    jest
      .mocked(sendGooglePurchase)
      .mockRejectedValueOnce(new PurchaseDeliveryError("google", reason));
    expect(await deliverGooglePurchase("TX-123")).toBe("failed");
    expect(set.mock.calls[1][0]).toMatchObject({ failedAt: now });
    expect(set.mock.calls[1][0]).not.toHaveProperty("payload");
  },
);
it("does not change the destination of an old test job", async () => {
  returning.mockResolvedValueOnce([{ ...job, measurementId: "G-OTHER123" }]);
  expect(await deliverGooglePurchase("TX-123")).toBe("disabled");
  expect(sendGooglePurchase).not.toHaveBeenCalled();
});
it("does no database work when delivery is disabled", async () => {
  delete process.env.GOOGLE_PURCHASE_MODE;
  expect(await deliverGooglePurchase("TX-123")).toBe("disabled");
  expect(db.update).not.toHaveBeenCalled();
});
it("drains bounded batches and reports an empty remainder", async () => {
  const limit = jest
    .fn()
    .mockResolvedValueOnce([{ transactionId: "TX-123" }])
    .mockResolvedValue([]);
  jest
    .mocked(db.select)
    .mockReturnValue({
      from: () => ({ where: () => ({ orderBy: () => ({ limit }) }) }),
    } as never);
  expect(await retryGooglePurchases()).toMatchObject({
    checked: 1,
    received: 1,
    hasMore: false,
  });
});
