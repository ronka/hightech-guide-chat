import posthog from "posthog-js";
import { browserAnalyticsEnabled, GA_MEASUREMENT_ID } from "./analytics-config";
import {
  getTrackingConsent,
  subscribeTrackingConsent,
} from "./analytics-consent";

// Define all possible event names as a type
export type EventName =
  | "page_view"
  | "sign_up"
  | "complete_registration"
  | "contact"
  | "purchase"
  | "start_trial"
  | "subscribe"
  | "lead"
  | "view_content"
  | "view_item"
  | "social_link_click"
  | "course_page_view"
  | "course_section_click"
  | "testimonial_interaction"
  | "video_loaded"
  | "like_word"
  | "add_to_cart"
  | "begin_checkout"
  | "course_interest_click"
  | "video_play"
  | "chat_message_sent"
  | "cv_file_selected"
  | "cv_analyzed"
  | "cv_analysis_error"
  | "cv_analysis_reset"
  | "cv_analysis_feedback"
  | "dictionary_searched"
  | "term_viewed"
  | "term_shared"
  | "question_viewed"
  | "questions_filtered"
  | "book_click"
  | "consulting_click"
  | "links_link_click"
  | "meetup_link_click";

// Map PostHog events to Facebook standard events
const fbEventMap: Partial<Record<EventName, string>> = {
  page_view: "PageView",
  sign_up: "CompleteRegistration",
  complete_registration: "CompleteRegistration",
  contact: "Contact",
  purchase: "Purchase",
  start_trial: "StartTrial",
  subscribe: "Subscribe",
  lead: "Lead",
  view_content: "ViewContent",
  view_item: "ViewContent",
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
  dictionary_searched: "Search",
};

type EventParams = Record<string, unknown>;
type PendingEvent = { name: EventName; params: EventParams };
// Page effects can run before next/script's afterInteractive initialization.
// Bound the queues when a tracker never loads (for example, an ad blocker).
const pendingGoogle: PendingEvent[] = [];
const pendingFacebook: PendingEvent[] = [];
const MAX_PENDING_EVENTS = 100;

function queue(events: PendingEvent[], event: PendingEvent) {
  if (events.length === MAX_PENDING_EVENTS) events.shift();
  events.push(event);
}

function reportGoogle({ name, params }: PendingEvent) {
  const googleName = name === "lead" ? "generate_lead" : name;
  const { content_ids, contents, num_items, ...googleParams } = params;
  window.gtag?.("event", googleName, {
    ...googleParams,
    // Keep app events scoped to GA4; Google Ads conversion imports are configured separately.
    send_to: GA_MEASUREMENT_ID,
  });
}

function reportFacebook({ name, params }: PendingEvent) {
  const standardName = fbEventMap[name];
  // Items use Google's schema. Meta receives its own product fields instead.
  const { items, ...facebookParams } = params;
  window.fbq?.(
    standardName ? "track" : "trackCustom",
    standardName ?? name,
    facebookParams,
  );
}

function safely(report: () => void) {
  try {
    report();
  } catch {
    // Analytics must not prevent navigation/submission or delivery to another provider.
    console.warn("Analytics event delivery failed");
  }
}

export function flushAnalyticsEvents() {
  if (typeof window === "undefined") return;
  const consent = getTrackingConsent();
  if (!browserAnalyticsEnabled("google") || consent.analytics !== "granted")
    pendingGoogle.length = 0;
  if (!browserAnalyticsEnabled("facebook") || consent.marketing !== "granted")
    pendingFacebook.length = 0;
  if (window.gtag) {
    while (pendingGoogle.length) {
      const event = pendingGoogle.shift();
      if (event) safely(() => reportGoogle(event));
    }
  }
  if (window.fbq) {
    while (pendingFacebook.length) {
      const event = pendingFacebook.shift();
      if (event) safely(() => reportFacebook(event));
    }
  }
}

subscribeTrackingConsent(() => {
  if (typeof window === "undefined") return;
  const consent = getTrackingConsent();
  // SDK stubs can still be waiting on their network script. Withdraw queued
  // events there as well as in our own queues; retain init/config commands.
  const discardStubEvents = (queue: unknown, commands: string[]) => {
    if (!Array.isArray(queue)) return;
    for (let index = queue.length - 1; index >= 0; index--) {
      const entry = queue[index];
      if (
        entry &&
        typeof entry === "object" &&
        commands.includes(Reflect.get(entry, "0"))
      )
        queue.splice(index, 1);
    }
  };
  if (consent.analytics !== "granted")
    discardStubEvents(Reflect.get(window, "dataLayer"), ["event"]);
  if (consent.marketing !== "granted" && window.fbq)
    discardStubEvents(Reflect.get(window.fbq, "queue"), [
      "track",
      "trackCustom",
    ]);
  // Stop already-loaded SDKs too; hiding a Script component is not revocation.
  Reflect.set(
    window,
    `ga-disable-${GA_MEASUREMENT_ID}`,
    consent.analytics !== "granted",
  );
  safely(() =>
    window.gtag?.("consent", "update", {
      analytics_storage: consent.analytics === "granted" ? "granted" : "denied",
      ad_storage: consent.marketing === "granted" ? "granted" : "denied",
      ad_user_data: consent.marketing === "granted" ? "granted" : "denied",
      ad_personalization:
        consent.marketing === "granted" ? "granted" : "denied",
    }),
  );
  safely(() =>
    window.fbq?.(
      "consent",
      consent.marketing === "granted" ? "grant" : "revoke",
    ),
  );
  flushAnalyticsEvents();
});

export function initAnaylitcs() {
  // Check that PostHog is client-side (used to handle Next.js SSR)
  if (typeof window !== "undefined") {
    posthog.init("phc_8zRs4GR69BHYYEa2zLXdNJU7jONikRVzbFQko5Vy3jK", {
      api_host: "https://us.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: false,
    });
  }
}

export type TrackingDestinations = {
  google?: boolean;
  facebook?: boolean;
  posthog?: boolean;
};
export function track(
  eventName: EventName,
  params: EventParams = {},
  destinations: TrackingDestinations = {},
) {
  // Check that PostHog is client-side
  if (typeof window !== "undefined") {
    // Track in PostHog
    if (destinations.posthog !== false)
      safely(() => posthog.capture(eventName, params));
    const event = { name: eventName, params: { ...params } };
    const consent = getTrackingConsent();
    if (
      destinations.google !== false &&
      browserAnalyticsEnabled("google") &&
      consent.analytics === "granted"
    )
      queue(pendingGoogle, event);
    if (
      destinations.facebook !== false &&
      browserAnalyticsEnabled("facebook") &&
      consent.marketing === "granted"
    )
      queue(pendingFacebook, event);
    flushAnalyticsEvents();
  }
}

// Add type declaration for fbq
declare global {
  interface Window {
    fbq?: (track: string, eventName: string, params?: EventParams) => void;
    gtag?: (
      command: "event" | "consent",
      eventName: string,
      params: EventParams,
    ) => void;
  }
}
