const originalEnv = process.env;
beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
  delete process.env.NEXT_PUBLIC_ANALYTICS_MODE;
  delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  delete process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  delete process.env.NEXT_PUBLIC_ANALYTICS_HOSTNAME;
});
afterEach(() => {
  process.env = originalEnv;
});
const config = () =>
  require("./analytics-config") as typeof import("./analytics-config");

it("defaults disabled even though production IDs are known", () => {
  expect(config().browserAnalyticsEnabled("google")).toBe(false);
  expect(config().browserAnalyticsEnabled("facebook")).toBe(false);
});
it("cannot send test traffic to the known production destinations", () => {
  process.env.NEXT_PUBLIC_ANALYTICS_MODE = "test";
  expect(config().browserAnalyticsEnabled("google")).toBe(false);
  expect(config().browserAnalyticsEnabled("facebook")).toBe(false);
});
it("allows explicitly isolated test IDs", () => {
  process.env.NEXT_PUBLIC_ANALYTICS_MODE = "test";
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";
  process.env.NEXT_PUBLIC_FB_PIXEL_ID = "123456";
  expect(config().browserAnalyticsEnabled("google")).toBe(true);
  expect(config().browserAnalyticsEnabled("facebook")).toBe(true);
});
it.each(["preview", "development"])(
  "does not enable production in %s",
  (environment) => {
    process.env.NEXT_PUBLIC_ANALYTICS_MODE = "production";
    process.env.NEXT_PUBLIC_ANALYTICS_HOSTNAME = window.location.hostname;
    process.env.NEXT_PUBLIC_VERCEL_ENV = environment;
    expect(config().browserAnalyticsEnabled("google")).toBe(false);
  },
);
it("requires a production build and the exact approved hostname", () => {
  process.env = {
    ...process.env,
    NODE_ENV: "production",
    NEXT_PUBLIC_VERCEL_ENV: "production",
    NEXT_PUBLIC_ANALYTICS_MODE: "production",
  };
  process.env.NEXT_PUBLIC_ANALYTICS_HOSTNAME = "other.example";
  expect(config().browserAnalyticsEnabled("google")).toBe(false);
  process.env.NEXT_PUBLIC_ANALYTICS_HOSTNAME = window.location.hostname;
  expect(config().browserAnalyticsEnabled("google")).toBe(true);
});
