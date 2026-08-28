/** @jest-environment node */
jest.mock("@/db", () => ({ db: { update: jest.fn(), select: jest.fn() } }));
jest.mock("./meta-purchases", () => ({
  ...jest.requireActual("./meta-purchases"),
  sendMetaPurchase: jest.fn(),
}));

import { PgDialect } from "drizzle-orm/pg-core";
import type { SQL } from "drizzle-orm";
import { db } from "@/db";
import {
  deliverMetaPurchase,
  retryMetaPurchases,
} from "./meta-purchase-delivery";
import { sendMetaPurchase } from "./meta-purchases";

const returning = jest.fn();
const where = jest.fn((_condition: unknown) => ({ returning }));
const set = jest.fn((_values: unknown) => ({ where }));
const now = new Date("2026-08-28T10:00:00Z");
const payload = {
  event_name: "Purchase",
  event_id: "grow:purchase:123",
  event_time: now.getTime() / 1000,
};
const job = () => ({
  eventId: payload.event_id,
  payload,
  testEventCode: "TEST123",
  destination: { pixelId: "123456", mode: "test" },
  attempts: 1,
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers({ now });
  process.env.META_CAPI_ACCESS_TOKEN = "test-token";
  process.env.META_PURCHASE_MODE = "test";
  process.env.META_PIXEL_ID = "123456";
  process.env.META_TEST_EVENT_CODE = "TEST123";
  jest.mocked(db.update).mockReturnValue({ set } as never);
  returning.mockResolvedValue([job()]);
  jest.mocked(sendMetaPurchase).mockResolvedValue(undefined);
});
afterEach(() => {
  delete process.env.META_CAPI_ACCESS_TOKEN;
  delete process.env.META_PURCHASE_MODE;
  delete process.env.META_PIXEL_ID;
  delete process.env.META_TEST_EVENT_CODE;
  jest.useRealTimers();
});

it("atomically claims due unsent events with an expiring lease, then marks accepted events sent", async () => {
  expect(await deliverMetaPurchase(payload.event_id)).toBe("sent");
  expect(set.mock.calls[0][0]).toMatchObject({
    lockedUntil: new Date(now.getTime() + 60_000),
    lockId: expect.any(String),
  });
  const query = new PgDialect().sqlToQuery(where.mock.calls[0][0] as SQL);
  expect(query.sql).toContain('"sentAt" is null');
  expect(query.sql).toContain('"failedAt" is null');
  expect(query.sql).toContain('"nextAttemptAt" <=');
  expect(query.sql).toContain('"lockedUntil" <=');
  expect(sendMetaPurchase).toHaveBeenCalledWith(
    payload,
    "TEST123",
    job().destination,
  );
  expect(set.mock.calls[1][0]).toMatchObject({
    sentAt: now,
    lockId: null,
    lockedUntil: null,
  });
  expect(
    new PgDialect().sqlToQuery(where.mock.calls[1][0] as SQL).sql,
  ).toContain('"lockId" =');
});

it("skips already sent or concurrently claimed events without sending", async () => {
  returning.mockResolvedValueOnce([]);
  expect(await deliverMetaPurchase(payload.event_id)).toBe("skipped");
  expect(sendMetaPurchase).not.toHaveBeenCalled();
});

it("retries the original payload after failure without marking it sent", async () => {
  jest
    .mocked(sendMetaPurchase)
    .mockRejectedValueOnce(new Error("private provider response"));
  expect(await deliverMetaPurchase(payload.event_id)).toBe("retry");
  expect(set.mock.calls[1][0]).toMatchObject({
    nextAttemptAt: new Date(now.getTime() + 60_000),
    lockId: null,
  });
  expect(set.mock.calls[1][0]).not.toHaveProperty("sentAt");
  expect(JSON.stringify(set.mock.calls[1][0])).not.toContain(
    "private provider response",
  );
  jest.setSystemTime(new Date(now.getTime() + 60_000));
  returning.mockResolvedValueOnce([{ ...job(), attempts: 2 }]);
  expect(await deliverMetaPurchase(payload.event_id)).toBe("sent");
  expect(jest.mocked(sendMetaPurchase).mock.calls).toEqual([
    [payload, "TEST123", job().destination],
    [payload, "TEST123", job().destination],
  ]);
});

it("preserves the test event code on retries", async () => {
  returning.mockResolvedValueOnce([{ ...job(), testEventCode: "TEST123" }]);
  await deliverMetaPurchase(payload.event_id);
  expect(sendMetaPurchase).toHaveBeenCalledWith(
    payload,
    "TEST123",
    job().destination,
  );
});

it("does not rewrite expired events as new purchases", async () => {
  returning.mockResolvedValueOnce([
    {
      ...job(),
      payload: { ...payload, event_time: now.getTime() / 1000 - 7 * 86400 },
    },
  ]);
  expect(await deliverMetaPurchase(payload.event_id)).toBe("expired");
  expect(sendMetaPurchase).not.toHaveBeenCalled();
  expect(set.mock.calls[1][0]).toMatchObject({ failedAt: now });
});

it("leaves jobs pending when credentials are missing", async () => {
  delete process.env.META_CAPI_ACCESS_TOKEN;
  expect(await deliverMetaPurchase(payload.event_id)).toBe("disabled");
  expect(db.update).not.toHaveBeenCalled();
});

it("processes a bounded retry batch", async () => {
  const limit = jest
    .fn()
    .mockResolvedValueOnce([{ eventId: payload.event_id }])
    .mockResolvedValue([]);
  jest.mocked(db.select).mockReturnValue({
    from: () => ({ where: () => ({ orderBy: () => ({ limit }) }) }),
  } as never);
  expect(await retryMetaPurchases()).toMatchObject({ checked: 1, sent: 1 });
  expect(limit).toHaveBeenCalledWith(20);
});

it("stops starting network waves within the route budget during a slow outage", async () => {
  const limit = jest
    .fn()
    .mockResolvedValue(
      Array.from({ length: 20 }, (_, index) => ({ eventId: `job-${index}` })),
    );
  jest
    .mocked(db.select)
    .mockReturnValue({
      from: () => ({ where: () => ({ orderBy: () => ({ limit }) }) }),
    } as never);
  let calls = 0;
  jest.mocked(sendMetaPurchase).mockImplementation(async () => {
    calls++;
    if (calls % 4 === 0) jest.setSystemTime(new Date(Date.now() + 8000));
    throw new Error("test timeout");
  });
  expect(await retryMetaPurchases()).toMatchObject({
    checked: 24,
    retry: 24,
    hasMore: true,
  });
  expect(Date.now() - now.getTime()).toBe(48_000);
});
