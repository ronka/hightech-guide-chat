# 001 — Fix the three things that make CV analysis look broken

**Written against commit:** `95205fb`
**Estimated time:** 45–60 minutes
**Risk:** LOW — no data model changes, no API contract changes for the success path

---

## Why this matters

The CV analysis feature works. Verified end-to-end: `POST /api/analyze-cv` returns HTTP 200 in 15–23s with a well-formed Hebrew analysis. The problem is three small defects that make it *look* broken to users and untraceable to the maintainer.

1. Every possible error renders the same generic Hebrew string, so nobody can tell a bad upload from a server outage.
2. The match-score progress bar fills from the wrong side on this right-to-left Hebrew site.
3. The system prompt instructs the model to produce a `<job_title>` value that the output schema cannot return, and then references that non-existent value when building the keyword list.

All three are small, independent, and visible once fixed.

---

## Repo conventions you must follow

- **Language:** TypeScript, Next.js 16 App Router, React 19.
- **Formatter/linter:** Biome (`biome.json`). Indent is 2 spaces. Double quotes for strings.
- **Do NOT run** `npm run lint`, `npm run format`, or `npm run check` — all three mutate files (`--apply`, `--write`, `--fix`). To check without mutating, run: `npx @biomejs/biome lint ./src`
- **User-facing strings are Hebrew.** Every string a user can read must be Hebrew. Do not introduce English UI text.
- **Logging:** this repo uses a pino logger at `src/services/logger`. Example from `src/app/api/chat/route.ts:10`:
  ```ts
  import logger from "@/services/logger";
  ```
  Use it instead of `console.error`.

---

## Files in scope

- `src/components/ui/progress.tsx`
- `src/app/api/analyze-cv/route.ts`
- `src/app/cv-analysis/cv-analysis-client.tsx`
- `src/types/cv-analysis.ts`

## Files explicitly OUT of scope

- `src/app/cv-analysis/seo-content.tsx` — do not touch.
- `src/app/layout.tsx` — the `lang="en"` issue is real but belongs to a different plan. Leave it.
- Anything under `src/app/api/chat/` or `src/app/api/auth/` — unrelated.
- Do **not** add bot protection, file-size limits, or analytics changes here. Those are plan 003.

---

## Step 1 — Fix the RTL progress bar

**Current state.** `src/components/ui/progress.tsx` lines 13–22:

```tsx
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
```

**The problem.** `translateX` is a physical transform — negative always moves left, regardless of text direction. The site renders with `dir="rtl"` (set in `src/app/layout.tsx:34`). I measured this in a real browser on the results screen: the track spans x=249→1031, and the filled portion sits at x=249→405 — anchored to the **left** edge on a page whose computed direction is `rtl`. A Hebrew reader sees the bar filling backwards.

**The fix.** Use a logical inset instead of a physical translate, so the fill anchors to the start edge in both directions.

Replace the `<ProgressPrimitive.Indicator .../>` element with:

```tsx
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ insetInlineStart: `-${100 - (value || 0)}%` }}
    />
```

For `insetInlineStart` to apply, the Indicator must be positioned. The Root already has `relative` (line 13). Add `absolute` to the Indicator's className:

```tsx
    <ProgressPrimitive.Indicator
      className="absolute h-full w-full flex-1 bg-primary transition-all"
      style={{ insetInlineStart: `-${100 - (value || 0)}%` }}
    />
```

**Also fix the missing accessibility value.** The component destructures `value` out of props and never forwards it to Radix, so the rendered element has no `aria-valuenow` (I confirmed this in the browser — it returned `null`). Pass it through:

```tsx
  <ProgressPrimitive.Root
    ref={ref}
    value={value}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
```

**Verify:**
```bash
npx tsc --noEmit 2>&1 | grep progress
```
Expected output: nothing (no errors mentioning `progress.tsx`).

Then start the dev server (`npm run dev`), open the CV analysis page, run an analysis, and confirm the bar fills from the **right**. If you cannot run an analysis, temporarily render `<Progress value={20} />` on any page and check visually, then remove it.

> **STOP and report back if:** `Progress` is used somewhere that relies on left-anchored fill in an LTR context. Search first with `grep -rn "<Progress" src/`. At the time of writing, the only usage is `src/app/cv-analysis/cv-analysis-results.tsx:31`.

---

## Step 2 — Make error messages distinguishable

**Current state — the server.** `src/app/api/analyze-cv/route.ts` returns two different shapes. Line 49:

```ts
      return NextResponse.json({ error: "CV must be a file" }, { status: 400 });
```

Lines 123–129:

```ts
  } catch (error) {
    console.error("CV Analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
```

But the rate-limit path at lines 26–31 returns `{ message: ... }`.

**Current state — the client.** `src/app/cv-analysis/cv-analysis-client.tsx` lines 91–94:

```ts
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "ניתוח קורות החיים נכשל");
      }
```

**The problem.** The client reads `errorData.message`. The 400 and 500 paths only set `error`. So `errorData.message` is `undefined` and every failure falls through to the same hardcoded string. Confirmed with curl: a request with no file returns `{"error":"CV must be a file"}` and the user sees the generic message.

**The fix.** Standardise the server on `message`, in Hebrew, and log properly.

2a. At the top of `route.ts`, add the logger import alongside the existing imports:

```ts
import logger from "@/services/logger";
```

2b. Replace line 49 with:

```ts
      return NextResponse.json(
        { message: "לא התקבל קובץ קורות חיים. נא להעלות קובץ PDF." },
        { status: 400 }
      );
```

2c. Replace the catch block (lines 123–129) with:

```ts
  } catch (error) {
    logger.error({ err: error }, "CV Analysis failed");
    return NextResponse.json(
      {
        message:
          "הניתוח נכשל. ייתכן שהקובץ פגום או בפורמט שאינו נתמך. נסו קובץ PDF אחר.",
      },
      { status: 500 }
    );
  }
```

2d. In `cv-analysis-client.tsx`, make the client tolerant of both keys so it cannot silently regress. Replace lines 91–94 with:

```ts
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ?? errorData.error ?? "ניתוח קורות החיים נכשל"
        );
      }
```

The `.catch(() => ({}))` matters: if the server returns a non-JSON body (a proxy timeout page, for example), `response.json()` throws and the user currently sees a raw JSON parse error in Hebrew UI.

**Verify:**
```bash
npm run dev
# in another terminal:
curl -s -X POST http://localhost:3000/api/analyze-cv -F "jobDescription=x"
```
Expected output: `{"message":"לא התקבל קובץ קורות חיים. נא להעלות קובץ PDF."}`

Note: if port 3000 is taken, Next will pick another port — read the dev server output for the actual URL.

---

## Step 3 — Remove the dead `<job_title>` instruction

**Current state.** `src/app/api/analyze-cv/route.ts` lines 62 and 66:

```
- Job Title Identification: Determine the most accurate job title based on the CV's content. set it as <job_title>
...
- Extracted Keywords: List the most relevant to the <job_title> keywords found in the CV, including skills, technologies, and industry terms.
```

**The problem.** `CVAnalysisSchema` in `src/types/cv-analysis.ts` has exactly five fields — `match_percentage`, `strengths`, `improvements`, `keywords_found`, `keywords_missing`. There is no `job_title`. Structured output discards it, and line 66 then anchors keyword extraction to a value that was never produced.

**The fix — add the field rather than deleting the instruction.** The job title is genuinely useful to display and cheap to produce.

3a. In `src/types/cv-analysis.ts`, add as the first property inside `z.object({`:

```ts
  job_title: z
    .string()
    .describe(
      "The most accurate market-facing job title for this CV, in Hebrew."
    ),
```

3b. In `route.ts`, change line 62 to:

```
- Job Title Identification: Determine the most accurate market-facing job title based on the CV's content, and return it in the job_title field.
```

3c. Change line 66 to reference the field rather than the placeholder:

```
- Extracted Keywords: List the keywords found in the CV that are most relevant to the job_title you identified, including skills, technologies, and industry terms. see example for keywords in <keywords_examples>
```

3d. Display it. In `src/app/cv-analysis/cv-analysis-results.tsx`, replace the heading on line 21:

```tsx
      <h2 className="text-2xl font-semibold mb-6">תוצאות ניתוח</h2>
```

with:

```tsx
      <h2 className="text-2xl font-semibold mb-2">תוצאות ניתוח</h2>
      {results.job_title && (
        <p className="text-muted-foreground mb-6">
          זוהה כ: <span className="font-medium">{results.job_title}</span>
        </p>
      )}
```

**Verify:**
```bash
npx tsc --noEmit 2>&1 | grep -E "cv-analysis|analyze-cv"
```
Expected output: nothing.

Then run a real analysis through the UI and confirm a Hebrew job title appears under the heading.

---

## Step 4 — Clean up the small stuff

Each of these is one line. Do all four.

1. `src/app/cv-analysis/cv-analysis-client.tsx:13` — delete the unused import:
   ```ts
   import { SeoContent } from "./seo-content";
   ```
   It is unused here; `page.tsx` already renders `<SeoContent />`.

2. `src/app/api/analyze-cv/route.ts:13` — the comment says 5, the code says 20. Change:
   ```ts
   // Create a new ratelimiter, that allows 5 requests per 1 day
   ```
   to:
   ```ts
   // Allow 20 requests per day per client IP
   ```

3. `src/app/api/analyze-cv/route.ts:56` — delete the commented-out line:
   ```ts
      // output: Output.object({ schema: CVAnalysisSchema }),
   ```

4. `src/app/cv-analysis/file-upload.tsx:55` — add `type="button"`. The button sits inside a `<form>` and shadcn's `Button` sets no default `type`, so it defaults to `submit`. It currently works only because `handleReplaceFile` calls `e.preventDefault()`. Make it explicit:
   ```tsx
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReplaceFile}
            >
   ```

**Verify:**
```bash
npx tsc --noEmit 2>&1 | grep -E "cv-analysis|analyze-cv|file-upload"
npx @biomejs/biome lint ./src/app/cv-analysis ./src/app/api/analyze-cv
```
Expected: no TypeScript errors in those files. Biome will still report `useImportType` warnings and `noArrayIndexKey` errors that pre-date this work — leave them.

---

## Done criteria

All must pass:

1. `npx tsc --noEmit` reports no errors in `src/app/cv-analysis/**`, `src/app/api/analyze-cv/**`, `src/components/ui/progress.tsx`, or `src/types/cv-analysis.ts`.
   (Pre-existing errors in `src/app/[slug]/page.test.tsx` are expected — ignore them.)
2. `curl -s -X POST http://localhost:<port>/api/analyze-cv -F "jobDescription=x"` returns a JSON body whose `message` key is the Hebrew "no file" string.
3. A real PDF analysed through the UI renders: a Hebrew job title under the heading, and a score bar that fills from the **right** edge.
4. `document.querySelector('[role="progressbar"]').getAttribute("aria-valuenow")` returns the score, not `null`.

## Test plan

This repo has Jest configured (`jest.config.js`, `npm test`) but no tests for this feature. Add one test file:

`src/types/cv-analysis.test.ts` — following the style of existing tests in `src/app/[slug]/page.test.tsx`:

- `CVAnalysisSchema` parses a complete valid object including `job_title`.
- `CVAnalysisSchema` rejects an object missing `job_title`.
- `CVAnalysisSchema` rejects `match_percentage` of `101` and `-1`.

Run with `npm test`.

Do not write tests that call the real model — they cost money and are non-deterministic.

## Maintenance note

`src/components/ui/progress.tsx` is a shadcn/ui component. The upstream shadcn version uses the `translateX` pattern and does not forward `value`. If anyone re-runs `npx shadcn add progress`, both fixes here will be silently reverted. Leave a comment in the file noting the RTL divergence so a future reviewer knows it is deliberate:

```tsx
// NOTE: diverges from upstream shadcn — uses insetInlineStart instead of
// translateX so the bar fills from the correct edge in RTL, and forwards
// `value` to Radix so aria-valuenow is set. Do not overwrite with shadcn add.
```

The error-shape change is API-visible. Any future caller of `/api/analyze-cv` should read `message`. There is currently only one caller: `cv-analysis-client.tsx`.
