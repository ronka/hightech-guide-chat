# 002 — Make the match score honest, using the roast-my-cv rubric

**Written against commit:** `95205fb`
**Depends on:** plan 001 (adds `job_title` to the schema — do 001 first to avoid two edits to the same file)
**Estimated time:** 2–3 hours
**Risk:** MED — changes the output schema and the displayed score; a bad prompt edit degrades analysis quality for every user

---

## Why this matters

The score is currently meaningless when no job description is supplied.

Measured against the same CV (a senior frontend engineer):

| Input | `match_percentage` |
|---|---|
| CV only, no job description | **92** |
| CV + a deliberately mismatched backend job description | **15** |

The job description field is optional and labelled `(אופציונלי)`, so most users will submit without one, get a flattering ~90, and conclude the tool is broken the first time a recruiter disagrees.

The reason is structural. The repo already contains a well-designed rubric in `.agents/skills/roast-my-cv/SKILL.md` (lines 107–114) that weights the score across six dimensions:

| Dimension | Points | Computable without a job description? |
|---|---|---|
| Hard requirement match | 35 | **No** |
| Relevant experience & domain alignment | 20 | Partly |
| Keyword & ATS overlap | 15 | **No** |
| Evidence of impact & measurable outcomes | 15 | Yes |
| Clarity & phrasing | 10 | Yes |
| Seniority & career-story coherence | 5 | Yes |

**Half the score is undefined without a job description.** The production prompt asks for one vague number instead, with no anti-inflation rule, which is why it returns 92.

This plan ports the rubric into the API and makes the UI honest about which score it is showing.

---

## Repo conventions you must follow

- TypeScript, Next.js 16 App Router, React 19, Zod v3 (`zod` ^3.25.76 — note: v3, not v4; use `.describe()`, not the v4 metadata API).
- Biome formatting: 2-space indent, double quotes.
- **Do NOT run** `npm run lint` / `format` / `check` — they mutate. Use `npx @biomejs/biome lint ./src`.
- All user-facing strings are Hebrew.
- The model call uses the AI SDK v6 `generateText` with `Output.object`. Model is `"google/gemini-2.5-flash"` via Vercel AI Gateway.

## Files in scope

- `src/types/cv-analysis.ts`
- `src/app/api/analyze-cv/route.ts`
- `src/app/cv-analysis/cv-analysis-results.tsx`
- `src/app/cv-analysis/cv-analysis-client.tsx` (one line — passing `hasJobDescription` through)

## Files explicitly OUT of scope

- `.agents/skills/roast-my-cv/**` — **read it, never edit it.** It is the user's own skill and the source of truth for the rubric.
- Do not add the skill's interactive intake flow (`SKILL.md:53–59`). That is a two-stage conversational loop; this endpoint is one-shot. Out of scope.
- Do not change the response language to English. The skill says "Always respond in English" (`SKILL.md:47`) — that rule does **not** transfer. This site is Hebrew.

---

## Step 1 — Extend the schema with sub-scores

**Current state.** `src/types/cv-analysis.ts` lines 3–10:

```ts
export const CVAnalysisSchema = z.object({
  match_percentage: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "Evaluate the CV's overall job fit based on its content, clarity, and industry alignment."
    ),
```

**The fix.** Add a `scores` object alongside `match_percentage`. Keep `match_percentage` — the UI and any stored data depend on it.

Insert after the `match_percentage` field (and after `job_title` if plan 001 is already applied):

```ts
  scores: z
    .object({
      hard_requirements: z
        .number()
        .min(0)
        .max(35)
        .describe(
          "Match against the job description's must-have requirements. 0-35. If no job description was supplied, return 0."
        ),
      experience_alignment: z
        .number()
        .min(0)
        .max(20)
        .describe(
          "Relevance of experience and domain to the target role. 0-20."
        ),
      ats_keywords: z
        .number()
        .min(0)
        .max(15)
        .describe(
          "Keyword and ATS overlap with the job description. 0-15. If no job description was supplied, return 0."
        ),
      impact_evidence: z
        .number()
        .min(0)
        .max(15)
        .describe(
          "Evidence of measurable outcomes and quantified achievements. 0-15."
        ),
      clarity: z
        .number()
        .min(0)
        .max(10)
        .describe("Clarity, compression, and phrasing quality. 0-10."),
      seniority_story: z
        .number()
        .min(0)
        .max(5)
        .describe("Seniority signalling and career-story coherence. 0-5."),
    })
    .describe(
      "Sub-scores by rubric dimension. These must sum to match_percentage."
    ),
  red_flags: z
    .array(z.string())
    .describe(
      "Specific detected weaknesses, in Hebrew. Examples: responsibility-phrased bullets instead of achievements, no metrics anywhere, generic summary boilerplate, unclear seniority, personal details that should be removed."
    ),
```

Also export a helper below the schema, after the existing `export type` line:

```ts
/**
 * Dimensions that cannot be scored without a job description.
 * Together these are 50 of the 100 available points.
 */
export const JD_DEPENDENT_POINTS = 50;
```

---

## Step 2 — Replace the prompt with the rubric

**Current state (line numbers refreshed against commit `0049ba2`, i.e. after plan 001 landed).** `src/app/api/analyze-cv/route.ts` passes **both** a `system:` parameter (starts line 63) and a second system message inside the `messages` array (`messages:` starts line 90; the duplicate system entry is at line 92, `role: "user"` at line 105, array closes line 121). The second system prompt is a stripped-down duplicate that omits every keyword rule. Two conflicting system prompts dilute the instruction.

**The fix.** Delete the duplicate system message entirely, and rewrite the single `system` prompt around the rubric.

2a. **Delete** the first entry of the `messages` array — the whole object from `{ role: "system",` (line 91–92) through the `},` that precedes `{ role: "user",` (line 105). The `messages` array must start directly with the `user` entry.

Verify the deletion with: `grep -c 'role: "system"' src/app/api/analyze-cv/route.ts` — must return `0`.

2b. Replace the `system:` string with the following. Read `.agents/skills/roast-my-cv/references/review-rubric.md` first for context on each dimension — the text below is condensed from it.

```ts
      system: `You are an expert CV reviewer for the Israeli hightech job market. Analyze the attached CV and return a structured review.

## Scoring

Score the CV on six dimensions. The six sub-scores MUST sum exactly to match_percentage.

- hard_requirements (0-35): match against the job description's must-have requirements.
- experience_alignment (0-20): relevance of experience, domain, and scope to the target role.
- ats_keywords (0-15): keyword and ATS overlap with the job description.
- impact_evidence (0-15): measurable outcomes. Prefer evidence, scope and numbers over responsibilities.
- clarity (0-10): tight wording, fast readability, low fluff, strong verbs.
- seniority_story (0-5): coherent career narrative and clear seniority.

${jobDescription
          ? `A job description WAS supplied. Score all six dimensions.`
          : `NO job description was supplied. You MUST return 0 for hard_requirements and 0 for ats_keywords, because there is nothing to match against. Score only the remaining four dimensions, for a maximum of 50. Do NOT inflate the other dimensions to compensate.`
        }

Scoring rules:
- Score the CV in front of you, not the candidate in the abstract.
- Hard requirement gaps matter more than wording improvements.
- Missing multiple explicit must-have requirements should cap the score below 85.
- Do NOT inflate the score to be polite. Use the full range.

## Red flags to detect

Report any of these that are present, phrased in Hebrew:
- Bullets that describe duties rather than outcomes ("responsible for", "helped with", "worked on", "took part in").
- No metrics anywhere in the document.
- Generic summary boilerplate that says nothing specific.
- Unclear or non-market-facing job titles (internal titles, academic titles).
- Unclear seniority, or mixed signals about role focus.
- Personal details that do not belong on an Israeli tech CV: ID number, driving licence, home address, personal photo, marital status.
- Star ratings or progress bars used to rate skills.
- High-school education listed by a candidate who is not early-career.
- Skills sections padded with irrelevant or obsolete technologies.

## Keywords

- keywords_found: the keywords present in the CV most relevant to the identified job title, including skills, technologies and industry terms.
- keywords_missing: keywords that appear in the JOB DESCRIPTION but not in the CV.
  - Missing keywords MUST come from the job description. If no job description was supplied, return an empty array.
  - Do not list a keyword as missing if the CV contains an equivalent. "Front-end" in the job description is satisfied by "Frontend" in the CV. "accessible technologies" is satisfied by "Led accessibility improvements, achieving WCAG 2.0 AA".

<keywords_examples>
Front-end: "React", "Next.js", "javascript", "typescript", "css", "html", "react native", "flutter", "kotlin", "swift"
Back-end: "Node.js", "Express", "MongoDB", "PostgreSQL", "MySQL", "Java", "Python", "C#", "Ruby", "PHP", "Go"
All roles: "AWS", "Docker", "Kubernetes", "CI/CD", "Agile", "Scrum", "עבודת צוות"
</keywords_examples>

## Improvements

Each entry in "improvements" must be specific and actionable. Where a weak bullet exists, quote the original phrasing and give the improved rewrite in the same entry. Never invent metrics the CV does not support — if a number is needed, tell the candidate to supply it.

${jobDescription
          ? "Compare the CV against the provided job description."
          : "Analyze the CV for general market readiness."
        }

You MUST respond in Hebrew. Keep every string concise and actionable.`,
```

> **STOP and report back if:** removing the duplicate system message changes the response language to English or breaks structured output. Both system prompts currently end with "You MUST respond in Hebrew" — the replacement above keeps that instruction, but verify it in step 4.

---

## Step 3 — Make the UI honest about which score it shows

**Current state.** `src/app/cv-analysis/cv-analysis-results.tsx` lines 29–37 (after plan 001 added the job-title header above it):

```tsx
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">ציון התאמה</span>
            <span className="text-sm font-medium">
              {results.match_percentage}%
            </span>
          </div>
          <Progress value={results.match_percentage} className="h-2" />
        </div>
```

`hasJobDescription` is already a prop on this component (line 11) and is already passed from `cv-analysis-client.tsx:122`. Use it.

**The fix.** Replace that block with:

```tsx
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              {hasJobDescription ? "ציון התאמה למשרה" : "ציון איכות קורות חיים"}
            </span>
            <span className="text-sm font-medium">
              {hasJobDescription
                ? `${results.match_percentage}%`
                : `${results.match_percentage}/50`}
            </span>
          </div>
          <Progress
            value={
              hasJobDescription
                ? results.match_percentage
                : (results.match_percentage / 50) * 100
            }
            className="h-2"
          />
          {!hasJobDescription && (
            <p className="text-xs text-muted-foreground">
              ללא תיאור משרה ניתן להעריך רק את איכות המסמך. הוסיפו תיאור משרה
              לקבלת ציון התאמה מלא.
            </p>
          )}
        </div>
```

This is the core of the fix: without a job description the user sees `34/50` labelled "CV quality score" plus a prompt to add a job description — not a meaningless `92%` labelled "match score".

**Also add the red flags section.** Insert after the improvements column block (after the closing `</div>` of the grid that ends around line 62):

```tsx
        {results.red_flags?.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              דגלים אדומים
            </h3>
            <ul className="space-y-2">
              {results.red_flags.map((flag) => (
                <li key={flag} className="text-sm">
                  • {flag}
                </li>
              ))}
            </ul>
          </div>
        )}
```

Note `key={flag}` rather than the array index — Biome flags `noArrayIndexKey` and the existing code already violates it four times. Do not add a fifth.

---

## Step 4 — Verify against real model output

The only way to validate a prompt change is to run it. This costs a few Gemini calls.

```bash
npm run dev
```

Create a test PDF (macOS, no installs needed):

```bash
printf 'Jane Doe\nSenior Frontend Engineer\n\nEXPERIENCE\nWix, 2021-Present\n- Led migration to React 18, reducing bundle size by 42%%.\n- Built a component library used by 12 teams.\n\nSKILLS\nReact, TypeScript, Next.js, AWS, Docker\n' > /tmp/cv.txt
/usr/sbin/cupsfilter /tmp/cv.txt > /tmp/cv.pdf
```

**Test A — no job description.** Expect `hard_requirements: 0`, `ats_keywords: 0`, `keywords_missing: []`, and a total at or below 50.

```bash
curl -s -X POST http://localhost:3000/api/analyze-cv \
  -F "cv=@/tmp/cv.pdf;type=application/pdf" | python3 -m json.tool
```

**Test B — mismatched job description.** Expect a low `hard_requirements`, a populated `keywords_missing`, and a total well below 50.

```bash
curl -s -X POST http://localhost:3000/api/analyze-cv \
  -F "cv=@/tmp/cv.pdf;type=application/pdf" \
  -F "jobDescription=Senior Backend Engineer. Required: 5+ years Go or Java, Kubernetes, gRPC, Kafka, Terraform, PCI-DSS compliance." \
  | python3 -m json.tool
```

**Check on both runs:**
1. Every string in `strengths`, `improvements`, and `red_flags` is Hebrew.
2. The six values in `scores` sum to `match_percentage`. If they do not, add an explicit reconciliation line to the prompt: `Before responding, verify that the six sub-scores sum exactly to match_percentage. If they do not, correct match_percentage.`
3. Test A returns `hard_requirements: 0` and `ats_keywords: 0`. If the model ignores this, strengthen the wording in the no-JD branch.

Adjust the prompt and re-run until all three hold. Budget 3–5 iterations.

---

## Done criteria

1. `npx tsc --noEmit` reports no new errors in the files in scope.
2. Test A returns `hard_requirements === 0` and `ats_keywords === 0` and `keywords_missing.length === 0`.
3. Test B returns `hard_requirements < 15` and `keywords_missing.length > 5`.
4. On both runs, the six sub-scores sum to `match_percentage`.
5. In the browser with no job description, the results screen reads `ציון איכות קורות חיים` and `NN/50` — never a bare percentage.
6. `route.ts` contains exactly one system prompt. `grep -c 'role: "system"' src/app/api/analyze-cv/route.ts` returns `0`.

## Test plan

Add to `src/types/cv-analysis.test.ts` (created in plan 001):

- `scores` with all six dimensions at their maxima parses, and the values sum to 100.
- A `scores` object with `hard_requirements: 36` is rejected (exceeds the 35 cap).
- A response missing `red_flags` is rejected.
- `red_flags: []` is accepted (an empty array is valid — a clean CV has no red flags).

Do not write tests that call the real model.

## Maintenance note

The rubric now lives in two places: `.agents/skills/roast-my-cv/SKILL.md:107-114` and this API prompt. If the weights change in one, change them in the other. Add a comment above the `system:` string:

```ts
// Rubric weights mirror .agents/skills/roast-my-cv/SKILL.md (Scoring section).
// Keep the two in sync — the skill is the source of truth.
```

The point caps in the Zod schema (35/20/15/15/10/5) encode the same weights a third time. If weights change, all three must move together.
