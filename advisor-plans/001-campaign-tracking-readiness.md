# Plan 001: Make Google and Meta conversions ready for campaign launch

> Executor: read this entire plan before editing. Execute the steps in order, run each verification, and update the checkboxes and index as work progresses. Do not infer permission to deploy, change provider accounts, make payments, or start campaigns from this document. Stop at the external decision gates rather than guessing.
>
> This is an implementation plan, not a statement that tracking is launch-ready. It was requested after a tracking audit. No application changes are authorized by the act of writing this plan.

## Status

- Priority: P1 — campaign launch blocker.
- Effort: L across several independently verified steps.
- Risk: HIGH for checkout correlation and cutover; LOW–MED for event taxonomy and diagnostics.
- Depends on: the existing uncommitted analytics and Meta purchase implementation; owner decisions in step 2.
- Category: correctness, attribution, tests, migration, operations.
- Planned at: `33116d0425ae36b1ae45691250749c75ec5986e1`, 2026-08-28, **plus the current dirty working tree**.
- Execution status: PARTIAL / local no-prompt startup implemented. On 2026-08-28 the owner accepted limited Meta matching, ruled out a Grow reference round trip and chose no consent banner for the intended Israel-only audience. No checkout correlation or banner is required by the chosen implementation scope. Current verification: 205 unit tests, isolated browser checks and typecheck pass; earlier DB/build evidence is recorded separately. Checkout delivery reliability, scheduling/alerts and live validation remain pending; app-side Google purchase replacement is deferred. See `docs/tracking-launch-checklist.md`.
- Workspace: `/Users/ronkantor/Projects/hightech-guide-chat`. All repository-relative paths below are relative to this root.

## Why this matters

The app currently sends completed purchases only to Meta; Grow is still the Google purchase reporter. Removing Grow's Google tag now would leave no Google purchase replacement. Several ordinary interactions also masquerade as Meta conversion-funnel events, and the server purchase cannot be joined reliably to the originating browser/ad click. The target is one authenticated payment fact, independently delivered to each eligible provider, with accurate values, observable failures, and a tested ownership cutover.

Zero loss or perfect attribution cannot be promised: consent, blocked trackers, provider attribution rules, unavailable identifiers, and delivery deadlines impose limits. Make those cases visible without fabricating conversions or bypassing users' choices.

## Current state and drift check

Run first:

```sh
git rev-parse HEAD
git status --short
git diff --stat 33116d0425ae36b1ae45691250749c75ec5986e1..HEAD -- src .env.example drizzle docs vercel.json package.json package-lock.json
git diff HEAD --stat
git ls-files --others --exclude-standard
```

The commit comparison **does not include uncommitted or untracked work**. Do not start from a fresh checkout of that SHA and assume it contains the implementation. Preserve the user's entire working tree. Compare the excerpts below and read the current files; stop on a material mismatch. Save the initial changed-file list in the execution record so later scope checks compare against the starting state, not a presumed clean tree.

### Existing components to preserve and extend

| File | Current responsibility / confirmed gap |
|---|---|
| `src/services/analytics.ts` | PostHog, GA4 and Meta browser fan-out; in-memory queues, no consent/environment gate. |
| `src/services/analytics-config.ts` | Hardcoded production GA measurement ID and Meta pixel ID. |
| `src/components/google-tag.tsx`, `src/components/facebook-pixel.tsx` | Base tags; corrected inline-script readiness ordering. |
| `src/services/checkout-analytics.ts` | Three canonical products and one `begin_checkout` payload; books intentionally omit unknown prices. |
| `src/components/checkout-link.tsx`, `src/components/buy-button.tsx` | Immediate navigation to static Grow links; no durable checkout correlation. BuyButton forwards all current query parameters. |
| `src/components/footer.tsx` | Three social-profile links report `contact`, becoming Meta `Contact`. |
| `src/app/cracking-the-job-interview/page.tsx` | Product-page view, accordion clicks, testimonial interactions and iframe load all use `view_content`; page ID differs from checkout product ID. |
| `src/components/landing-page/contact-form.tsx` | Correctly reports a lead once after Formspree succeeds, but only in the browser. |
| `src/app/[slug]/page.tsx` | `/book` and `/ebook` redirect straight to Grow without browser tracking. |
| `src/app/api/grow/webhook/route.ts`, `completed-payment.ts`, `handlers.ts` | Authenticate and validate paid callbacks; save entitlement plus Meta outbox atomically; immediate Meta attempt. |
| `src/services/meta-purchases.ts` | Meta CAPI request; hashed email matching only, no browser/session correlation. No Google purchase sender. |
| `src/services/meta-purchase-delivery.ts` | Leased retries, stable event ID, seven-day expiry; generic error detail. |
| `src/db/schema.ts`, `drizzle/0003_meta_purchase_outbox.sql` | Durable Meta-only delivery state; migration not applied by this planning work. |
| `src/app/api/cron/meta-purchases/route.ts`, `vercel.json` | Daily retry run, maximum 20 due jobs per invocation. This caps outage recovery, not immediate successful deliveries. |
| `docs/conversion-tracking.md` | Documents the current Meta-only server ownership and deployment prerequisites; must change with the eventual cutover. |

Current excerpts to verify:

```ts
// src/services/analytics.ts — unrelated interactions share a standard event.
contact: "Contact",
view_content: "ViewContent",
cv_analysis_error: "ViewContent",
cv_analysis_reset: "ViewContent",
questions_filtered: "ViewContent",
// Google maps only the confirmed lead name specially:
const googleName = name === "lead" ? "generate_lead" : name;
```

```tsx
// src/components/google-tag.tsx and facebook-pixel.tsx — KEEP this regression fix.
onReady={() => queueMicrotask(flushAnalyticsEvents)}
// src/components/checkout-link.tsx — a stub accepting an event is not delivery.
onClick={() => trackCheckout(product, { source })}
```

```ts
// src/app/api/grow/webhook/completed-payment.ts
event_name: "Purchase",
event_id: `grow:purchase:${payment.transactionId}`,
event_time: Math.floor(purchasedAt.getTime() / 1000),
user_data: { em: [hashEmail(payment.payerEmail)] },
// recordCompletedPayment uses db.transaction and inserts the outbox inside it.
// src/services/meta-purchase-delivery.ts — retry selection
.limit(20);
```

The paid parser requires successful envelope status, `data.statusCode === "2"`, a known payment link/product, positive amount/quantities and a valid email. The first stored receipt timestamp is retained across duplicate callbacks. Thank-you pages do not report purchases. Preserve those invariants, authenticated callbacks, entitlement behavior and query/body parsing protections.

Conventions: TypeScript, Next.js App Router, `@/` imports, Zod validation, Drizzle transactions, colocated Jest tests. Match `src/services/analytics.test.ts` for provider mocks and `src/app/api/grow/webhook/completed-payment.test.ts` for payment fixtures. Keep helpers outside Next route modules; export only supported route symbols. Do not import the browser/PostHog module into server purchase code.

## Commands you will need

| Purpose | Command | Expected result |
|---|---|---|
| Unit/regression suite | `npm test -- --runInBand` | All pass. Audit baseline: 13 suites / 119 tests. |
| Typecheck | `npx tsc --noEmit --incremental false` | Exit 0. |
| Whitespace | `git diff --check` | Exit 0. |
| Read-only scoped lint | `./node_modules/.bin/biome lint <explicit changed TS/TSX paths>` | No new lint errors; document pre-existing diagnostics separately. |
| Local server | `npm run dev` | Local app starts with isolated test configuration. |
| Build | `npm run build` | Exit 0 using non-production test configuration; record missing environment/build prerequisites, do not substitute production secrets. |
| Generate migration, implementation phase only | `npm run db:generate` | Reviewed additive SQL and matching Drizzle metadata. |
| Apply migration, disposable DB or separately authorized deployment only | `npm run db:migrate` | All migrations apply; never use `db:push` on production. |

`npm run lint`, `npm run check` and `npm run format` **write files**; they are not read-only verification commands. Existing tests are mostly mocks, not proof of real database atomicity or external attribution. New integration/browser commands described below must be implemented before use; they are not existing package scripts.

## Scope

Only modify these areas during authorized execution:

- `src/services/analytics.ts`, `analytics-config.ts`, `checkout-analytics.ts`, `meta-purchases.ts`, `meta-purchase-delivery.ts`, their tests, and new narrowly scoped `src/services/{analytics-consent,checkout-attribution,google-purchases,purchase-delivery,product-catalog}.ts` modules and colocated tests as needed.
- `src/components/{google-tag,facebook-pixel,checkout-link,buy-button,footer,chat}.tsx`, existing analytics initialization/conversion tests, and a consent control component if the owner approves that interface.
- Tracking-only sections in `src/components/landing-page/{main,buttons,contact-form}.tsx`, `src/app/cracking-the-job-interview/page.tsx`, `src/app/start-working-with-ai/page.tsx`, `src/app/courses/[courseSlug]/page.tsx`, `src/app/cv-analysis/cv-analysis-results.tsx`, and `src/app/layout.tsx`.
- `src/app/api/grow/webhook/*`, existing retry endpoint/tests, new `src/app/api/checkout/route.ts` and its helper/tests, `src/db/schema.ts`, additive Drizzle migrations/metadata.
- `.env.example`, `vercel.json`, `docs/conversion-tracking.md`, new `docs/tracking-launch-checklist.md` and `docs/tracking-launch-evidence.json`, and this plan/index.
- New `tests/analytics/` browser/integration tests and their dedicated configuration; `package.json`, `package-lock.json`, `jest.config.js` only for the minimal test tooling/scripts needed. Verify the actual Jest config filename before editing.

Execution clarification: the Google counterpart also requires `src/services/google-purchase-delivery.ts`, its tests, and `src/app/api/cron/google-purchases/route.ts`/tests. The product impression client boundary is `src/components/product-view.tsx`. These are scoped counterparts to the requested reporting changes, not new checkout/product features.

Out of scope: redesigning pages, changing prices, replacing the payment provider, charging/capturing/refunding payments, changing authentication/CV/chat business logic, changing unrelated redirect routes, broad dependency upgrades, resetting existing analytics data, historical conversion replay, creating campaigns, or changing account settings without explicit approval. `/book` and `/ebook` remain compatible redirects; exclude them as ad landing URLs unless a separate redirect/landing redesign is approved. No payment-flow redesign merely to obtain attribution.

## Git workflow

Work on top of the existing dirty tree; do not discard, stage or commit user changes automatically. If the owner asks for a branch, use `codex/campaign-tracking-readiness`. No checkout, commit, push, PR or deployment is implied by this plan. Review each logical step separately.

## Ordered implementation

### Current request — enable Google replacement, 2026-08-28

Owner direction: "enable google reporting, i will remove it from grow". This reopens Google replacement; the older deferred status below is historical, not a refusal to implement the new request.

Status: BLOCKED before activation / destination and integration decision required. Last completed local task remains no-prompt browser startup. Next: identify the Google tag/destination currently entered in Grow, then select a compatible replacement and configure its credentials. No source, environment flags, live account settings, provider events or Grow configuration changed during this check.

- Current GA4 purchase sender requires `VerifiedGoogleContext`; the static webhook cannot provide it. Merely enabling a mode flag would still suppress every purchase. Do not generate a fake browser/session ID to bypass this.
- Local `.env` and process environment contain no GA purchase measurement destination/MP secret or the checked Google Ads account/action/API credential variables. Only presence was checked; no values were printed. This is not evidence about deployed configuration.
- Google's documented GA4 user-data extension supports hashed email but does not by itself establish a browser-to-purchase association. Google Ads supports user-provided-data conversion imports without a GCLID, subject to account setup; this is a different integration, not the existing GA4 sender. For new integrations, assess Data Manager API: Google's current docs warn that new developer tokens cannot use UploadClickConversions after June 15, 2026.
- Need the public Google tag ID currently configured in Grow (or a screenshot without credentials) to identify whether the existing destination is Analytics, Ads or another Google tag setup. Account eligibility, a supported integration, real validation and a coordinated ownership boundary remain required before removing Grow's reporter.

Read-only evidence: [GA4 attribution use cases](https://developers.google.com/analytics/devguides/collection/protocol/ga4/use-cases), [GA4 user-provided data](https://developers.google.com/analytics/devguides/collection/ga4/uid-data), [Google Ads import setup and current API restriction](https://developers.google.com/google-ads/api/docs/conversions/upload-offline).

### Scope amendment — limited Meta matching accepted, 2026-08-28

Owner direction: "lets accept limited matching, there is no way to have the checkout return a refernce".

- [x] Resolve the Grow correlation decision: preserve existing static payment links and accept webhook-only Meta Purchase matching using the currently implemented hashed payer email. Do not introduce a reference, API-created checkout, browser-to-order join, or guessed visitor identifiers.
- Step 5 and the Meta browser-identifier enrichment requirement in step 6 are superseded, not unfinished launch requirements for this reduced Meta scope. Their original checklists below are retained as historical design context, not instructions to execute.
- Purchase reporting and ad attribution remain different: no promise that each reported purchase can be associated with the original website visit or ad. Keep actual paid value, stable payment/event IDs and independent retries.
- This decision does not supply Google client/session context, approve a different Google measurement design, approve a consent policy, or authorize deployment. App Google purchases remain suppressed; do not remove Grow's Google reporting without a separately validated replacement.
- Checkout navigation reliability, callback authentication, Meta configuration/migrations, retry monitoring and real provider validation remain applicable. A first-party checkout event intake, if implemented for delivery reliability, must not be presented as a browser-to-purchase join.

Follow-up owner direction, 2026-08-28: "i dont need to conset, its only for israel". Implement no-prompt browser startup under the owner's selected policy, with configured email-only Meta server purchases and no browser consent join. This is not a legal conclusion, a visitor consent record or geographic enforcement; no geolocation logic is added. Retain environment/destination isolation and the ability to honor explicit runtime permission overrides. Do not create a consent banner, store an invented acceptance, or expand Google reporting.

Status: matching and no-prompt policy decisions implemented. Step 3's banner requirement is superseded. Next local work is checkout delivery reliability (step 7); production/account verification still requires authorized access and is not implied by this change.

### 1. Establish the exact baseline

- [x] Run the drift checks, read all touched files, and run existing tests/typecheck/whitespace checks. Record results and initial modified/untracked files in `docs/tracking-launch-checklist.md`.
- [x] Record that migration application, Grow callback authentication, cron configuration and provider account state are unverified until checked. Never print `.env` contents or credentials.

Status: done — 2026-08-28; 13 suites / 119 tests, typecheck and whitespace checks passed. Existing application changes preserved.

**Verify:** `npm test -- --runInBand`, `npx tsc --noEmit --incremental false`, `git diff --check` → exit 0. Existing failures or missing uncommitted modules require a baseline decision before changes.

### 2. Resolve integration and ownership gates before designing correlation

Status: owner-managed / deferred for independent local implementation.
Owner direction: "i will handle Grow, continue" (2026-08-28). Do not invent a Grow parameter or change reusable payment links. Continue independent code and tests; leave attribution-dependent delivery disabled until verified. This does not authorize live conversion delivery or assume a consent policy has been approved.

- [ ] In the checklist, inventory the campaign's actual products, landing URLs and conversion goals. Separate purchases from leads and engagement.
- [x] Resolve reference feasibility/ownership: owner rules out the round trip and accepts limited Meta matching. No API-created-session alternative or guessed join will be implemented. See scope amendment above.
- [ ] Confirm Grow preserves the callback URL secret/header; do not disable authentication to make a test pass. Determine whether migration 0003 is already deployed before generating subsequent migrations.
- [ ] Recommend one Google path: GA4 Measurement Protocol purchase, imported once into Google Ads. Record owner confirmation. A direct Google Ads upload is an alternative requiring plan revision, not an additional purchase sender.
- [ ] Verify the paid amount contract with sanitized fixtures: currency, item IDs, quantities, discounts, tax, shipping, and reliable payment timestamp if available. Google ecommerce value must follow Google's documented semantics; do not copy a tax/shipping-inclusive total blindly or invent book prices.
- [ ] Obtain the consent policy, retention rules and provider-specific eligibility decisions. Record the treatment of unknown consent and legacy/unmatched callbacks. Do not assert jurisdiction-specific legal requirements without appropriate review.
- [ ] If leads are a campaign objective, identify how Formspree and offsite Google/consulting forms expose authenticated successful submissions. Without a verified integration, label those paths browser-only or unsupported and exclude them from a loss-resistant lead-conversion claim; do not promote link clicks to leads.

**Verify:** `rg -n 'Grow correlation|Google owner|Amount contract|Consent policy|Lead scope|Callback authentication' docs/tracking-launch-checklist.md` → explicit decisions with evidence references and PASS/BLOCKED or owner-accepted limitation status. Superseded correlation and deferred Google work are not required for the reduced Meta scope. All other applicable gates still require verification; a placeholder is not verification.

### 3. Isolate environments and enforce the agreed consent policy

- [x] Replace unconditional production IDs with explicit environment-aware browser/server configuration. Production delivery requires an explicit enable flag and valid destination; previews/local runs default disabled. Test destinations must be separately configured. Never expose API secrets through `NEXT_PUBLIC_*`.
- [x] Apply the owner-selected no-prompt browser default before tag configuration. No UI grant call is required. Retain explicit runtime denial/unknown handling, queue clearing and SDK revoke updates. Keep SSR/first hydration tag-free and preserve the environment gate for the Meta noscript beacon. Do not persist a fabricated consent record. Unlinked Meta server purchases remain under the owner-selected policy, not a claimed browser consent lookup.
- [x] Preserve the microtask initialization fix and Google/Meta failure isolation. PostHog remains unchanged under this no-prompt scope; no site-wide consent-compliance claim is made.
- [x] Snapshot destination and test/live mode with durable jobs so retries cannot move a test event into production. Add server-side eligibility checks, not just hidden browser scripts.

Status: done for the amended local startup scope — browser SDK permissions now default to granted as the owner's configuration, not a visitor acceptance. Environment gates remain default-off; server/initial hydration snapshot stays unknown until the browser takes over. Explicit permission overrides remain tested. No banner, geographic filter, consent storage, per-buyer consent lookup or legal-compliance claim was added. Verified: 19 suites / 205 tests, browser no-prompt and override scenarios, and typecheck pass.

**Verify:** `npm test -- --runInBand --runTestsByPath src/services/analytics.test.ts src/components/analytics-initialization.test.tsx` plus new configuration/consent tests → denied/unknown-policy cases make no prohibited requests; preview makes zero production requests; consent update and revoke behave as recorded. Typecheck passes.

### 4. Correct the event taxonomy and product payloads

- [x] Create a pure shared product catalog; preserve canonical IDs `physical-book`, `digital-book`, `job-interview-course`. Both client and server can import it without pulling browser libraries into server code.
- [x] Reserve Meta `ViewContent` for deliberately defined content/product impressions, not errors, filters, reset, share, chat, upload, link clicks, hovers or iframe load. Keep those actions as named custom engagement events. Change footer social links to a custom `social_link_click`, not `Contact`.
- [x] Introduce a product-view helper that produces GA4 `view_item` with `items` and Meta `ViewContent` with matching product IDs. Use it for actual offered-product impressions; define once-per-page-visit behavior without suppressing legitimate later visits. Do not mark the AI interest form as a purchasable item merely because its page mentions a price.
- [ ] Keep `begin_checkout` / `InitiateCheckout` as checkout starts; `lead` / `generate_lead` / `Lead` only on confirmed successful submissions; `purchase` / `Purchase` only on validated payment. Keep consulting/bookstore/AI interest clicks and CV completion custom.
- [x] Rename the app chat parameter `session_id` to `chat_session_id` in the outgoing event. A chat-generated string is not a GA session ID. Update related dashboards/documentation if the owner uses that parameter; do not alter chat state itself.
- [x] Replace the course's ambiguous interaction names with accurately named custom events; do not report a video play from iframe load. Do not add a YouTube integration unless actual playback measurement is separately needed.

Status: local taxonomy tests passed, including one product impression per provider in StrictMode and after staggered consent grants; real account-side SPA and custom-conversion settings remain unverified. `src/components/product-view.tsx` is the small added client boundary; page styling and checkout destinations are unchanged.
- [ ] Document automatic page-view ownership. Test initial load and SPA back/forward navigation before adding any route reporter: Meta may already instrument history, and GA Enhanced Measurement may do so too.

**Verify:** `npm test -- --runInBand --runTestsByPath src/services/analytics.test.ts src/services/checkout-analytics.test.ts src/components/conversion-events.test.tsx` → table-driven tests cover every EventName mapping, product IDs and negative conversion cases. `rg -n 'track\("contact"|track\("view_content"' src` → every remaining call is explicitly justified by the event contract; no social Contact or interaction-as-product-view calls. Typecheck passes.

### 5. Persist consented browser-to-checkout attribution using the proven Grow mechanism

Status: SUPERSEDED by the owner's limited-matching decision. Do not execute the historical checklist below or require its round-trip verification for Meta launch. Only URL query hygiene is implemented; no browser checkout record or guessed Grow field was added.

- [ ] Add an opaque random checkout reference and a durable checkout record via the scoped checkout API/service. Bind the reference to product, timestamps, destination/test mode and consent state. Apply input validation, request-size/rate limits and an allowlist of permitted destinations; never create an open redirect or trust browser-submitted prices.
- [ ] Where permitted, capture real Google client/session IDs through the supported tag interface, and genuine Meta browser/click identifiers. Retain allowed campaign information with defined expiry. Do not invent identifiers when tags are blocked, derive buyer IP/UA from Grow's request, or put email/tokens into redirect URLs. Read buyer request metadata only at the trusted browser-facing boundary and under the policy.
- [ ] Pass only the proven opaque reference through Grow. Resolve it from the authenticated paid callback. Validate product/reference consistency and define behavior for repeated checkouts, multiple tabs, multiple payments and unknown references. An unknown reference must not suppress legitimate entitlement creation or attach another customer's attribution.
- [ ] Update CheckoutLink/BuyButton call sites without changing styling, prices, accessibility or purchased-user navigation. Preserve modified-click/new-tab behavior. Allow only agreed attribution parameters instead of forwarding arbitrary page query strings.
- [ ] Add a migration for checkout state; do not rewrite applied migration 0003. Use explicit expiry/retention and deletion behavior for sensitive identifiers.

**Verify:** `npm test -- --runInBand` → new `checkout-attribution.test.ts` and checkout-route tests cover two simultaneous buyers/tabs, expired/missing/forged references, mismatched product, denied consent, missing IDs, and network failure. All existing entitlement tests still pass. Authorized Grow sandbox evidence must demonstrate the exact opaque reference returning unchanged; local mocks alone do not satisfy this step.

### 6. Add independent Google purchase delivery while preserving Meta reliability

- [x] Keep one normalized paid transaction as the source of truth. Prefer adding a separate Google outbox beside the existing Meta outbox to minimize migration risk; extract only genuinely shared lease/retry code. Do not replace the existing table just for symmetry.
- [x] Commit entitlement and all required provider delivery records atomically. Each provider needs independent pending/sent/failed/suppressed state, retry timing and diagnostics; Google failures must not prevent Meta delivery or access, and vice versa.
- [x] Preserve Meta `grow:purchase:<transactionId>`. Use the original Grow transaction ID as Google's stable `transaction_id`. Preserve first accepted payload/time across duplicates and retries. Missing consent/identity produces an explicit policy outcome, not a fabricated identity or silent drop.
- [ ] Implement server-only GA4 Measurement Protocol with the real client/session context and the verified items/value/currency/tax/shipping contract. Support separate test destinations. A Google HTTP 2xx is transport receipt, not proof of payload validity or attribution; validate fixtures with the validation endpoint and verify actual destination reports.
- [x] Retain the existing email-only Meta purchase payload under the accepted limited-matching and no-prompt scope; no step-5 enrichment is required. Do not send raw email or secrets to browser analytics/logs. Keep test-event mode pinned to each job. Server configuration, authentication and provider validation remain separate activation requirements.
- [x] Apply provider-specific time/attribution deadlines. Google event backdating and session attribution deadlines differ from Meta's seven-day delivery window. Recheck current docs; never use Meta's retry horizon for Google or refresh timestamps to hide late events.
- [x] Leave production app Google purchase delivery disabled until the cutover. No historical replay and no re-enqueue of already sent Meta jobs during schema changes. Do not add a thank-you-page purchase sender.

Status: local infrastructure verified. Meta email-only matching is now the accepted design, not a missing reference integration. Strict Google builder/sender, independent jobs and authenticated retry endpoint exist, but app Google replacement is deferred: static callbacks intentionally produce `missing_verified_attribution`. Do not fabricate `VerifiedGoogleContext`. No claim of completed ad attribution or per-buyer server consent wiring.

**Verify:** `npm test -- --runInBand` → new `google-purchases.test.ts` and independent-provider delivery tests cover exact payloads, per-provider failure, duplicate/concurrent callbacks, transport success with invalid payload, timeouts, preserved IDs/time, expiry and suppressed cases. Typecheck passes. A disposable database test in step 9 must prove the transaction boundary and migration behavior.

### 7. Close browser navigation and lead-delivery gaps without double counting

Status: pending first-party checkout intake and authenticated lead-provider integration. Existing browser event semantics are tested, but same-tab unload and offsite lead completion remain limitations.

- [ ] Treat a successful `gtag`/`fbq` stub call as queued, not delivered. For the critical checkout event, use the durable first-party checkout intake where consent permits, with one documented delivery owner per provider. A browser+server Meta copy requires the same event ID/name; do not assume arbitrary GA `event_id` deduplicates browser and server copies.
- [ ] Define a bounded navigation wait and failure behavior; never prevent a purchase indefinitely for analytics. Record when attribution intake failed, without leaking personal data. Test delayed SDK loading, same-tab unload, new tabs, double clicks and slow/offline intake. Unavoidable offline loss must remain documented.
- [ ] Preserve the successful Formspree lead trigger and its no-PII payload. If the owner requires loss-resistant lead reporting, integrate only the verified authenticated provider confirmation from step 2, with its own stable submission identity and duplicate policy. If provider access/integration is unavailable, STOP that extension and report the limitation; do not create an endpoint that trusts a browser's claim of a successful lead.

**Verify:** `npm test -- --runInBand` → new checkout transport and lead success/failure/duplicate tests pass. The browser suite added in step 9 must show a single logical checkout per action and no conversion from failed submissions, link clicks or thank-you refreshes, including delayed SDK scenarios.

### 8. Make delivery capacity and failures operationally visible

Status: partial — safe numeric/error-category diagnostics, unhealthy batch responses and bounded 200-job draining implemented and tested. Production scheduler choice, persistent backlog-age monitoring, alert delivery and volume/SLO approval remain pending. Google retry route is not scheduled automatically.

- [ ] Verify the actual scheduler/hosting capability before changing cron frequency. Size batch/concurrency/run frequency for the agreed campaign volume and provider deadlines, not the current 20/day recovery rate. Prefer bounded work and leases over a request that exceeds the platform timeout.
- [ ] Retain safe provider error categories/codes, attempts, next retry, oldest pending age, acceptance counts, expired/suppressed counts and per-provider backlog. Never log whole responses, access tokens, email, cookies or secret callback URLs.
- [ ] Distinguish worker execution success from provider delivery failure in metrics/health output. Set explicit warning/failure thresholds and an alert destination with owner approval. Expiring events need proactive alerts; a daily count-only HTTP 200 is insufficient evidence of health.
- [ ] Document recovery for transient failures, credential failure and ambiguous timeout. Use the same original IDs on retry; never mass replay after expiry. Describe the remaining provider deduplication-window limitation honestly.

**Verify:** `npm test -- --runInBand` → clock-controlled backlog tests simulate at least 200 queued purchases, an outage and recovery, demonstrating clearance before the relevant deadline under the selected schedule. Authentication, missing configuration, all-failed batches, lease recovery and alert thresholds are tested. `node -e 'JSON.parse(require("fs").readFileSync("vercel.json", "utf8"))'` → exit 0; provider schedule support still requires external confirmation.

### 9. Add reproducible database and browser verification

- [x] Add `npm run test:analytics:db` and `npm run test:analytics:e2e` scripts with checked-in tests under `tests/analytics/`. These are new scripts, not existing commands. Keep browser specs out of Jest's default collection if using another runner.
- [x] Database tests must run all migrations against a disposable database, never DATABASE_URL from production. A minimal PGlite harness is acceptable for SQL/transaction tests; also document any Postgres/driver behavior it does not exercise. Production remains postgres-js/Drizzle.
- [ ] Prove atomic rollback, duplicate and concurrent webhooks, independent provider states, expired leases, crash after provider acceptance before sent-state write, and migration of existing pending/sent/test Meta rows without replay. All provider requests are mocked/intercepted.
- [ ] Browser tests use a test destination or interception installed before navigation. Exercise every checkout CTA, real Next script initialization, product views, success/failed form submissions, consent changes, slow SDK, direct thank-you visits, SPA navigation, and back/forward. Block outbound production analytics, Grow payments and real form submissions.
- [x] Add `docs/tracking-launch-evidence.json` with separate `implementation`, `providerValidation`, and `cutover` sections. Each gate records status, timestamp and sanitized evidence reference; never store credentials or customer payloads. Tests/lint must reject a launch-ready status if a required gate is missing or blocked.

Status: 202 unit tests, 9 isolated DB tests, browser contract fixture and production build passed; exact coverage is in `tests/analytics/README.md`. Full app/SPA/provider end-to-end validation is not replaced by the fixture. `npm run check:tracking:launch` correctly exits 1 while the required gates are pending.

**Verify:** `npm test -- --runInBand`, `npm run test:analytics:db`, `npm run test:analytics:e2e`, `npx tsc --noEmit --incremental false`, `npm run build`, `git diff --check` → all exit 0. Record the actual commands/results, not just checkboxes. External traffic sent by tests must be zero unless separately authorized against isolated test accounts.

### 10. Validate isolated real payments and provider account configuration

- [ ] Obtain explicit permission and isolated account/sandbox access before any provider writes or payment. Run the matrix below for the three products, including successful payment with no return to the app. Use sanitized event/transaction references in the evidence file.
- [ ] Verify GA4 destination receipt, ecommerce values/items, original session/campaign association where eligible, and the Google Ads link/import and selected conversion action. Check account-default and campaign/custom goals: a secondary action can still be used by a custom goal. Ensure legacy Grow reporting is not a second counted purchase source.
- [ ] Verify Meta acceptance, event identity, match data and deduplication diagnostics; inspect custom conversion/automatic event rules that might still turn engagement into campaign conversions. HTTP acceptance alone does not prove an attributed sale.
- [ ] Reconcile test paid transactions against both provider destinations after their documented processing delays. Every missing or extra event needs an explanation; denied or unidentifiable events are classified, not disguised as successfully attributed conversions.
- [ ] Resolve page-view ownership using real provider diagnostics before enabling an additional SPA tracker.

**Verify:** `node -e 'const e = JSON.parse(require("fs").readFileSync("docs/tracking-launch-evidence.json", "utf8")); if (e.providerValidation.status !== "PASS") process.exit(1)'` → exit 0 only after every applicable test has actual recorded evidence. If account access or sandbox support is missing, leave this gate BLOCKED; unit tests do not substitute for it.

### 11. Perform an explicitly authorized, reversible Grow-tag cutover

- [ ] Prepare the additive schema and compatible server config before enabling paths that need them. Coordinate callback authentication with Grow so the new webhook does not reject existing payment notifications. Keep entitlement processing independent of reporting enable flags.
- [ ] Plan an exact ownership boundary for Google purchases, including checkouts already open before cutover and delayed/duplicate callbacks. Do not assume transaction IDs deduplicate across different conversion actions. If the old Grow path cannot honor a boundary, agree a brief controlled checkout/campaign transition and reconciliation procedure with the owner; do not silently accept a gap or overlap.
- [ ] After provider validation passes and the owner approves, disable Grow's Google purchase tag and enable the app's Google delivery according to that boundary. Keep only one counted purchase owner; retain original event IDs and queued records. Do not enable campaigns or change bidding as an incidental step.
- [ ] Update `docs/conversion-tracking.md` to the actual ownership, configuration, event matrix, consent rules, retry limits, monitoring and rollback procedure. Remove obsolete “Grow owns Google” comments only when ownership actually changes.
- [ ] Rollback must restore one purchase reporter, preserve queued transactions, and avoid replaying accepted purchases. Require a short post-cutover reconciliation window covering successful payments and delayed callbacks before marking launch-ready.

**Verify:** `node -e 'const e = JSON.parse(require("fs").readFileSync("docs/tracking-launch-evidence.json", "utf8")); for (const k of ["implementation", "providerValidation", "cutover"]) if (e[k]?.status !== "PASS") process.exit(1)'` → exit 0 only with approved cutover and reconciliation evidence. Without deployment authority, stop after producing the runbook and report “implementation verified; cutover pending,” not “launch-ready.”

## Test matrix

| Scenario | Required result |
|---|---|
| One product impression | One defined GA product view / Meta content view with canonical IDs; ordinary interactions do not add product views. |
| Social/consulting/bookstore/AI-form click | Custom engagement only; no Lead, Contact or Purchase. |
| Confirmed contact submission / failed submission | One logical lead / zero leads; no personal form fields in browser analytics. |
| Checkout click, including slow SDK and new tab | One logical checkout per action, bounded navigation, no duplicate transport owners. |
| Paid transaction, no return page | Entitlement plus eligible durable deliveries; each provider receives the original transaction identity and correct value semantics. |
| Pending/failed/cancelled payment; direct thank-you URL | Zero purchases and no new paid entitlement. |
| Duplicate/concurrent webhook; webhook plus cron | No duplicate entitlement or new logical purchase; stable provider IDs and payloads. |
| One provider fails; worker crashes | Other provider and entitlement unaffected; retry only the unresolved provider using its original identity. |
| No consent, revoked consent, missing IDs, unmatched checkout | Apply recorded policy; no invented attribution; legitimate entitlement still works. |
| Preview/test event retried after config change | Never delivered into a live destination by accident. |
| More than 20 pending jobs; extended outage | Verified recovery capacity and timely alerts before provider deadlines. |
| Transaction during ownership cutover | Exactly one configured Google purchase owner, including delayed callbacks; reconcile exceptions. |

## Done criteria

- [ ] Applicable parts of steps 1–9 pass with new tests and no regressions in payment access/navigation. Exclude superseded correlation and deferred Google replacement under the scope amendment; label Meta readiness separately from the original combined Google/Meta goal.
- [ ] All verification commands are recorded with results; no unapproved live traffic from tests.
- [ ] The event contract covers every emitted event; false standard-event mappings are removed.
- [ ] Provider jobs retain original IDs, timestamps, destination and test/live mode; failure states are independent and observable.
- [ ] The baseline-to-final changed-file list contains only authorized scope; existing user edits remain intact.
- [ ] Step 10 has real isolated provider evidence, including no-return purchases and attribution checks.
- [ ] Step 11 has explicit approval, one Google owner, rollback instructions and post-cutover reconciliation.
- [ ] The evidence checker passes for implementation, provider validation and cutover separately; unresolved limitations are visible.
- [ ] Update `advisor-plans/README.md`. Use BLOCKED with the exact external gate if needed; mark DONE only when every applicable gate passes. Planning alone satisfies none of these implementation checkboxes.

## STOP conditions

Stop and report the specific issue instead of improvising if:

- The uncommitted baseline is missing or materially differs from the excerpts.
- Callback authentication is incompatible. Lack of a Grow reference is an accepted Meta matching limitation, not a blocker; do not expand to API-created checkouts to work around it.
- Google conversion ownership, price/tax semantics, consent policy or the required lead scope remains undecided.
- The implementation requires an out-of-scope payment redesign, third-party form change, new commercial service, or unapproved account writes.
- A verification fails twice after a reasonable scoped fix attempt, or tests require production credentials/data.
- A migration would drop data, rewrite an applied migration, change entitlement semantics, or replay historical conversions.
- The planned schedule cannot clear the expected backlog within provider deadlines on the actual hosting plan.
- Existing account rules would double-count purchases, or a safe cutover boundary cannot be established.

## Maintenance notes and authoritative references

Keep a single event contract and shared product IDs when adding products/CTAs. Revisit consent retention, attribution deadlines, provider API versions, scheduler capacity and account conversion rules before changing delivery behavior. Operational acceptance and ad attribution are different states; neither should be inferred solely from HTTP 200.

Recheck these official sources during execution; contracts and account capabilities can change:

- [Grow PaymentLinks webhooks](https://developers.grow.business/docs/webhooks) and [payment request callback](https://developers.grow.business/reference/payment-request-callback).
- [Grow create payment process](https://developers.grow.business/reference/create-payment-process-1) — custom fields here do not establish support on existing static links.
- [GA4 Measurement Protocol use cases / attribution](https://developers.google.com/analytics/devguides/collection/protocol/ga4/use-cases), [reference](https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference), and [sending events](https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events).
- [GA4 ecommerce](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce), [event reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events), and [SPA measurement](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications).
- [Google consent setup](https://developers.google.com/tag-platform/security/guides/consent) and [Google Ads primary/secondary actions](https://support.google.com/google-ads/answer/11461796?hl=en).
- [Meta server-event parameters](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event/), [official server-event SDK](https://github.com/facebook/facebook-nodejs-business-sdk/blob/main/src/objects/serverside/server-event.js), and [official parameter builder](https://github.com/facebook/capi-param-builder).

Deferred: historical backfills, refund reporting, broad analytics redesign, new product funnels and unrelated app bugs. If refunds or offsite lead submissions become campaign requirements, scope them explicitly before making a completeness claim.
