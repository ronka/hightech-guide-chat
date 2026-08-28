"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";
import {
  browserAnalyticsEnabled,
  GA_MEASUREMENT_ID,
} from "@/services/analytics-config";
import {
  getTrackingConsent,
  getServerTrackingConsent,
  subscribeTrackingConsent,
} from "@/services/analytics-consent";
import { flushAnalyticsEvents } from "@/services/analytics";

export function GoogleTag() {
  const consent = useSyncExternalStore(
    subscribeTrackingConsent,
    getTrackingConsent,
    getServerTrackingConsent,
  );
  if (!browserAnalyticsEnabled("google") || consent.analytics !== "granted")
    return null;
  return (
    <>
      <Script
        id="google-tag-init"
        strategy="afterInteractive"
        // Next calls inline onReady before insertion. Flush after the stub exists.
        onReady={() => queueMicrotask(flushAnalyticsEvents)}
      >
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('consent', 'default', {
            analytics_storage: 'granted',
            ad_storage: '${consent.marketing === "granted" ? "granted" : "denied"}',
            ad_user_data: '${consent.marketing === "granted" ? "granted" : "denied"}',
            ad_personalization: '${consent.marketing === "granted" ? "granted" : "denied"}'
          });
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
      <Script
        id="google-tag"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
    </>
  );
}
