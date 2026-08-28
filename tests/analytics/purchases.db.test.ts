/** @jest-environment node */
// Only the database transport is substituted; production transaction, parsing,
// outbox claim and delivery code execute against real ephemeral PostgreSQL SQL.
jest.mock("@/db", () => ({
  get db() {
    return mockDatabase;
  },
}));
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { eq } from "drizzle-orm";
import { readFileSync } from "node:fs";
import * as schema from "@/db/schema";
import {
  parseCompletedPayment,
  recordCompletedPayment,
  type VerifiedGoogleContext,
} from "@/app/api/grow/webhook/completed-payment";
import { COURSE_ASMACHTA_ID } from "@/lib/paylinks";
import {
  deliverMetaPurchase,
  retryMetaPurchases,
} from "@/services/meta-purchase-delivery";
import { deliverGooglePurchase } from "@/services/google-purchase-delivery";

let client: PGlite;
let mockDatabase: ReturnType<typeof drizzle<typeof schema>>;
const originalEnv = process.env;
const payment = (id: string) =>
  parseCompletedPayment({
    err: "",
    status: "1",
    data: {
      statusCode: "2",
      payerEmail: "test@example.com",
      transactionId: id,
      paymentLinkProcessId: COURSE_ASMACHTA_ID,
      sum: "99",
      productData: [{ product_id: "342942", quantity: "1" }],
    },
  })!;
const context = (): VerifiedGoogleContext => ({
  clientId: "123.456",
  sessionId: 123456,
  sessionStartedAt: new Date(Date.now() - 1000),
  analyticsConsent: "granted",
  adUserData: "GRANTED",
  adPersonalization: "DENIED",
  taxCents: 0,
  shippingCents: 0,
  items: [
    {
      id: "job-interview-course",
      name: "Course",
      unitNetCents: 9900,
      quantity: 1,
    },
  ],
});

beforeAll(async () => {
  // No connection string, no data directory, no production DATABASE_URL usage.
  client = await PGlite.create();
  mockDatabase = drizzle(client, { schema });
  const journal = JSON.parse(
    readFileSync("drizzle/meta/_journal.json", "utf8"),
  );
  for (const entry of journal.entries)
    await client.exec(readFileSync(`drizzle/${entry.tag}.sql`, "utf8"));
});
afterAll(async () => {
  await client?.close();
});
beforeEach(async () => {
  process.env = {
    ...originalEnv,
    META_PURCHASE_MODE: "test",
    META_PIXEL_ID: "123456",
    META_TEST_EVENT_CODE: "TEST123",
    META_CAPI_ACCESS_TOKEN: "fake-token",
    GOOGLE_PURCHASE_MODE: "test",
    GA_PURCHASE_MEASUREMENT_ID: "G-TEST123",
    GA_MEASUREMENT_PROTOCOL_SECRET: "fake-secret",
  };
  await client.exec(
    'TRUNCATE "coursePurchase", "bookPurchase", "ebookPurchase", "metaPurchaseOutbox", "googlePurchaseOutbox"',
  );
  jest.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
    if (String(url).startsWith("https://graph.facebook.com/"))
      return new Response(JSON.stringify({ events_received: 1 }));
    if (String(url).startsWith("https://www.google-analytics.com/debug/"))
      return new Response(JSON.stringify({ validationMessages: [] }));
    if (String(url).startsWith("https://www.google-analytics.com/mp/"))
      return new Response(null, { status: 204 });
    throw new Error("Unexpected network target blocked");
  });
});
afterEach(() => {
  process.env = originalEnv;
  jest.restoreAllMocks();
});

it("commits one entitlement and two independent jobs under duplicate/concurrent callbacks", async () => {
  await Promise.all(
    Array.from({ length: 8 }, () =>
      recordCompletedPayment(payment("duplicate"), context()),
    ),
  );
  expect(await mockDatabase.select().from(schema.coursePurchase)).toHaveLength(
    1,
  );
  const meta = await mockDatabase.select().from(schema.metaPurchaseOutbox);
  const google = await mockDatabase.select().from(schema.googlePurchaseOutbox);
  expect(meta).toHaveLength(1);
  expect(google).toHaveLength(1);
  expect(google[0].suppressedReason).toBeNull();
  expect(google[0].payload?.events[0].params.transaction_id).toBe("duplicate");
  const firstPayload = meta[0].payload;
  await recordCompletedPayment({ ...payment("duplicate"), sum: 120 });
  expect(
    (await mockDatabase.select().from(schema.metaPurchaseOutbox))[0].payload,
  ).toEqual(firstPayload);
});

it("rolls back entitlement and Meta enqueue if the Google enqueue fails", async () => {
  await client.exec(`CREATE FUNCTION fail_google_insert() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'test failure'; END $$;
    CREATE TRIGGER fail_google BEFORE INSERT ON "googlePurchaseOutbox" FOR EACH ROW EXECUTE FUNCTION fail_google_insert();`);
  try {
    await expect(
      recordCompletedPayment(payment("rollback"), context()),
    ).rejects.toThrow();
    expect(
      await mockDatabase.select().from(schema.coursePurchase),
    ).toHaveLength(0);
    expect(
      await mockDatabase.select().from(schema.metaPurchaseOutbox),
    ).toHaveLength(0);
  } finally {
    await client.exec(
      'DROP TRIGGER fail_google ON "googlePurchaseOutbox"; DROP FUNCTION fail_google_insert();',
    );
  }
});

it("does not let missing/invalid attribution prevent valid purchase access or invent Google conversions", async () => {
  await recordCompletedPayment(payment("missing"));
  await recordCompletedPayment(payment("invalid"), {
    ...context(),
    items: [{ id: "wrong", name: "Wrong", unitNetCents: 9900, quantity: 1 }],
  });
  expect(await mockDatabase.select().from(schema.coursePurchase)).toHaveLength(
    2,
  );
  const rows = await mockDatabase.select().from(schema.googlePurchaseOutbox);
  expect(rows.map((row) => row.suppressedReason).sort()).toEqual([
    "invalid_verified_context",
    "missing_verified_attribution",
  ]);
  expect(await deliverGooglePurchase("missing")).toBe("skipped");
  expect(fetch).not.toHaveBeenCalled();
});

it("claims a pending Meta job once across concurrent workers", async () => {
  await recordCompletedPayment(payment("lease"), context());
  const results = await Promise.all(
    Array.from({ length: 8 }, () => deliverMetaPurchase("grow:purchase:lease")),
  );
  expect(results.filter((r) => r === "sent")).toHaveLength(1);
  expect(fetch).toHaveBeenCalledTimes(1);
});

it("lets Google complete when Meta fails, leaving only Meta retryable", async () => {
  await recordCompletedPayment(payment("independent"), context());
  jest
    .mocked(fetch)
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ error: { code: 190 } }), { status: 400 }),
    );
  expect(await deliverMetaPurchase("grow:purchase:independent")).toBe("retry");
  expect(await deliverGooglePurchase("independent")).toBe("transport_received");
  const [meta] = await mockDatabase.select().from(schema.metaPurchaseOutbox);
  const [google] = await mockDatabase
    .select()
    .from(schema.googlePurchaseOutbox);
  expect(meta.sentAt).toBeNull();
  expect(google.sentAt).not.toBeNull();
});

it("recovers an expired lease without changing event identity", async () => {
  await recordCompletedPayment(payment("crash"));
  await mockDatabase
    .update(schema.metaPurchaseOutbox)
    .set({ lockId: "crashed", lockedUntil: new Date(Date.now() - 1000) })
    .where(eq(schema.metaPurchaseOutbox.eventId, "grow:purchase:crash"));
  expect(await deliverMetaPurchase("grow:purchase:crash")).toBe("sent");
  const [job] = await mockDatabase.select().from(schema.metaPurchaseOutbox);
  expect(job.payload.event_id).toBe("grow:purchase:crash");
});

it("drains 200 healthy queued Meta jobs in one bounded run instead of 20 per day", async () => {
  for (let index = 0; index < 200; index++)
    await recordCompletedPayment(payment(`backlog-${index}`));
  const result = await retryMetaPurchases();
  expect(result).toMatchObject({
    checked: 200,
    sent: 200,
    retry: 0,
    expired: 0,
  });
  expect(
    (await mockDatabase.select().from(schema.metaPurchaseOutbox)).every(
      (job) => job.sentAt,
    ),
  ).toBe(true);
});

it("does not resend jobs whose historical destination is unknown", async () => {
  await recordCompletedPayment(payment("legacy"));
  await mockDatabase
    .update(schema.metaPurchaseOutbox)
    .set({ destination: null });
  expect(await deliverMetaPurchase("grow:purchase:legacy")).toBe("disabled");
  expect(fetch).not.toHaveBeenCalled();
});

it("retries the original ID after provider acceptance but a failed sent-state write", async () => {
  await recordCompletedPayment(payment("accepted-before-crash"));
  await client.exec(`CREATE FUNCTION fail_meta_receipt() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN IF NEW."sentAt" IS NOT NULL THEN RAISE EXCEPTION 'test receipt failure'; END IF; RETURN NEW; END $$;
    CREATE TRIGGER fail_meta_receipt BEFORE UPDATE ON "metaPurchaseOutbox" FOR EACH ROW EXECUTE FUNCTION fail_meta_receipt();`);
  try {
    await expect(
      deliverMetaPurchase("grow:purchase:accepted-before-crash"),
    ).rejects.toThrow();
    const [job] = await mockDatabase.select().from(schema.metaPurchaseOutbox);
    expect(job.sentAt).toBeNull();
    expect(job.lockedUntil).not.toBeNull();
  } finally {
    await client.exec(
      'DROP TRIGGER fail_meta_receipt ON "metaPurchaseOutbox"; DROP FUNCTION fail_meta_receipt();',
    );
  }
  await mockDatabase
    .update(schema.metaPurchaseOutbox)
    .set({ lockedUntil: new Date(Date.now() - 1000) });
  expect(await deliverMetaPurchase("grow:purchase:accepted-before-crash")).toBe(
    "sent",
  );
  const ids = jest
    .mocked(fetch)
    .mock.calls.map(
      ([, request]) => JSON.parse(String(request?.body)).data[0].event_id,
    );
  expect(ids).toEqual([
    "grow:purchase:accepted-before-crash",
    "grow:purchase:accepted-before-crash",
  ]);
});
