// Public IDs are not credentials. Keep production IDs explicit so a test setup
// cannot accidentally use them. Server API secrets must never be NEXT_PUBLIC.
export const PRODUCTION_GA_ID = "G-07PEBMF7K9";
export const PRODUCTION_FB_ID = "1152278206328522";
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || PRODUCTION_GA_ID;
export const FB_PIXEL_ID =
  process.env.NEXT_PUBLIC_FB_PIXEL_ID || PRODUCTION_FB_ID;

export function browserAnalyticsEnabled(provider: "google" | "facebook") {
  if (typeof window === "undefined") return false;
  const mode = process.env.NEXT_PUBLIC_ANALYTICS_MODE;
  const id = provider === "google" ? GA_MEASUREMENT_ID : FB_PIXEL_ID;
  if (!(provider === "google" ? /^G-[A-Z0-9]+$/ : /^\d+$/).test(id))
    return false;
  if (mode === "test") {
    return id !== PRODUCTION_GA_ID && id !== PRODUCTION_FB_ID;
  }
  return (
    mode === "production" &&
    process.env.NODE_ENV === "production" &&
    (!process.env.NEXT_PUBLIC_VERCEL_ENV ||
      process.env.NEXT_PUBLIC_VERCEL_ENV === "production") &&
    Boolean(process.env.NEXT_PUBLIC_ANALYTICS_HOSTNAME) &&
    window.location.hostname === process.env.NEXT_PUBLIC_ANALYTICS_HOSTNAME
  );
}
