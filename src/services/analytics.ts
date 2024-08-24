import posthog from "posthog-js";

export function initAnaylitcs() {
  // Check that PostHog is client-side (used to handle Next.js SSR)
  if (typeof window !== "undefined") {
    posthog.init("phc_8zRs4GR69BHYYEa2zLXdNJU7jONikRVzbFQko5Vy3jK", {
      api_host: "https://us.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: false, // Disable automatic pageview capture, as we capture manually
    });
  }
}

export function track(eventName: string, params: any) {
  // Check that PostHog is client-side (used to handle Next.js SSR)
  if (typeof window !== "undefined") {
    console.log("posthog.capture", eventName, params);
    posthog.capture(eventName, params);
  }
}
