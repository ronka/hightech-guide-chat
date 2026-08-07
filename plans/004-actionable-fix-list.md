# 004 — Make the fix list say what to do

**Written against commit:** `b9b2b3b`
**Depends on:** 002 (both edit the `red_flags` / `improvements` fields it introduced)
**Estimated time:** 45–60 minutes
**Risk:** LOW–MED — breaking schema change, invalidates saved analyses
**Status:** DONE

---

## Why this matters

Two reports from the maintainer against the shipped results screen.

**1. The fix list named problems and never named a fix.** A representative item read:

```
פסקת סיכום גנרית (לדוגמה: 'Dedicated and efficient', 'An autodidact with a passion').
```

That is a diagnosis. The heading directly above it promises `תתחילו מכאן. N שינויים, לפי סדר.` and the body delivered nothing to execute.

The root cause was the schema, not the wording. `red_flags` and `improvements` were both `z.array(z.string())`, so there was nowhere for an action to live and no way for the UI to guarantee one was shown. The prompt already ended with "Keep every string concise and actionable" and the `## Improvements` section already demanded specific + actionable output — and the model still produced problem-shaped strings. Prompt wording alone had no enforcement point.

This is `plans/README.md` "Product direction" item 1 — *suggested rewrites, mostly schema plus prompt work* — delivered in its cheapest form.

**2. The "נתח קורות חיים נוספים" button was invisible.** `variant="outline"` renders a transparent button with a faint border, at the bottom of a long dark page.

---

## What changed

### Schema — `src/types/cv-analysis.ts`

New `FixItemSchema` with two fields, applied to both `red_flags` and `improvements`:

- `issue` — what is wrong, quoting the CV's own wording where possible.
- `action` — what to change, starting with an imperative verb in Hebrew second-person plural.

`issue` is declared **first** on purpose: structured output is generated in property order, so the model states the diagnosis before the prescription, which produces a better prescription. The UI renders them the other way round. `strengths` stays `string[]` — there is nothing to act on there.

### Prompt — `src/app/api/analyze-cv/route.ts`

New `## The fix list` section defines the issue/action contract for both arrays, with the explicit rule that `action` must never restate `issue` and one worked Hebrew example. The nine red-flag detection categories are unchanged — they define what goes in `issue`. "Never invent metrics the CV does not support" is retained verbatim.

Second-person plural was specified deliberately: it is the voice the rest of the interface already uses (סמנו, הוסיפו, שלבו).

### UI — `src/app/cv-analysis/cv-analysis-results.tsx`

`Fix` is now `{ id, action, issue?, keywords? }`. `action` is the primary line — `text-xl` on the lead card, `font-medium` in the rows — with `issue` beneath it in muted text. The synthesized keywords fix carries an `action` and no `issue`; nothing is invented to fill the gap.

Fix ids are unchanged (`flag-N` / `improve-N` / `keywords`), so `done` checkbox keys keep mapping correctly.

### Button — `src/app/cv-analysis/cv-analysis-client.tsx`

Now `size="lg"` with `bg-blue-900 text-white hover:bg-blue-800`, matching the upload CTA so the page has one action color.

**Why not `variant="default"`:** `src/app/layout.tsx:36` hard-forces `className="dark"` on `<html>`, so `--primary` resolves to `210 40% 98%` — near-white. The default variant would render a white button, off-brand and louder than the paid green consulting CTA it sits below. `cn`'s tailwind-merge strips `bg-primary`/`text-primary-foreground` when the brand classes are supplied, verified in the DOM.

---

## Accepted consequence: saved analyses from before this change are dropped

`loadAnalysis` (`analysis-storage.ts:56-60`) validates stored entries against `CVAnalysisSchema` and silently clears anything that fails — its own comment declares this the intended behavior. A string-shaped `red_flags` array no longer parses, so anyone holding a saved analysis sees the upload form again on their next visit.

Migration was considered and rejected: an upcast (`string` → `{issue: s, action: ""}`) would preserve exactly the bad UX this plan exists to fix. Entries expire after 7 days anyway, and a dropped entry is indistinguishable from an expiry from the user's side.

---

## Verification performed

| Check | Result |
|---|---|
| `npx jest src/types/cv-analysis.test.ts` | 12/12 pass (was 8; 4 added) |
| Full suite | 30 pass / 8 fail — the 8 are pre-existing in `src/app/[slug]/page.test.tsx`, identical before the change |
| `tsc --noEmit` | 8 errors, identical before the change, all in `src/app/[slug]/page.test.tsx` |
| Biome on changed files | No new errors; 1 pre-existing warning on an untouched line |
| Live model call against the bad-resume mock, with a job description | HTTP 200. All 9 items led with an imperative verb: החליפו, נסחו, הוסיפו, תקנו, פרטו |
| Rendered results view, screenshot | Action reads as the primary line, issue as muted context beneath |
| Tick a fix, reload | `done: {"flag-1": true}`, progress restored at 1/9 — ids unchanged as intended |
| Seed a pre-change (string-array) payload, reload | Falls back to the upload form, key cleared, no console error |
| Click the restyled reset button | Storage cleared, returns to upload form — handler intact |

New schema tests, in the style of the existing ones: a bare string red flag is rejected; an item with `issue` but no `action` is rejected; an item with `action` but no `issue` is rejected. The middle one is the regression guard that matters — it is exactly the shape this plan removed.

---

## Maintenance note

`red_flags` and `improvements` now share `FixItemSchema` but remain separate arrays, because their ordering in the merged list is meaningful — red flags first, since they are what a recruiter notices. If a future change collapses them into one array, `buildFixes` and the `flag-N`/`improve-N` id split are the two places that assume the separation.

The rubric weights in the system prompt still mirror `.agents/skills/roast-my-cv/SKILL.md`, which remains the source of truth for scoring. This plan did not touch the Scoring section, so the two are still in sync.
