// Owner-selected no-prompt policy (2026-08-28). "granted" is the SDK permission
// state, not a record that the visitor clicked Accept or a legal determination.
// Environment/destination gates still control whether either provider can run.
// Explicit runtime overrides remain supported; no consent record is persisted.
export type ConsentState = "unknown" | "granted" | "denied";
export type TrackingConsent = Readonly<{
  analytics: ConsentState;
  marketing: ConsentState;
}>;
const unknown: TrackingConsent = Object.freeze({
  analytics: "unknown",
  marketing: "unknown",
});
let consent: TrackingConsent = Object.freeze({
  analytics: "granted",
  marketing: "granted",
});
const listeners = new Set<() => void>();

export const getTrackingConsent = () => consent;
// Keep SSR and the first hydration render tag-free; the browser snapshot then
// activates the configured providers without requiring a banner interaction.
export const getServerTrackingConsent = () => unknown;
export function subscribeTrackingConsent(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setTrackingConsent(next: TrackingConsent) {
  if (typeof window === "undefined") return;
  const valid = (value: unknown): value is ConsentState =>
    value === "unknown" || value === "granted" || value === "denied";
  if (!valid(next.analytics) || !valid(next.marketing))
    throw new Error("Invalid tracking consent");
  if (
    next.analytics === consent.analytics &&
    next.marketing === consent.marketing
  )
    return;
  consent = Object.freeze({
    analytics: next.analytics,
    marketing: next.marketing,
  });
  for (const listener of listeners) listener();
}
