/**
 * @jest-environment node
 */

import { createHash } from "node:crypto";
import { hashEmail, sendMetaPurchase } from "./meta-purchases";

describe("hashEmail", () => {
  it("hashes a trimmed, lowercased email with sha256", () => {
    const expected = createHash("sha256").update("test@example.com").digest("hex");
    expect(hashEmail("  Test@Example.com  ")).toBe(expected);
  });
});

describe("sendMetaPurchase", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  const baseInput = {
    email: "user@example.com",
    transactionCode: "TX-001",
    value: 99,
    currency: "ILS",
    contentIds: ["ebook"],
    contentType: "ebook",
    contentName: "Test Product",
    eventSourceUrl: "https://pay.grow.link/test",
    eventTime: new Date("2026-01-01T00:00:00Z"),
  };

  it("no-ops when META_PIXEL_ID/META_CAPI_ACCESS_TOKEN are not configured", async () => {
    process.env.META_PIXEL_ID = undefined;
    process.env.META_CAPI_ACCESS_TOKEN = undefined;
    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    await sendMetaPurchase(baseInput);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts a Purchase event payload to the Meta CAPI endpoint", async () => {
    process.env.META_PIXEL_ID = "123456";
    process.env.META_CAPI_ACCESS_TOKEN = "test-token";

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ events_received: 1 }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await sendMetaPurchase(baseInput);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        href: "https://graph.facebook.com/v21.0/123456/events?access_token=test-token",
      }),
      expect.objectContaining({
        method: "POST",
      }),
    );

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.data[0]).toMatchObject({
      event_name: "Purchase",
      event_id: "grow-purchase-TX-001",
      action_source: "website",
      event_source_url: "https://pay.grow.link/test",
      user_data: { em: [hashEmail("user@example.com")] },
      custom_data: expect.objectContaining({
        currency: "ILS",
        value: 99,
        content_ids: ["ebook"],
        content_type: "ebook",
        order_id: "TX-001",
      }),
    });
  });

  it("throws when Meta responds with an error", async () => {
    process.env.META_PIXEL_ID = "123456";
    process.env.META_CAPI_ACCESS_TOKEN = "test-token";

    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: "bad request" } }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(sendMetaPurchase(baseInput)).rejects.toThrow("Meta CAPI Purchase failed");
  });
});
