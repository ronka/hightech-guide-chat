import posthog from "posthog-js";

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
  | "like_word"
  | "add_to_cart"
  | "video_play"
  | "chat_message_sent"
  | "cv_file_selected"
  | "cv_analyzed"
  | "cv_analysis_error"
  | "cv_analysis_reset"
  | "dictionary_searched"
  | "term_viewed"
  | "term_shared"
  | "question_viewed"
  | "questions_filtered"
  | "book_click"
  | "consulting_click";

// Map PostHog events to Facebook standard events
const fbEventMap: Record<EventName, string> = {
  page_view: "PageView",
  sign_up: "CompleteRegistration",
  complete_registration: "CompleteRegistration",
  contact: "Contact",
  purchase: "Purchase",
  start_trial: "StartTrial",
  subscribe: "Subscribe",
  lead: "Lead",
  view_content: "ViewContent",
  like_word: "ViewContent",
  add_to_cart: "AddToCart",
  video_play: "ViewContent",
  chat_message_sent: "ViewContent",
  cv_file_selected: "ViewContent",
  cv_analyzed: "Lead",
  cv_analysis_error: "ViewContent",
  cv_analysis_reset: "ViewContent",
  dictionary_searched: "Search",
  term_viewed: "ViewContent",
  term_shared: "ViewContent",
  question_viewed: "ViewContent",
  questions_filtered: "ViewContent",
  book_click: "AddToCart",
  consulting_click: "Lead",
};

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

export function track(eventName: EventName, params: any = {}) {
  // Check that PostHog is client-side
  if (typeof window !== "undefined") {
    // Track in PostHog
    console.log("posthog.capture", eventName, params);
    posthog.capture(eventName, params);

    // Track in Facebook Pixel if there's a mapping
    if (window.fbq && fbEventMap[eventName]) {
      console.log("fbq.track", fbEventMap[eventName], params);
      window.fbq("track", fbEventMap[eventName], params);
    }
  }
}

// Add type declaration for fbq
declare global {
  interface Window {
    fbq?: (track: string, eventName: string, params?: any) => void;
  }
}
