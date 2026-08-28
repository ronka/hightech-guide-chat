import React, { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { GoogleTag } from "../../src/components/google-tag";
import { FacebookPixel } from "../../src/components/facebook-pixel";
import { ProductView } from "../../src/components/product-view";
import { setTrackingConsent } from "../../src/services/analytics-consent";
import { trackCheckout } from "../../src/services/checkout-analytics";
import { track } from "../../src/services/analytics";

// This file is bundled only by the test runner, never served by Next production.
// Default route exercises the owner's no-prompt policy without a grant call.
// A separate route preserves coverage for explicit runtime permission overrides.
if (window.location.pathname === "/permission-overrides")
  setTrackingConsent({ analytics: "unknown", marketing: "unknown" });
Reflect.set(window, "trackingSnapshot", () => ({
  google: Array.from(Reflect.get(window, "dataLayer") || [], (args: unknown) =>
    Array.from(args as ArrayLike<unknown>),
  ),
  meta: Array.from(
    window.fbq ? Reflect.get(window.fbq, "queue") || [] : [],
    (args: unknown) => Array.from(args as ArrayLike<unknown>),
  ),
}));

function Fixture() {
  const [visit, setVisit] = useState(0);
  return (
    <>
      <h1>Isolated tracking contract test</h1>
      <button
        type="button"
        onClick={() =>
          setTrackingConsent({ analytics: "granted", marketing: "unknown" })
        }
      >
        Allow analytics
      </button>
      <button
        type="button"
        onClick={() =>
          setTrackingConsent({ analytics: "granted", marketing: "granted" })
        }
      >
        Allow both
      </button>
      <button
        type="button"
        onClick={() =>
          setTrackingConsent({ analytics: "denied", marketing: "denied" })
        }
      >
        Revoke
      </button>
      <button
        type="button"
        onClick={() =>
          trackCheckout("physical-book", { source: "browser-test" })
        }
      >
        Checkout
      </button>
      <button
        type="button"
        onClick={() => track("social_link_click", { source: "browser-test" })}
      >
        Social
      </button>
      <button type="button" onClick={() => setVisit((value) => value + 1)}>
        New visit
      </button>
      <ProductView key={visit} product="physical-book" source="browser-test" />
      <GoogleTag />
      <FacebookPixel />
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
);
