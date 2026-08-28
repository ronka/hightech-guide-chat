# Isolated tracking checks

Run from the repository root with Node 22 and installed npm dependencies:

```sh
npm test -- --runInBand
npm run test:analytics:db
npm run test:analytics:e2e
npm run build:analytics:test
npx tsc --noEmit --incremental false
```

- Unit tests cover event mappings, real Next inline-script ordering, actual course CTAs and successful/failed Formspree state changes, consent queue behavior, payloads, sender failures and worker leases.
- Database tests execute the production parser, purchase transaction and workers with Drizzle/PGlite and all checked-in SQL migrations. Storage is memory-only. Fetch is intercepted. No production connection string is used. The Node VM-modules flag is required by PGlite inside Jest. PGlite validates PostgreSQL SQL/transaction behavior, not Supabase/PgBouncer production transport.
- Browser tests require `agent-browser` on PATH and a local Chrome/Chromium installation. They bundle the real GoogleTag, FacebookPixel, ProductView and analytics modules into a test-only fixture; the PostHog transport is stubbed. The initial visit tests no-prompt page/product/checkout startup without a grant call. A separate fresh-document route tests explicit permission overrides, revocation and repeat visits. A named disposable browser session, domain allowlist and restrictive CSP block external SDK/network delivery. No production route/test hook is added to the app. This is a browser contract test, not a full live Grow or provider attribution test. All CTA placements and form success states are separately covered in the component suite.
- The build wrapper shadows local environment-file keys with dummy values and explicitly disables Google/Meta delivery. It does not deploy or apply migrations. Fonts may be fetched during Next's build. The normal production build command remains unchanged.

These checks cannot prove account-side custom-conversion rules, real SPA automatic page-view counts, ad attribution, Grow reference echoing, payment callbacks or the approved consent policy. See `docs/tracking-launch-checklist.md` before enabling reporting. Existing `.env` values are never printed by the build wrapper.
