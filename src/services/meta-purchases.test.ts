/** @jest-environment node */
import {
  hashEmail,
  sendMetaPurchase,
  type MetaPurchaseEvent,
} from "./meta-purchases";
const destination = { pixelId: "123456", mode: "test" as const };

const event: MetaPurchaseEvent = {
  event_name: "Purchase",
  event_id: "grow:purchase:123",
  event_time: 1787911200,
  action_source: "website",
  event_source_url: "https://pay.grow.link/test",
  user_data: { em: [hashEmail("user@example.com")] },
  custom_data: {
    currency: "ILS",
    value: 99,
    order_id: "123",
    content_type: "product",
    content_ids: ["job-interview-course"],
    contents: [{ id: "job-interview-course", quantity: 1 }],
    num_items: 1,
  },
};

beforeEach(() => {
  process.env.META_CAPI_ACCESS_TOKEN = "test-only-token";
  process.env.META_PURCHASE_MODE = "test";
  process.env.META_PIXEL_ID = destination.pixelId;
  process.env.META_TEST_EVENT_CODE = "TEST123";
  jest
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(new Response(JSON.stringify({ events_received: 1 })));
});
afterEach(() => {
  delete process.env.META_CAPI_ACCESS_TOKEN;
  delete process.env.META_PURCHASE_MODE;
  delete process.env.META_PIXEL_ID;
  delete process.env.META_TEST_EVENT_CODE;
  jest.restoreAllMocks();
});

it("normalizes and SHA-256 hashes email", () => {
  expect(hashEmail(" USER@Example.com ")).toBe(hashEmail("user@example.com"));
  expect(hashEmail("user@example.com")).toMatch(/^[a-f0-9]{64}$/);
});

it("sends only to Meta, with a server token and stable Purchase payload", async () => {
  await sendMetaPurchase(event, "TEST123", destination);
  expect(fetch).toHaveBeenCalledTimes(1);
  const [url, request] = jest.mocked(fetch).mock.calls[0];
  expect(url).toBe(
    `https://graph.facebook.com/v26.0/${destination.pixelId}/events`,
  );
  expect(request?.headers).toMatchObject({
    Authorization: "Bearer test-only-token",
  });
  expect(JSON.parse(String(request?.body))).toEqual({
    data: [event],
    test_event_code: "TEST123",
  });
  expect(request?.signal).toBeDefined();
});

it("uses a persisted test event code, not the current environment", async () => {
  process.env.META_TEST_EVENT_CODE = "DIFFERENT";
  await sendMetaPurchase(event, "TEST123", destination);
  expect(
    JSON.parse(String(jest.mocked(fetch).mock.calls[0][1]?.body)),
  ).toMatchObject({ test_event_code: "TEST123" });
});

it.each([
  [500, {}],
  [400, { error: { message: "sensitive response" } }],
  [200, { events_received: 0 }],
  [200, { events_received: 1, error: {} }],
  [200, {}],
])("requires explicit event acceptance (HTTP %s)", async (status, body) => {
  jest
    .mocked(fetch)
    .mockResolvedValueOnce(new Response(JSON.stringify(body), { status }));
  await expect(sendMetaPurchase(event, "TEST123", destination)).rejects.toThrow(
    `meta purchase rejected (HTTP ${status})`,
  );
});

it("does not send when the access token is missing", async () => {
  delete process.env.META_CAPI_ACCESS_TOKEN;
  await expect(sendMetaPurchase(event, "TEST123", destination)).rejects.toThrow(
    "configuration",
  );
  expect(fetch).not.toHaveBeenCalled();
});

it("fails closed when reporting is disabled or a test destination changes", async () => {
  delete process.env.META_PURCHASE_MODE;
  await expect(sendMetaPurchase(event, "TEST123", destination)).rejects.toThrow(
    "configuration",
  );
  process.env.META_PURCHASE_MODE = "test";
  process.env.META_PIXEL_ID = "654321";
  await expect(sendMetaPurchase(event, "TEST123", destination)).rejects.toThrow(
    "configuration",
  );
  expect(fetch).not.toHaveBeenCalled();
});

it("retains only safe numeric provider diagnostics, never response text", async () => {
  jest
    .mocked(fetch)
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: { code: 190, message: "sensitive customer and token" },
        }),
        { status: 400 },
      ),
    );
  await expect(sendMetaPurchase(event, "TEST123", destination)).rejects.toThrow(
    "meta purchase rejected (HTTP 400) (code 190)",
  );
});
