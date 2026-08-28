const loadConsent = () =>
  require("./analytics-consent") as typeof import("./analytics-consent");

beforeEach(() => jest.resetModules());

it("starts browser tracking under the owner's no-prompt policy without a grant call", () => {
  const { getTrackingConsent } = loadConsent();
  expect(getTrackingConsent()).toEqual({
    analytics: "granted",
    marketing: "granted",
  });
  expect(Object.isFrozen(getTrackingConsent())).toBe(true);
});

it("keeps the server snapshot unknown so tags wait for browser hydration", () => {
  const { getServerTrackingConsent } = loadConsent();
  expect(getServerTrackingConsent()).toEqual({
    analytics: "unknown",
    marketing: "unknown",
  });
  expect(getServerTrackingConsent()).toBe(getServerTrackingConsent());
});

it("still honors explicit denial without resetting it to the site default", () => {
  const { getTrackingConsent, setTrackingConsent, subscribeTrackingConsent } =
    loadConsent();
  const changed = jest.fn();
  const unsubscribe = subscribeTrackingConsent(changed);
  setTrackingConsent({ analytics: "denied", marketing: "denied" });
  expect(getTrackingConsent()).toEqual({
    analytics: "denied",
    marketing: "denied",
  });
  setTrackingConsent({ analytics: "denied", marketing: "denied" });
  expect(changed).toHaveBeenCalledTimes(1);
  unsubscribe();
  setTrackingConsent({ analytics: "unknown", marketing: "unknown" });
  expect(changed).toHaveBeenCalledTimes(1);
});
