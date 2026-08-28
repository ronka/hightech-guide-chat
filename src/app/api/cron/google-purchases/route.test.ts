/** @jest-environment node */
jest.mock("@/services/google-purchase-delivery", () => ({
  retryGooglePurchases: jest.fn(),
}));
import { NextRequest } from "next/server";
import { GET } from "./route";
import { retryGooglePurchases } from "@/services/google-purchase-delivery";
const originalEnv = process.env;
beforeEach(() => {
  jest.clearAllMocks();
  process.env = {
    ...originalEnv,
    GOOGLE_PURCHASE_MODE: "test",
    GA_PURCHASE_MEASUREMENT_ID: "G-TEST123",
    GA_MEASUREMENT_PROTOCOL_SECRET: "test-secret",
    CRON_SECRET: "test-cron",
  };
});
afterEach(() => {
  process.env = originalEnv;
});
const request = (key = "test-cron") =>
  new NextRequest("https://example.test/api/cron/google-purchases", {
    headers: { authorization: `Bearer ${key}` },
  });
it("fails closed for missing config and unauthorized requests", async () => {
  expect((await GET(request("wrong"))).status).toBe(401);
  delete process.env.GOOGLE_PURCHASE_MODE;
  expect((await GET(request())).status).toBe(503);
  expect(retryGooglePurchases).not.toHaveBeenCalled();
});
it.each([0, 1])(
  "reports delivery health separately from worker execution (%s failures)",
  async (failed) => {
    jest
      .mocked(retryGooglePurchases)
      .mockResolvedValue({
        checked: 1,
        received: 1 - failed,
        retry: 0,
        failed,
        disabled: 0,
        workerErrors: 0,
        hasMore: false,
      });
    const response = await GET(request());
    expect(response.status).toBe(failed ? 503 : 200);
    expect(await response.json()).toMatchObject({ healthy: !failed });
  },
);
