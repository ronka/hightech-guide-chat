// URL hygiene only. These parameters do NOT prove Grow echoes a checkout ref.
const campaignParameters = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_id",
  "utm_term",
  "utm_content",
  "gclid",
  "dclid",
  "gbraid",
  "wbraid",
  "fbclid",
] as const;

export function checkoutUrl(href: string, pageQuery: URLSearchParams) {
  const url = new URL(href);
  for (const key of campaignParameters) {
    const value = pageQuery.get(key);
    if (value && value.length <= 500 && !url.searchParams.has(key))
      url.searchParams.set(key, value);
  }
  return url.toString();
}
