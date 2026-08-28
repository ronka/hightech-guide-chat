# Campaign tracking implementation plan

Written with the improve skill on 2026-08-28 against `33116d0` **and the existing uncommitted analytics/payment changes**. This directory is separate because `plans/` already contains unrelated CV-analysis work. Those plans are unchanged.

## Execution order and status

| Plan | Priority | Effort | Depends on | Status |
|---|---|---|---|---|
| [001 — Campaign tracking readiness](001-campaign-tracking-readiness.md) | P1 | L | Account/deployment activation gates; limited Meta matching and no-prompt policy accepted | IN PROGRESS — no-prompt startup implemented and verified (205 unit tests, browser checks, typecheck). Meta remains email-only; no Grow reference or banner required by the chosen scope. Checkout delivery reliability, monitoring and live validation remain pending. App Google purchase replacement is deferred. See `docs/tracking-launch-checklist.md`. |

Use TODO, IN PROGRESS, BLOCKED (with reason), DONE, or REJECTED (with rationale). Keep implementation, external provider validation and production cutover status distinct. Do not mark DONE merely because local tests pass.

## Dependency order inside the single plan

Current Meta scope: baseline → limited-matching decision (accepted) → environment and consent → event taxonomy → webhook-only Meta purchases → navigation/lead reliability → retry capacity and monitoring → automated verification → isolated provider validation → authorized deployment. Browser-to-purchase correlation is superseded; app Google replacement/cutover is deferred.

Do not remove Grow's Google purchase tag before its replacement is validated and a safe ownership boundary is agreed. No production writes, payment tests or campaign spending are authorized by this plan.

## Findings considered and rejected or qualified

- Missing explicit SPA listeners are not proof of missing page views: tags/account settings may already instrument history. Verify before adding another reporter.
- Unknown book prices are intentionally omitted from checkout events. Inventing prices would be worse than omission; verify the payment contract instead.
- Thank-you pages should not emit purchases. The authenticated paid callback remains the source of truth, including when the buyer never returns.
- Consulting, bookstore, AI interest clicks and CV completion are engagement, not confirmed leads or purchases.
- A tag stub accepting an event is not delivery confirmation; the microtask readiness fix is necessary but does not solve unload/network loss.
- No claim that all Meta events fail for lack of user-agent data: the confirmed gap is missing browser/ad-click correlation, not proven universal rejection.
- Existing stable IDs and leases improve reliability but do not establish absolute exactly-once delivery across external systems.
- No assumption that Grow API custom fields work on reusable static links. The owner ruled out a reference round trip and accepted limited Meta matching on 2026-08-28; it is no longer a required design gate for Meta.

## Coverage limits

The audit covered Google/Meta event call sites, checkout navigation, the new payment webhook/outbox and relevant tests/configuration. It did not verify live provider account goals, deployed secrets/schema, real payment callbacks, consent requirements, external form integrations or campaign attribution. The plan makes those explicit validation gates; it is not a fresh full-codebase/security audit.
