# Conversion tracking

## Status: local implementation verified, not launch-ready

Google/Meta delivery defaults **off** until explicitly enabled in environment configuration. Once configured, browser tags start automatically without a consent banner or a `setTrackingConsent()` call, under the owner's no-prompt policy selected on 2026-08-28. No production environment, database migration, Grow setting, provider account or campaign was changed by this implementation.

The owner accepted **limited Meta matching** on 2026-08-28 and ruled out a checkout reference round trip. Keep existing static Grow links. Meta purchases use hashed payer email from the authenticated webhook; no browser-to-order join, Facebook browser/click identifiers or API-created checkout is planned. Missing correlation is an accepted limitation, not an unfinished requirement. This does not establish provider acceptance or attribution of each purchase to a visit/ad.

App-side Google purchase replacement is deferred. The static webhook has no verified browser reference: Google records are saved with `missing_verified_attribution` and do **not** send. Merely enabling the Google environment variable will not fix this. The current sender requires `VerifiedGoogleContext`, which this flow cannot supply. Do not guess callback fields, use buyer email/time as a local join, or assign a newly generated GA client ID. A different Google integration requires a separate decision and validation.

Keep Grow's Google purchase reporting active until the replacement is connected, validated and cut over with one purchase owner.

## Event contract

| Actual action | Google | Meta |
|---|---|---|
| Offered product impression | `view_item`, canonical `items` | `ViewContent`, matching `content_ids` |
| Grow checkout start | `begin_checkout` | `InitiateCheckout` |
| Successful on-site Formspree submission | `generate_lead` | `Lead` |
| Validated paid webhook | Server `purchase`, only with verified context | Server `Purchase`, when configured and eligible |
| Social profile visit | `social_link_click` | Custom `social_link_click`, not Contact |
| Video iframe load, accordion click, testimonial interaction | Accurate named custom event | Custom event, not ViewContent |
| Consulting/bookstore/AI-interest clicks; CV/chat/dictionary/question interactions | Named interaction | Custom event, except actual search maps to Search |

There are no browser purchase events on public thank-you pages. Failed/pending payments do not produce paid entitlements or conversions. Lead failure/submitting states do not produce leads. External forms are click-only until their confirmed submissions are integrated.

Canonical product IDs live in the pure `src/services/product-catalog.ts`: `physical-book`, `digital-book`, `job-interview-course`. Books have no invented price; the verified course advertised price remains 99 ILS. Product impressions are once per mounted visit and per eligible provider, including staggered consent grants and React StrictMode; a real later visit can count again.

Page views remain owned by the base tags and account settings. Do not add another SPA reporter without checking actual provider diagnostics. Chat's internal ID is now `chat_session_id`, not Google's reserved `session_id`.

## Browser environment and owner-selected no-prompt policy

Configuration is in `.env.example`:

- `NEXT_PUBLIC_ANALYTICS_MODE=production` requires a production build and exact `NEXT_PUBLIC_ANALYTICS_HOSTNAME`; Vercel preview/development builds are not production senders.
- `NEXT_PUBLIC_ANALYTICS_MODE=test` requires separate `NEXT_PUBLIC_GA_MEASUREMENT_ID` and `NEXT_PUBLIC_FB_PIXEL_ID`; the known production destinations are rejected in test mode.
- Unset/disabled mode loads neither Google nor Meta, including the Meta noscript beacon.
- Browser SDK permissions in `src/services/analytics-consent.ts` default to `granted` under the owner-selected policy. This is a configuration state, not evidence that a visitor accepted tracking. No banner or acceptance record is created. The server/first hydration snapshot remains `unknown` so tags only activate in the configured browser context.
- Explicit `setTrackingConsent()` overrides remain available and honored: unknown/denied events are dropped, not replayed on a later grant. Revocation clears application queues and queued SDK events, updates Google's consent/disable flag and sends Meta's revoke command. Loaded SDKs cannot be stopped merely by unmounting Script. These overrides are in-memory, not a persistent preference UI.
- The owner described the audience as Israel-only. This implementation does not geolocate or restrict visitors and does not establish legal or platform-policy compliance. Reassess the policy if the audience or requirements change.
- PostHog remains unchanged. Meta server purchases use the owner-selected no-prompt policy independently of browser state; there is no buyer consent lookup or browser override propagation into Grow purchases. Do not describe payment, hashing or SDK `granted` defaults as proof of individual consent.

The original Next inline `onReady` ordering fix is preserved: queue flushing occurs in a microtask after the inline stub exists. This is initialization correctness, not proof of network delivery. Same-tab navigation before an external SDK loads can still lose browser-only checkout events; checkout delivery reliability remains unfinished but does not require Grow to return a reference. Any first-party event intake must not be described as a purchase correlation mechanism. BuyButton now forwards only bounded campaign parameters, never arbitrary email/token/payment query fields. Direct `/book` and `/ebook` redirects are unchanged and should not be used as attributed ad landing pages without separate work.

## Payment transaction and independent delivery

The authenticated paid callback validates status, known payment link/product, payer email, positive paid total and item quantities. It atomically saves the entitlement, a Meta job and a Google job. Immediate delivery attempts are independent; one provider's failure does not stop the other or revoke access. The unique transaction/event keys preserve first payload and timestamp across duplicates.

Meta retains `grow:purchase:<transactionId>`, actual paid gross total, item quantities and hashed email. It does not substitute Grow's webhook IP/user-agent for the buyer or invent browser/click IDs. Its seven-day event deadline is enforced without rewriting timestamps.

Google's builder accepts only a verified server context, real client/session identifiers, explicit analytics permission, and net unit amounts plus separate tax/shipping. It reconciles these to the webhook's actual paid total in integer cents. Transaction ID, currency and first-receipt time are derived from the payment record, not browser claims. Missing context, mismatched product/quantity, missing configuration or invalid amounts produce a visible suppression reason while valid purchase access remains available.

Google validates through the Measurement Protocol validation endpoint before collection. `sentAt` in its outbox means **transport receipt**, not confirmed attribution. Its event backdating and session-attribution deadlines differ from Meta's; the sender conservatively stops after the original session's 24-hour attribution deadline and the event's separate 72-hour window. Invalid/rejected/expired requests are quarantined for review; uncertain network failures retry with the same transaction ID. No invented engagement duration is sent.

Neither sender establishes absolute exactly-once delivery across external systems. Crash recovery may resend an accepted event using its original ID. Do not reset IDs/timestamps or replay historical/suppressed conversions automatically.

## Migrations and server configuration

Apply additive migrations through the normal, explicitly authorized deployment process before deploying the new webhook:

- `0003_meta_purchase_outbox.sql`: existing Meta outbox.
- `0004_abnormal_the_renegades.sql`: pinned Meta destination/mode.
- `0005_narrow_captain_midlands.sql`: independent Google outbox, including suppression and delivery state.

`npm run db:generate` does not apply migrations. No production migrations were run here. Existing Meta rows with a null destination remain unsent pending operator review; do not bulk infer their original destination or re-enqueue already-sent rows.

Server-only configuration:

| Variable | Purpose |
|---|---|
| `GROW_WEBHOOK_KEY` | Shared secret in callback URL query or trusted header; Grow preservation must be verified. |
| `META_PURCHASE_MODE` | Unset/disabled, test, or explicitly enabled production. |
| `META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN` | Server destination and credential; destination pinned per job. |
| `META_TEST_EVENT_CODE` | Required with a separate pixel in test mode; persisted per job. |
| `GOOGLE_PURCHASE_MODE` | Unset/disabled, test, or explicitly enabled production. |
| `GA_PURCHASE_MEASUREMENT_ID`, `GA_MEASUREMENT_PROTOCOL_SECRET` | Separate Google server destination and secret. |
| `CRON_SECRET` | Bearer authentication for retry endpoints. |

Production mode additionally requires a production runtime and not a Vercel preview/development environment. A changed destination or test/live mode does not silently reroute old jobs. Test traffic must use isolated destinations. The owner has chosen no-prompt, email-only Meta reporting; configuration is not evidence of individual consent or legal compliance. Real provider validation and explicit deployment approval are still required before activation.

Grow callback authentication remains mandatory. Coordinate the URL/header and migrations before rollout so existing payment notifications are not rejected. Never expose callback secrets in logs, URLs shown to users, or public environment variables.

## Retry capacity and monitoring

- `/api/cron/meta-purchases` remains on the existing daily schedule in `vercel.json`; the worker now drains up to 200 healthy due jobs per run, four at a time, with a 45-second start-of-wave budget. Slow failures process fewer, leaving leases/retries intact.
- `/api/cron/google-purchases` is implemented but **not scheduled**. Configure an approved frequent scheduler before enabling Google; a daily fallback is insufficient for reliable recovery inside its session deadline.
- Both routes require `CRON_SECRET` and valid provider configuration. They report counts and `hasMore`; batch failures return HTTP 503/`healthy: false`, not an unconditional healthy 200.
- Inspect unsent, expired/failed, suppressed and destination-mismatch rows. A healthy batch is not a historical backlog health check. Persistent backlog-age metrics, production alert thresholds/destination and scheduler capacity confirmation remain launch tasks.
- Errors retain safe categories, HTTP status and numeric Meta error code; no raw response, email, cookie or credential is stored as diagnostics.

## Verification and handoff

`npm test -- --runInBand`, `npm run test:analytics:db`, `npm run test:analytics:e2e`, `npm run build:analytics:test`, and `npx tsc --noEmit --incremental false` exercise local behavior without live conversions. See `tests/analytics/README.md` for exact coverage and prerequisites.

`npm run check:tracking:launch` intentionally fails until implementation, actual provider validation and cutover all have passing evidence. The pending work is recorded in `docs/tracking-launch-evidence.json` and the ordered plan. Local tests do not replace real isolated payments, no-return purchases, provider reporting/attribution checks, custom conversion rules or a controlled Grow-tag cutover.

References: [Grow webhooks](https://developers.grow.business/docs/webhooks), [GA4 ecommerce](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce), [Measurement Protocol reference](https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference), [attribution use cases](https://developers.google.com/analytics/devguides/collection/protocol/ga4/use-cases), [validation](https://developers.google.com/analytics/devguides/collection/protocol/ga4/validating-events), [Google consent](https://developers.google.com/tag-platform/security/guides/consent).
