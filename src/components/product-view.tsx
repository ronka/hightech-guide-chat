"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { browserAnalyticsEnabled } from "@/services/analytics-config";
import {
  getTrackingConsent,
  getServerTrackingConsent,
  subscribeTrackingConsent,
} from "@/services/analytics-consent";
import {
  trackProductView,
  type CheckoutProduct,
} from "@/services/checkout-analytics";

export function ProductView({
  product,
  source,
}: { product: CheckoutProduct; source: string }) {
  const consent = useSyncExternalStore(
    subscribeTrackingConsent,
    getTrackingConsent,
    getServerTrackingConsent,
  );
  // Per actual page mount, not global/session dedupe: navigating back is a new
  // impression. Also survives React StrictMode's repeated effect setup.
  const reported = useRef({
    product,
    google: false,
    facebook: false,
    posthog: false,
  });
  useEffect(() => {
    if (reported.current.product !== product)
      reported.current = {
        product,
        google: false,
        facebook: false,
        posthog: false,
      };
    const google =
      !reported.current.google &&
      browserAnalyticsEnabled("google") &&
      consent.analytics === "granted";
    const facebook =
      !reported.current.facebook &&
      browserAnalyticsEnabled("facebook") &&
      consent.marketing === "granted";
    const posthog = !reported.current.posthog;
    if (!google && !facebook && !posthog) return;
    trackProductView(product, source, { google, facebook, posthog });
    reported.current.google ||= google;
    reported.current.facebook ||= facebook;
    reported.current.posthog ||= posthog;
  }, [product, source, consent]);
  return null;
}
