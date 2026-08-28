/** @jest-environment node */
jest.mock("@/db", () => ({ db: { transaction: jest.fn() } }));

import { db } from "@/db";
import {
  bookPurchase,
  coursePurchase,
  ebookPurchase,
  metaPurchaseOutbox,
  googlePurchaseOutbox,
} from "@/db/schema";
import {
  BOOK_ASMACHTA_ID,
  COURSE_ASMACHTA_ID,
  EBOOK_ASMACHTA_ID,
  COURSE_PAYLINKS,
} from "@/lib/paylinks";
import {
  buildMetaPurchase,
  parseCompletedPayment,
  recordCompletedPayment,
} from "./completed-payment";
import { parseNestedFormData } from "./handlers";
import { hashEmail } from "@/services/meta-purchases";

function callback() {
  return {
    err: "",
    status: "1",
    data: {
      statusCode: "2",
      payerEmail: " User@Example.com ",
      transactionId: "TX-123",
      paymentLinkProcessId: COURSE_ASMACHTA_ID,
      sum: "89.90",
      productData: [{ product_id: "342942", quantity: "1", price: "99" }],
      transactionToken: "do-not-forward",
      payerPhone: "0500000000",
    },
  };
}

const paidAt = new Date("2026-08-28T10:00:00Z");
const parsePaid = () => {
  const payment = parseCompletedPayment(callback());
  if (!payment) throw new Error("Expected completed payment");
  return payment;
};

it.each([
  [COURSE_ASMACHTA_ID, "job-interview-course"],
  [BOOK_ASMACHTA_ID, "physical-book"],
  [EBOOK_ASMACHTA_ID, "digital-book"],
])("recognizes the configured paylink %s", (paymentLinkProcessId, product) => {
  const body = callback();
  body.data.paymentLinkProcessId = paymentLinkProcessId;
  expect(parseCompletedPayment(body)?.product).toBe(product);
});

it.each(["0", "1", "3", "4", "5"])(
  "does not report non-paid status %s",
  (statusCode) => {
    const body = callback();
    body.data.statusCode = statusCode;
    expect(parseCompletedPayment(body)).toBeNull();
  },
);

it("does not report API errors or failed envelopes", () => {
  expect(parseCompletedPayment({ ...callback(), status: "0" })).toBeNull();
  expect(parseCompletedPayment({ ...callback(), err: "declined" })).toBeNull();
});

it.each([null, {}, { status: "1" }])("rejects malformed callbacks", (body) => {
  expect(() => parseCompletedPayment(body)).toThrow();
});

it.each(["", "0", "-99", "NaN", "Infinity", "99abc", "1e2"])(
  "rejects invalid paid total %s",
  (sum) => {
    const body = callback();
    body.data.sum = sum;
    expect(() => parseCompletedPayment(body)).toThrow();
  },
);

it("requires a transaction ID, known link/course, quantity and ILS", () => {
  const body = callback();
  expect(() =>
    parseCompletedPayment({
      ...body,
      data: { ...body.data, transactionId: "" },
    }),
  ).toThrow();
  expect(() =>
    parseCompletedPayment({
      ...body,
      data: { ...body.data, paymentLinkProcessId: "unknown" },
    }),
  ).toThrow();
  expect(() =>
    parseCompletedPayment({ ...body, data: { ...body.data, currency: "USD" } }),
  ).toThrow();
  body.data.productData[0].quantity = "0";
  expect(() => parseCompletedPayment(body)).toThrow();
  body.data.productData[0] = {
    product_id: "unknown",
    quantity: "1",
    price: "99",
  };
  expect(() => parseCompletedPayment(body)).toThrow();
});

it("parses a real form-encoded PaymentLinks-shaped callback", () => {
  const form = new URLSearchParams({
    err: "",
    status: "1",
    "data[statusCode]": "2",
    "data[payerEmail]": "user@example.com",
    "data[transactionId]": "TX-123",
    "data[paymentLinkProcessId]": COURSE_ASMACHTA_ID,
    "data[sum]": "89.90",
    "data[productData][0][product_id]": "342942",
    "data[productData][0][quantity]": "1",
  });
  expect(
    parseCompletedPayment(parseNestedFormData(form.toString())),
  ).toMatchObject({ sum: 89.9 });
});

it("rejects prototype pollution and conflicting form structures", () => {
  expect(() => parseNestedFormData("__proto__[polluted]=yes")).toThrow();
  expect(() => parseNestedFormData("data=x&data[statusCode]=2")).toThrow();
  expect({}).not.toHaveProperty("polluted");
});

it("uses actual paid total, canonical product ID and hashed email without webhook attribution", () => {
  const event = buildMetaPurchase(parsePaid(), paidAt);
  expect(event).toEqual({
    event_name: "Purchase",
    event_id: "grow:purchase:TX-123",
    event_time: paidAt.getTime() / 1000,
    action_source: "website",
    event_source_url: COURSE_PAYLINKS["job-interview-course"],
    user_data: { em: [hashEmail("user@example.com")] },
    custom_data: {
      currency: "ILS",
      value: 89.9,
      order_id: "TX-123",
      content_type: "product",
      content_ids: ["job-interview-course"],
      contents: [{ id: "job-interview-course", quantity: 1 }],
      num_items: 1,
    },
  });
  expect(JSON.stringify(event)).not.toContain("user@example.com");
  expect(JSON.stringify(event)).not.toContain("do-not-forward");
});

it("does not guess unit prices from the paid total including shipping", () => {
  const body = callback();
  body.data.paymentLinkProcessId = BOOK_ASMACHTA_ID;
  body.data.sum = "130";
  body.data.productData[0].quantity = "2";
  const payment = parseCompletedPayment(body)!;
  const event = buildMetaPurchase(payment, paidAt);
  expect(event.custom_data.value).toBe(130);
  expect(event.custom_data.contents).toEqual([
    { id: "physical-book", quantity: 2 },
  ]);
  expect(event.custom_data.num_items).toBe(2);
});

it.each([
  [COURSE_ASMACHTA_ID, coursePurchase],
  [BOOK_ASMACHTA_ID, bookPurchase],
  [EBOOK_ASMACHTA_ID, ebookPurchase],
])(
  "commits the entitlement and stable outbox event in one transaction (%s)",
  async (paymentLinkProcessId, table) => {
    const conflict = jest.fn().mockResolvedValue(undefined);
    const values = jest.fn((_values: unknown) => ({
      onConflictDoNothing: conflict,
    }));
    const insert = jest.fn((_table: unknown) => ({ values }));
    const limit = jest.fn().mockResolvedValue([{ purchasedAt: paidAt }]);
    const tx = {
      insert,
      select: jest.fn(() => ({ from: () => ({ where: () => ({ limit }) }) })),
    };
    jest
      .mocked(db.transaction)
      .mockImplementation(async (action) => action(tx as never));
    const body = callback();
    body.data.paymentLinkProcessId = paymentLinkProcessId;
    const payment = parseCompletedPayment(body)!;
    const eventId = await recordCompletedPayment(payment);
    expect(eventId).toBe("grow:purchase:TX-123");
    expect(insert.mock.calls).toEqual([
      [table],
      [metaPurchaseOutbox],
      [googlePurchaseOutbox],
    ]);
    expect(values.mock.calls[1][0]).toMatchObject({
      eventId,
      payload: { event_time: paidAt.getTime() / 1000 },
    });
    expect(conflict).toHaveBeenNthCalledWith(2, {
      target: metaPurchaseOutbox.eventId,
    });
    expect(values.mock.calls[2][0]).toMatchObject({
      transactionId: "TX-123",
      payload: null,
      suppressedReason: "missing_verified_attribution",
    });
    expect(conflict).toHaveBeenLastCalledWith({
      target: googlePurchaseOutbox.transactionId,
    });
  },
);

it("does not commit a purchase when enqueueing fails", async () => {
  const conflict = jest
    .fn()
    .mockResolvedValueOnce(undefined)
    .mockRejectedValueOnce(new Error("DB unavailable"));
  const tx = {
    insert: () => ({ values: () => ({ onConflictDoNothing: conflict }) }),
    select: () => ({
      from: () => ({
        where: () => ({ limit: async () => [{ purchasedAt: paidAt }] }),
      }),
    }),
  };
  // A rejected transaction callback instructs Drizzle to roll back both writes.
  jest
    .mocked(db.transaction)
    .mockImplementation(async (action) => action(tx as never));
  await expect(recordCompletedPayment(parsePaid())).rejects.toThrow(
    "DB unavailable",
  );
});
