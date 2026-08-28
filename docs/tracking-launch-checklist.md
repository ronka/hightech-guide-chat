# Tracking launch execution record

Plan: `advisor-plans/001-campaign-tracking-readiness.md`.

Execution started 2026-08-28 after the owner requested implementation. Local implementation is authorized; deployment, provider account changes, payment tests and live conversion submissions are not. The initial run completed only the baseline. The owner then directed: "i will handle Grow, continue"; independent local source implementation proceeded as recorded below.

## Step 1 — baseline: PASS

HEAD: `33116d0425ae36b1ae45691250749c75ec5986e1` plus the existing dirty working tree. The committed baseline has not moved. The plan's current-state excerpts match the relevant analytics, initialization, checkout and paid-callback code.

| Check | Result |
|---|---|
| `npm test -- --runInBand` | PASS: 13 suites, 119 tests. |
| `npx tsc --noEmit --incremental false` | PASS: no diagnostics. |
| `git diff --check` | PASS: no diagnostics. |
| Commit drift comparison | No committed changes since the planned SHA. |
| Existing uncommitted work | Preserved; initial inventory below. |

Tests use the existing mocks; these results do not establish real payment, database migration or provider-attribution correctness. No production database was queried or migrated. Deployed migration state, Grow callback authentication, cron configuration, and Google/Meta account settings remain unverified.

### Initial modified tracked files

```text
.env.example
drizzle/meta/_journal.json
src/app/api/grow/webhook/handlers.ts
src/app/api/grow/webhook/route.ts
src/app/courses/[courseSlug]/page.tsx
src/app/cracking-the-job-interview/page.tsx
src/app/cv-analysis/cv-analysis-results.tsx
src/app/ebook/download/page.tsx
src/app/layout.tsx
src/app/start-working-with-ai/page.tsx
src/components/buy-button.tsx
src/components/facebook-pixel.tsx
src/components/landing-page/buttons.tsx
src/components/landing-page/contact-form.tsx
src/db/schema.ts
src/services/analytics.ts
```

### Initial untracked files

```text
advisor-plans/001-campaign-tracking-readiness.md
advisor-plans/README.md
docs/conversion-tracking.md
drizzle/0003_meta_purchase_outbox.sql
drizzle/meta/0003_snapshot.json
src/app/api/cron/meta-purchases/route.test.ts
src/app/api/cron/meta-purchases/route.ts
src/app/api/grow/webhook/completed-payment.test.ts
src/app/api/grow/webhook/completed-payment.ts
src/app/api/grow/webhook/webhook-http.test.ts
src/components/analytics-initialization.test.tsx
src/components/checkout-link.tsx
src/components/conversion-events.test.tsx
src/components/google-tag.tsx
src/lib/server-secret.ts
src/services/analytics-config.ts
src/services/analytics.test.ts
src/services/checkout-analytics.test.ts
src/services/checkout-analytics.ts
src/services/meta-purchase-delivery.test.ts
src/services/meta-purchase-delivery.ts
src/services/meta-purchases.test.ts
src/services/meta-purchases.ts
vercel.json
```

## Step 2 — integration and ownership gates: OWNER-MANAGED / PENDING

### Products and campaign goals — PARTIAL

The repository's purchase catalog contains `physical-book`, `digital-book`, and `job-interview-course`. The book landing page and `/cracking-the-job-interview` are candidate campaign landing pages; `/book` and `/ebook` directly redirect and do not establish browser attribution. The owner has not yet selected campaign products or whether confirmed leads are a bidding objective. Do not infer a launched campaign configuration from the catalog.

### Grow correlation — ACCEPTED LIMITATION (Meta)

Owner decision, 2026-08-28: "lets accept limited matching, there is no way to have the checkout return a refernce". Preserve static links and use the existing hashed-email-only Meta purchase payload. No checkout reference, browser-to-order join or API-created payment flow will be built. This resolves the design choice, not provider acceptance, ad attribution, consent eligibility or deployment. The earlier documentation research below is retained for context.

Read-only documentation verification on 2026-08-28:

- The [PaymentLinks webhook example](https://developers.grow.business/docs/webhooks) includes dynamic form fields, but does not document how to inject a hidden, per-visit reference through arbitrary query parameters on an existing reusable link.
- [Create Payment Link](https://developers.grow.business/reference/create-payment-link) documents custom fields for API-created links. This is an alternative integration, not evidence that the current static links support those query parameters. It also requires account API access and payer/product inputs that the current redirect-only flow does not collect or fully specify.
- The [API-created link callback](https://developers.grow.business/reference/payment-request-callback) documents custom fields and a server notification. A simulated callback alone would not prove a real checkout's reference round trip.

No account-specific sandbox access or authorized test callback target has been established. No request was made to a payment-creation, callback-simulation or charge endpoint. Static-link support is **unproven**, not proven impossible.

No further reference investigation is required for the accepted Meta scope. Do not guess URL parameters, join purchases to local browser records by email/time, or replace reusable payment links. Hashed email in the Meta payload is not a local browser-to-order join.

### Callback authentication — BLOCKED

The local webhook requires a secret header or URL query parameter. Local tests pass, but no Grow-originating request has verified that the configured callback preserves it. Migration 0003 and deployed callback configuration have not been inspected. Do not deploy the authenticated webhook without confirming both.

### Google owner — PARTIAL

The original plan recommended app-side GA4 Measurement Protocol purchases with one Google Ads import. That replacement is now deferred: accepting limited Meta matching does not provide the real Google client/session context required by the existing sender. Existing GA4/Ads linking, conversion actions and actual Grow purchase reporting have not been verified in the accounts. Keep Grow's Google reporting until a separately approved replacement is validated and cut over; do not invent Google identifiers or interpret this decision as permission to remove its tag.

### Amount contract — BLOCKED

The current callback parser retains total and quantities, not a verified item/tax/discount breakdown. The configured course advertises 99 ILS; book prices are intentionally absent from the browser catalog. Need sanitized real/test fixtures and confirmation of net item amounts, tax, shipping, discounts and currency before constructing Google purchase value. No guessed prices or assumed VAT rate.

### Consent policy — OWNER-SELECTED NO-PROMPT IMPLEMENTATION

Owner direction, 2026-08-28: "i dont need to conset, its only for israel". The chosen implementation has no consent prompt: configured Google/Meta browser tags start automatically, and configured Meta purchases retain the email-only webhook path. No visitor consent record, browser-to-order consent lookup or geographic filter is created. SDK permission defaults are configuration, not proof of acceptance or a legal determination about Israeli sites. Runtime permission overrides are still honored in the browser; they are not propagated to unlinked webhook purchases. PostHog remains unchanged. The previous banner/UI blocker is superseded by this explicit direction.

### Lead scope — BLOCKED pending campaign selection

The on-site Formspree success state produces a browser-only lead. Consulting and AI-course links lead to external forms; their confirmed submissions are not verified by this app. If lead campaigns are required, provider-supported authenticated submission confirmation needs separate validation. Otherwise record them as engagement/browser-only and do not claim loss-resistant lead coverage.

## Resume point

Latest request: "enable google reporting, i will remove it from grow" (2026-08-28). Google replacement is reopened, but activation is blocked on identifying Grow's current Google tag/destination and selecting/configuring the appropriate integration. The existing GA4 webhook path still lacks `VerifiedGoogleContext`; its local destination/secret are absent. No Google Ads destination/API credentials were found in the checked local keys either. Deployed settings were not inspected. Next input: the public Google tag ID entered in Grow. The execute-plan workflow pauses rather than pretending a flag enables a working replacement. See the plan's current-request section for official-source findings. No live changes or source changes were made in this check.

Step 1, the reduced Meta matching decision and step 3's amended no-prompt startup are complete. The owner ruled out Grow reference correlation and accepted the existing email-only Meta purchase design. Step 5 and its Meta enrichment dependency are superseded, not unfinished work. Next local task is checkout delivery reliability (step 7); live callback/account/deployment verification still needs authorized access. Keep Grow's Google tag enabled; app Google purchase replacement is deferred.

Scope-amendment verification: 3 targeted suites / 41 tests passed (`completed-payment`, `meta-purchases`, `checkout-attribution`); `git diff --check` passed. `npm run check:tracking:launch` still exits 1 as expected for unresolved implementation/provider/cutover gates. Accepting a matching limitation does not automatically mark any launch gate PASS.

No-prompt startup verification: a new regression test first failed against the old `unknown` browser default, then passed after the policy change. Full suite: 19 suites / 205 tests pass. The isolated browser test now verifies automatic PageView/ViewContent/checkout startup without any grant call, then separately exercises permission overrides/revocation. Typecheck and isolated production build pass. Scoped lint of the 4 source/test files has no errors and one pre-existing non-null assertion warning in the fixture. No provider traffic, banner, deployment, payment change or production write was performed.

## Local implementation results — 2026-08-28

- Added environment isolation and Google/Meta permission controls, preserving the inline-script readiness fix and clearing queued SDK events on revocation. The original default-unknown browser state was subsequently replaced by the owner-selected no-prompt default; SSR remains tag-free. No consent UI or server permission correlation is implemented or required by the amended scope.
- Corrected all audited false Meta standard-event mappings; added canonical product impressions and custom social/course/video/testimonial events. Preserved CTA destinations, prices, paid access and successful-only lead semantics. Chat's internal parameter is now `chat_session_id`.
- Added a strict Google purchase builder/sender and independent durable Google outbox. Missing/invalid attribution is visible as a suppression reason; it does not produce a guessed conversion or deny paid access. Added an authenticated Google retry route; scheduling is pending.
- Pinned Meta destination/test mode in an additive migration, preserved stable IDs, added safe provider diagnostics and unhealthy batch responses, and increased fast backlog draining to 200 per invocation within a bounded time budget.
- Added additive migrations 0004 and 0005; neither was applied to a live database. Existing uncommitted 0003 remains intact. No historical conversions were replayed.
- Added repeatable database and browser tests. PGlite and esbuild were made direct, pinned test dependencies at versions already in the lockfile; no dependency versions changed.

| Verification | Latest result |
|---|---|
| `npm test -- --runInBand` | PASS: 19 suites / 205 tests. |
| `npm run test:analytics:db` | PASS: 9 tests; real ephemeral SQL, duplicate/concurrent transactions, atomic rollback, independent delivery, expired leases, post-acceptance write failure, 200-job backlog. |
| `npm run test:analytics:e2e` | PASS: automatic no-prompt startup and explicit overrides in the isolated real-browser contract fixture; no external provider requests. Not a live Grow flow or full route SPA attribution test. |
| `npm run build:analytics:test` | PASS: production Next build with dummy credentials and reporting disabled. Existing Browserslist/metadata warnings remain. |
| `npx tsc --noEmit --incremental false` | PASS. |
| Scoped Biome lint | PASS: 17 core implementation files. |
| `git diff --check` | PASS. |
| `npm run check:tracking:launch` | Expected FAIL: implementation remains partial; provider validation and cutover pending. |

### Still required

1. Verified callback authentication (owner-managed) and no-return Meta purchase validation. Grow reference correlation is no longer required. App Google purchase replacement remains deferred; the current callback cannot supply `VerifiedGoogleContext`.
2. Browser checkout navigation reliability. A consent banner and browser-to-order permission join are no longer requested; the no-prompt policy is recorded above, without a compliance claim.
3. Verified payment item/tax/shipping amounts, provider account goals/imports, and isolated real payment/attribution validation.
4. Google retry scheduling and persistent backlog-age monitoring/alert configuration; the existing daily Meta schedule is unchanged.
5. Explicitly authorized migration/deployment and coordinated Google ownership cutover, including payments already in progress.

No deployment, live provider event, real payment, credential change or production database write was performed.
