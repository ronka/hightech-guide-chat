# 003 — Stop leaking candidate names, and harden the LLM endpoint

**Written against commit:** `95205fb`
**Depends on:** nothing. Can run in parallel with 001 and 002 (touches different lines).
**Estimated time:** 60–90 minutes
**Risk:** LOW for the analytics change, MED for bot protection (a misconfigured `checkBotId` can block real users)

---

## Why this matters

Two separate problems, both on the same feature.

**1. CV filenames are sent to PostHog and Facebook.** Confirmed in the browser console during a real upload:

```
posthog.capture cv_file_selected {file_name: "cv.pdf", file_size_kb: 23, has_job_description: false}
fbq.track ViewContent {file_name: "cv.pdf", file_size_kb: 23, has_job_description: false}
```

Real users do not name their file `cv.pdf`. They name it `ישראל ישראלי - קורות חיים.pdf` or `DanielCohen_CV_2026.pdf`. The site's own guide (`.agents/skills/roast-my-cv/references/how-to-write-good-resume.md`, "הגימור האחרון") explicitly tells readers to name the file `RonKantor_CV.pdf`. So the tool instructs users to put their real name in the filename, then forwards it to Meta.

**2. The expensive endpoint is unprotected.** `/api/analyze-cv` calls a paid Gemini model on every request. It has:
- No `checkBotId()`, unlike `/api/chat` (`src/app/api/chat/route.ts:17`) and `/api/auth` (`src/app/api/auth/[...all]/route.ts:12`).
- No file size limit. Vercel accepts request bodies up to 100 MB.
- No MIME type check. Confirmed: a `text/plain` file is accepted and forwarded to the model despite the UI advertising PDF only.

---

## Repo conventions you must follow

- TypeScript, Next.js 16 App Router.
- Biome: 2-space indent, double quotes. **Do NOT run** `npm run lint`/`format`/`check` — they mutate. Use `npx @biomejs/biome lint ./src`.
- Analytics goes through the typed wrapper at `src/services/analytics.ts`. Event names are a union type (`EventName`) — adding an event means adding it to that union AND to the `fbEventMap` record.
- Hebrew for all user-facing strings.

## Files in scope

- `src/app/cv-analysis/cv-analysis-client.tsx`
- `src/app/api/analyze-cv/route.ts`
- `src/instrumentation-client.ts`

## Files explicitly OUT of scope

- `src/services/analytics.ts` — **do not remove events from the `EventName` union.** Other pages use them.
- Do not touch `/api/chat` or `/api/auth` bot protection. They already work.
- Do not change the rate limiter's window or count. 20/day is a deliberate choice (commit `b972928 "incearse rate limit"`).

---

## Step 1 — Stop sending filenames to analytics

**Current state.** `src/app/cv-analysis/cv-analysis-client.tsx` lines 33–42:

```tsx
  const handleFileChange = (file: File | null) => {
    if (file) {
      track("cv_file_selected", {
        file_name: file.name,
        file_size_kb: Math.round(file.size / 1024),
        has_job_description: !!state.jobDescription,
      });
    }
    setState((prev) => ({ ...prev, file }));
  };
```

And lines 98–101:

```tsx
      track("cv_analyzed", {
        has_job_description: !!state.jobDescription,
        file_name: state.file?.name,
      });
```

**The fix.** Remove `file_name` from both. Replace it with the non-identifying signal that was presumably the point — whether the filename looks professional, which is advice the guide already gives.

1a. Replace the `handleFileChange` body:

```tsx
  const handleFileChange = (file: File | null) => {
    if (file) {
      track("cv_file_selected", {
        file_size_kb: Math.round(file.size / 1024),
        file_extension: file.name.split(".").pop()?.toLowerCase() ?? "unknown",
        has_job_description: !!state.jobDescription,
      });
    }
    setState((prev) => ({ ...prev, file }));
  };
```

1b. Replace the `cv_analyzed` call:

```tsx
      track("cv_analyzed", {
        has_job_description: !!state.jobDescription,
      });
```

**Verify:**
```bash
grep -n "file_name" src/app/cv-analysis/
```
Expected output: nothing.

Then run the dev server, open the browser console, upload a file, and confirm neither the `posthog.capture` nor the `fbq.track` log line contains a filename.

> **STOP and report back if:** a PostHog dashboard, funnel, or saved insight depends on the `file_name` property. Check before deleting. If one does, the property still has to go — but the user needs to know the dashboard will break.

---

## Step 2 — Validate the upload server-side

**Current state.** `src/app/api/analyze-cv/route.ts` lines 44–52:

```ts
    const formData = await request.formData();
    const cvFile = formData.get("cv");
    const jobDescription = formData.get("jobDescription")?.toString() || "";

    if (!(cvFile instanceof File)) {
      return NextResponse.json({ error: "CV must be a file" }, { status: 400 });
    }

    const cvData = Buffer.from(await cvFile.arrayBuffer());
```

**The fix.** Add size, type, and job-description-length checks. Insert constants above the `POST` function, after the `ratelimit` declaration:

```ts
const MAX_CV_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_CV_TYPES = ["application/pdf"];
const MAX_JOB_DESCRIPTION_CHARS = 20_000;
```

Then replace the validation block. Note: if plan 001 is already applied, the `{ error: ... }` shape has become `{ message: ... }` — match whatever is there. The version below assumes plan 001 is applied.

```ts
    if (!(cvFile instanceof File)) {
      return NextResponse.json(
        { message: "לא התקבל קובץ קורות חיים. נא להעלות קובץ PDF." },
        { status: 400 }
      );
    }

    if (!ALLOWED_CV_TYPES.includes(cvFile.type)) {
      return NextResponse.json(
        { message: "פורמט הקובץ אינו נתמך. נא להעלות קובץ PDF בלבד." },
        { status: 415 }
      );
    }

    if (cvFile.size > MAX_CV_BYTES) {
      return NextResponse.json(
        { message: "הקובץ גדול מדי. הגודל המרבי הוא 10MB." },
        { status: 413 }
      );
    }

    if (cvFile.size === 0) {
      return NextResponse.json(
        { message: "הקובץ ריק. נא להעלות קובץ תקין." },
        { status: 400 }
      );
    }

    if (jobDescription.length > MAX_JOB_DESCRIPTION_CHARS) {
      return NextResponse.json(
        { message: "תיאור המשרה ארוך מדי. נא לקצר ל-20,000 תווים." },
        { status: 413 }
      );
    }

    const cvData = Buffer.from(await cvFile.arrayBuffer());
```

**Also mirror the type check on the client** so users get instant feedback instead of a round trip. In `src/app/cv-analysis/file-upload.tsx`, replace `handleFileChange` (lines 16–21):

```tsx
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.type !== "application/pdf") {
      onError?.("נא להעלות קובץ PDF בלבד.");
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      onError?.("הקובץ גדול מדי. הגודל המרבי הוא 10MB.");
      return;
    }

    onFileChange(selected);
    onError?.(null);
  };
```

The server check still matters — the client check is a convenience, not a control.

**Verify:**
```bash
# text file rejected with 415
printf 'not a pdf' > /tmp/fake.txt
curl -s -w "\n[%{http_code}]\n" -X POST http://localhost:3000/api/analyze-cv \
  -F "cv=@/tmp/fake.txt;type=text/plain"
```
Expected: HTTP 415 and the Hebrew unsupported-format message.

---

## Step 3 — Add bot protection

**Current state.** `src/instrumentation-client.ts` registers only two paths:

```ts
import { initBotId } from "botid/client/core";

initBotId({
  protect: [
    { path: "/api/auth/sign-in/magic-link", method: "POST" },
    { path: "/api/chat", method: "POST" },
  ],
});
```

`botid` is already a dependency and `next.config.js` already wraps the config with `withBotId`. Nothing new to install.

**The fix.**

3a. Add the path to `src/instrumentation-client.ts`:

```ts
initBotId({
  protect: [
    { path: "/api/auth/sign-in/magic-link", method: "POST" },
    { path: "/api/chat", method: "POST" },
    { path: "/api/analyze-cv", method: "POST" },
  ],
});
```

3b. Add the server check in `route.ts`. Follow the existing pattern from `src/app/api/chat/route.ts:17-20`:

```ts
  const verification = await checkBotId();
  if (verification.isBot) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }
```

Add the import at the top of `route.ts`:

```ts
import { checkBotId } from "botid/server";
```

Place the check as the **first** statement inside `POST`, before the rate-limit call — a blocked bot should not consume a rate-limit token. The Hebrew message here is deliberate; a bot does not read it, but a false positive on a real user should still be legible:

```ts
export async function POST(request: NextRequest) {
  const verification = await checkBotId();
  if (verification.isBot) {
    return NextResponse.json(
      { message: "הבקשה נחסמה. אם אתם משתמשים אמיתיים, נסו שוב מדפדפן אחר." },
      { status: 403 }
    );
  }

  const identifier = (
    request.headers.get("x-forwarded-for") ?? "127.0.0.1"
  ).split(",")[0];
  // ...unchanged from here
```

> **STOP and report back if:** `checkBotId()` blocks your own browser during local testing. BotID behaves differently in development. Verify on a Vercel preview deployment before merging, not only locally.

---

## Step 4 — Note the rate-limit identity hazard

**Do not change the code in this step.** Add a comment only.

`route.ts` lines 20–22 derive the rate-limit identity from the client-supplied leftmost `x-forwarded-for` entry:

```ts
  const identifier = (
    request.headers.get("x-forwarded-for") ?? "127.0.0.1"
  ).split(",")[0];
```

I verified locally that changing this header by one octet resets the quota completely. **In production this is not currently exploitable**: Vercel overwrites `x-forwarded-for` and does not forward external IPs, specifically to prevent spoofing (Vercel docs, "Request headers"). It becomes exploitable the moment a proxy such as Cloudflare is placed in front of Vercel, or if Trusted Proxy is enabled.

Add this comment above the identifier so a future maintainer does not have to rediscover it:

```ts
  // Vercel overwrites x-forwarded-for and refuses to forward external IPs, so
  // the leftmost entry is trustworthy TODAY. If a proxy (e.g. Cloudflare) is
  // ever put in front of Vercel, this becomes client-controlled and the daily
  // quota is trivially bypassable. Switch to x-vercel-forwarded-for if that happens.
```

---

## Done criteria

1. `grep -rn "file_name" src/app/cv-analysis/` returns nothing.
2. Uploading a file in the browser produces console analytics lines containing `file_size_kb` and `file_extension` but **no filename**.
3. `curl` with a `text/plain` file returns HTTP 415.
4. `curl` with a file larger than 10 MB returns HTTP 413.
5. `curl` with `jobDescription` longer than 20,000 characters returns HTTP 413.
6. A valid PDF under 10 MB still returns HTTP 200 with a full analysis.
7. `grep -n "analyze-cv" src/instrumentation-client.ts` shows the new protected path.
8. `npx tsc --noEmit` reports no new errors.

## Test plan

Add `src/app/api/analyze-cv/validation.test.ts`. To make the rules testable, extract them into a pure function in `route.ts` and export it:

```ts
export function validateCvUpload(
  file: File,
  jobDescription: string
): { ok: true } | { ok: false; status: number; message: string } {
  // ...the checks from step 2
}
```

Then test, using `jest-environment-node` (already configured in `jest.config.js`):

- A 1 KB `application/pdf` file with a short job description returns `{ ok: true }`.
- A `text/plain` file returns status 415.
- An 11 MB PDF returns status 413.
- A 0-byte PDF returns status 400.
- A 25,000-character job description returns status 413.

Construct test files with `new File([new ArrayBuffer(size)], "x.pdf", { type: "application/pdf" })`.

Do not write tests that call `checkBotId()` or the real model.

## Maintenance note

`MAX_CV_BYTES` is 10 MB while Vercel accepts 100 MB bodies. The request body is still fully received before the check runs, so this limits model cost, not bandwidth. If bandwidth abuse becomes a problem, the control belongs in Vercel WAF rules, not here.

If BotID starts producing false positives, the symptom is users reporting HTTP 403 with the Hebrew blocked message. The fastest diagnostic is removing `/api/analyze-cv` from `instrumentation-client.ts` — that disables client-side telemetry collection and makes `checkBotId()` fail open.
