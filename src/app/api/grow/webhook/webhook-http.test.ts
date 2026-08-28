/** @jest-environment node */
jest.mock("@/db", () => ({ db: { insert: jest.fn() } }));
jest.mock("./completed-payment", () => ({
  ...jest.requireActual("./completed-payment"),
  recordCompletedPayment: jest.fn(),
}));
jest.mock("@/services/meta-purchase-delivery", () => ({
  deliverMetaPurchase: jest.fn(),
}));
jest.mock("@/services/google-purchase-delivery", () => ({
  deliverGooglePurchase: jest.fn(),
}));

import { NextRequest } from "next/server";
import { db } from "@/db";
import { COURSE_ASMACHTA_ID } from "@/lib/paylinks";
import { recordCompletedPayment } from "./completed-payment";
import { deliverMetaPurchase } from "@/services/meta-purchase-delivery";
import { deliverGooglePurchase } from "@/services/google-purchase-delivery";
import { POST } from "./route";

const values = jest.fn();
const body = () => ({
  err: "",
  status: "1",
  data: {
    statusCode: "2",
    payerEmail: "user@example.com",
    transactionId: "TX-123",
    paymentLinkProcessId: COURSE_ASMACHTA_ID,
    sum: "99",
    productData: [{ product_id: "342942", quantity: "1" }],
    transactionToken: "sensitive-token",
  },
});
const request = (data: unknown = body(), key = "test-key") =>
  new NextRequest(`https://example.test/api/grow/webhook?key=${key}`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });

beforeEach(() => {
  jest.clearAllMocks();
  process.env.GROW_WEBHOOK_KEY = "test-key";
  jest.mocked(db.insert).mockReturnValue({ values } as never);
  jest.mocked(recordCompletedPayment).mockResolvedValue("grow:purchase:TX-123");
  jest.mocked(deliverMetaPurchase).mockResolvedValue("sent");
  jest.mocked(deliverGooglePurchase).mockResolvedValue("disabled");
});
afterEach(() => {
  delete process.env.GROW_WEBHOOK_KEY;
  jest.restoreAllMocks();
});

it.each(["", "wrong"])(
  "rejects an unauthenticated webhook before any write (%s)",
  async (key) => {
    expect((await POST(request(body(), key))).status).toBe(401);
    expect(db.insert).not.toHaveBeenCalled();
    expect(recordCompletedPayment).not.toHaveBeenCalled();
    expect(deliverMetaPurchase).not.toHaveBeenCalled();
  },
);

it("fails closed if the server key is not configured", async () => {
  delete process.env.GROW_WEBHOOK_KEY;
  expect((await POST(request())).status).toBe(503);
  expect(recordCompletedPayment).not.toHaveBeenCalled();
});

it("records the payment before delivering Meta and logs no personal data/tokens", async () => {
  expect(await (await POST(request())).json()).toEqual({ ok: true });
  expect(recordCompletedPayment).toHaveBeenCalledTimes(1);
  expect(deliverMetaPurchase).toHaveBeenCalledWith("grow:purchase:TX-123");
  expect(deliverGooglePurchase).toHaveBeenCalledWith("TX-123");
  expect(
    jest.mocked(recordCompletedPayment).mock.invocationCallOrder[0],
  ).toBeLessThan(jest.mocked(deliverMetaPurchase).mock.invocationCallOrder[0]);
  expect(JSON.stringify(values.mock.calls)).not.toMatch(
    /user@example.com|sensitive-token|test-key/,
  );
});

it("supports a shared secret header and form-encoded callbacks", async () => {
  const form = new URLSearchParams({
    err: "",
    status: "1",
    "data[statusCode]": "2",
    "data[payerEmail]": "user@example.com",
    "data[transactionId]": "TX-123",
    "data[paymentLinkProcessId]": COURSE_ASMACHTA_ID,
    "data[sum]": "99",
    "data[productData][0][product_id]": "342942",
    "data[productData][0][quantity]": "1",
  });
  const req = new NextRequest("https://example.test/api/grow/webhook", {
    method: "POST",
    body: form,
    headers: { "x-grow-webhook-key": "test-key" },
  });
  expect((await POST(req)).status).toBe(200);
});

it("does not grant access or send conversions for unpaid/cancelled transactions", async () => {
  const data = body();
  data.data.statusCode = "1";
  expect(await (await POST(request(data))).json()).toMatchObject({
    ignored: "Payment not completed",
  });
  expect(recordCompletedPayment).not.toHaveBeenCalled();
  expect(deliverMetaPurchase).not.toHaveBeenCalled();
});

it.each([null, {}, { status: "1", data: { statusCode: "2" } }])(
  "rejects malformed paid callbacks",
  async (data) => {
    expect((await POST(request(data))).status).toBe(400);
    expect(recordCompletedPayment).not.toHaveBeenCalled();
  },
);

it("leaves the saved purchase usable when Meta fails; the outbox retries later", async () => {
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest
    .mocked(deliverMetaPurchase)
    .mockRejectedValueOnce(new Error("network timeout"));
  expect((await POST(request())).status).toBe(200);
  expect(recordCompletedPayment).toHaveBeenCalledTimes(1);
  expect(deliverGooglePurchase).toHaveBeenCalledTimes(1);
});

it("does not send to Meta if the database transaction fails", async () => {
  jest
    .mocked(recordCompletedPayment)
    .mockRejectedValueOnce(new Error("database failure"));
  await expect(POST(request())).rejects.toThrow("database failure");
  expect(deliverMetaPurchase).not.toHaveBeenCalled();
  expect(deliverGooglePurchase).not.toHaveBeenCalled();
});
