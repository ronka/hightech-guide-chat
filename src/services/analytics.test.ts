jest.mock("posthog-js", () => ({
  __esModule: true,
  default: { capture: jest.fn(), init: jest.fn() },
}));

import posthog from "posthog-js";
import { flushAnalyticsEvents, track } from "./analytics";
import { GA_MEASUREMENT_ID } from "./analytics-config";
import { setTrackingConsent } from "./analytics-consent";
jest.mock("./analytics-config", () => ({
  ...jest.requireActual("./analytics-config"),
  browserAnalyticsEnabled: jest.fn(() => true),
}));

beforeEach(() => {
  setTrackingConsent({ analytics: "granted", marketing: "granted" });
  window.gtag = jest.fn();
  window.fbq = jest.fn();
  flushAnalyticsEvents();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

it("reports a checkout once to each provider with provider-specific product data", () => {
  const items = [{ item_id: "course", quantity: 1, price: 99 }];
  const params = {
    value: 99,
    currency: "ILS",
    items,
    content_ids: ["course"],
    contents: [{ id: "course", quantity: 1 }],
    num_items: 1,
  };
  track("begin_checkout", params);
  expect(posthog.capture).toHaveBeenCalledTimes(1);
  expect(window.gtag).toHaveBeenCalledTimes(1);
  expect(window.gtag).toHaveBeenCalledWith("event", "begin_checkout", {
    value: 99,
    currency: "ILS",
    items,
    send_to: GA_MEASUREMENT_ID,
  });
  expect(window.fbq).toHaveBeenCalledTimes(1);
  expect(window.fbq).toHaveBeenCalledWith("track", "InitiateCheckout", {
    value: 99,
    currency: "ILS",
    content_ids: ["course"],
    contents: [{ id: "course", quantity: 1 }],
    num_items: 1,
  });
});

it.each([
  "consulting_click",
  "book_click",
  "course_interest_click",
  "cv_analyzed",
  "like_word",
  "video_play",
  "chat_message_sent",
  "cv_file_selected",
  "cv_analysis_error",
  "cv_analysis_reset",
  "cv_analysis_feedback",
  "term_viewed",
  "term_shared",
  "question_viewed",
  "questions_filtered",
  "links_link_click",
  "meetup_link_click",
  "social_link_click",
  "course_page_view",
  "course_section_click",
  "testimonial_interaction",
  "video_loaded",
] as const)(
  "%s is a custom event, not a cart, lead or purchase conversion",
  (name) => {
    track(name, { source: "test" });
    expect(window.fbq).toHaveBeenCalledWith("trackCustom", name, {
      source: "test",
    });
    expect(window.gtag).toHaveBeenCalledWith(
      "event",
      name,
      expect.objectContaining({ source: "test" }),
    );
  },
);

it.each([
  ["page_view", "PageView"],
  ["sign_up", "CompleteRegistration"],
  ["complete_registration", "CompleteRegistration"],
  ["contact", "Contact"],
  ["purchase", "Purchase"],
  ["start_trial", "StartTrial"],
  ["subscribe", "Subscribe"],
  ["view_content", "ViewContent"],
  ["view_item", "ViewContent"],
  ["add_to_cart", "AddToCart"],
  ["dictionary_searched", "Search"],
] as const)("maps deliberate %s to %s", (name, metaName) => {
  track(name, { source: "test" });
  expect(window.fbq).toHaveBeenCalledWith("track", metaName, {
    source: "test",
  });
});

it("drops unknown/denied-consent events instead of replaying them after grant", () => {
  setTrackingConsent({ analytics: "unknown", marketing: "denied" });
  jest.clearAllMocks();
  track("begin_checkout", { source: "without-consent" });
  expect(window.gtag).not.toHaveBeenCalled();
  expect(window.fbq).not.toHaveBeenCalled();
  setTrackingConsent({ analytics: "granted", marketing: "granted" });
  jest.clearAllMocks();
  flushAnalyticsEvents();
  expect(window.gtag).not.toHaveBeenCalled();
  expect(window.fbq).not.toHaveBeenCalled();
});

it("clears pending queues and revokes loaded SDKs on withdrawal", () => {
  window.gtag = undefined;
  window.fbq = undefined;
  track("begin_checkout");
  window.gtag = jest.fn();
  window.fbq = jest.fn();
  setTrackingConsent({ analytics: "denied", marketing: "denied" });
  expect(window.gtag).toHaveBeenCalledWith(
    "consent",
    "update",
    expect.objectContaining({ analytics_storage: "denied" }),
  );
  expect(window.fbq).toHaveBeenCalledWith("consent", "revoke");
  expect(Reflect.get(window, `ga-disable-${GA_MEASUREMENT_ID}`)).toBe(true);
  setTrackingConsent({ analytics: "granted", marketing: "granted" });
  jest.clearAllMocks();
  flushAnalyticsEvents();
  expect(window.gtag).not.toHaveBeenCalled();
  expect(window.fbq).not.toHaveBeenCalled();
});

it("keeps analytics and marketing permission independent", () => {
  setTrackingConsent({ analytics: "granted", marketing: "denied" });
  jest.clearAllMocks();
  track("lead");
  expect(window.gtag).toHaveBeenCalledTimes(1);
  expect(window.fbq).not.toHaveBeenCalled();
});

it("maps a confirmed lead to Google generate_lead and Meta Lead", () => {
  track("lead", { source: "contact-form" });
  expect(window.fbq).toHaveBeenCalledWith("track", "Lead", {
    source: "contact-form",
  });
  expect(window.gtag).toHaveBeenCalledWith(
    "event",
    "generate_lead",
    expect.objectContaining({ source: "contact-form" }),
  );
});

it("queues early events until initialization and flushes them only once", () => {
  window.gtag = undefined;
  window.fbq = undefined;
  track("dictionary_searched", { search_term: "React" });
  track("begin_checkout", { source: "hero" });
  window.gtag = jest.fn();
  flushAnalyticsEvents();
  expect(window.gtag).toHaveBeenCalledTimes(2);
  window.fbq = jest.fn();
  flushAnalyticsEvents();
  flushAnalyticsEvents();
  expect(window.fbq).toHaveBeenCalledTimes(2);
  expect(window.fbq).toHaveBeenNthCalledWith(1, "track", "Search", {
    search_term: "React",
  });
  expect(window.gtag).toHaveBeenCalledTimes(2);
  expect(posthog.capture).toHaveBeenCalledTimes(2);
});

it("bounds queues when providers never initialize", () => {
  window.gtag = undefined;
  window.fbq = undefined;
  for (let index = 0; index < 150; index++) track("book_click", { index });
  window.gtag = jest.fn();
  window.fbq = jest.fn();
  flushAnalyticsEvents();
  expect(window.gtag).toHaveBeenCalledTimes(100);
  expect(window.fbq).toHaveBeenCalledTimes(100);
});

it("isolates provider failures so checkout and other trackers still work", () => {
  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.mocked(posthog.capture).mockImplementationOnce(() => {
    throw new Error("PostHog unavailable");
  });
  window.gtag = jest.fn(() => {
    throw new Error("Google unavailable");
  });
  expect(() => track("begin_checkout")).not.toThrow();
  expect(window.fbq).toHaveBeenCalledWith("track", "InitiateCheckout", {});
});
