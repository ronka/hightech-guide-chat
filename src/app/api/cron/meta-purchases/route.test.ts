/** @jest-environment node */
jest.mock("@/services/meta-purchase-delivery", () => ({
  retryMetaPurchases: jest.fn(),
}));
import { NextRequest } from "next/server";
import { retryMetaPurchases } from "@/services/meta-purchase-delivery";
import { GET } from "./route";

beforeEach(() => {
  process.env.META_PURCHASE_MODE = "test";
  process.env.META_PIXEL_ID = "123456";
  process.env.META_TEST_EVENT_CODE = "TEST123";
});

afterEach(() => {
  delete process.env.CRON_SECRET;
  delete process.env.META_CAPI_ACCESS_TOKEN;
  delete process.env.META_PURCHASE_MODE;
  delete process.env.META_PIXEL_ID;
  delete process.env.META_TEST_EVENT_CODE;
  jest.clearAllMocks();
});
it("rejects missing configuration and unauthorized requests", async () => {
  const request = new NextRequest(
    "https://example.test/api/cron/meta-purchases",
  );
  expect((await GET(request)).status).toBe(503);
  process.env.CRON_SECRET = "test-secret";
  process.env.META_CAPI_ACCESS_TOKEN = "test-token";
  expect((await GET(request)).status).toBe(401);
  expect(retryMetaPurchases).not.toHaveBeenCalled();
});
it("runs the retry worker only with the configured bearer secret", async () => {
  process.env.CRON_SECRET = "test-secret";
  process.env.META_CAPI_ACCESS_TOKEN = "test-token";
  jest
    .mocked(retryMetaPurchases)
    .mockResolvedValue({
      checked: 1,
      sent: 1,
      retry: 0,
      expired: 0,
      disabled: 0,
      workerErrors: 0,
      hasMore: false,
    });
  const response = await GET(
    new NextRequest("https://example.test/api/cron/meta-purchases", {
      headers: { Authorization: "Bearer test-secret" },
    }),
  );
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ sent: 1 });
});

it("returns unhealthy when the worker ran but provider delivery failed", async () => {
  process.env.CRON_SECRET = "test-secret";
  process.env.META_CAPI_ACCESS_TOKEN = "test-token";
  jest
    .mocked(retryMetaPurchases)
    .mockResolvedValue({
      checked: 1,
      sent: 0,
      retry: 1,
      expired: 0,
      disabled: 0,
      workerErrors: 0,
      hasMore: false,
    });
  const response = await GET(
    new NextRequest("https://example.test/api/cron/meta-purchases", {
      headers: { Authorization: "Bearer test-secret" },
    }),
  );
  expect(response.status).toBe(503);
  expect(await response.json()).toMatchObject({ healthy: false, retry: 1 });
});
