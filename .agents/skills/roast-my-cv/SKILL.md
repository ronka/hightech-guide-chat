---
name: roast-my-cv
description: Review a resume against a target job description, score the fit, and give concrete resume improvement guidance
---

# Roast My CV

Analyze a resume against a specific job description and produce a concise, actionable review. Output should fit on one screen: score, strengths, gaps, and inline rewrites. No walls of text.

## Input Contract

Expect the user to provide tagged sections in the prompt:

```text
Use $roast-my-cv

Resume:
/absolute/path/to/resume.md

Job Description:
<pasted job description text>

Target Role:
Senior Backend Engineer
```

Treat the content under `Resume:` and `Job Description:` as either:
- Direct pasted text, or
- A local file path if the value is short and path-like

If a tagged value looks like a local path, read the file before continuing.

## Required Behavior

Always respond in English.

Always print the first line in exactly this format:

```text
Fit Score: X/100
```

Never ask clarifying questions before printing `Fit Score:`.

If a provided file path does not exist or cannot be read, say that clearly and ask for a corrected path or pasted content.

## Review Workflow

### 1. Build the target profile

Extract the following from the job description:
- Core responsibilities
- Required tools, technologies, and domain keywords
- Seniority expectations
- Evidence of leadership, ownership, communication, or stakeholder work
- Must-have qualifications versus nice-to-have qualifications

If `Target Role:` is present, use it to resolve ambiguous titles or seniority expectations.

### 2. Evaluate the resume against the target

Score the resume based on:
- Role/title alignment
- Keyword and ATS overlap
- Relevance of experience
- Evidence of impact and measurable outcomes
- Clarity and phrasing
- Seniority and career-story coherence

Be skeptical of vague claims. Prefer evidence, scope, and outcomes over responsibilities.

### 3. Apply the CV guidance

Use the rubric in [references/review-rubric.md](references/review-rubric.md).

In particular:
- Tailor the CV to the role and mirror the job description language where appropriate
- Do not write a generic opening summary in the fixed CV output
- If the opening summary needs work, tell the user to rewrite it in their own voice and use a clear placeholder in the generated CV instead of inventing personal positioning
- Remove low-value filler
- Tighten bullets so every line earns its space
- Prefer achievements over duties
- Quantify results wherever possible
- Replace vague phrasing with concrete contribution and outcome
- Normalize unusual or internal titles into standard market-facing titles
- Keep titles aligned with how the target company describes the role

### 4. Produce rewrite-ready guidance

When you call out a weak bullet, include the rewrite inline — do not separate critique from solution.

## Output Format

Use this exact structure:

```text
Fit Score: X/100

ATS Compatibility:
- Good matches: 
    - keyword
    - keyword
    - keyword
- Missing keywords:
    - keyword
    - keyword
    - keyword

Suggested Rewrites:
- Original: "original bullet text"
  →
  Rewrite: "improved bullet text"

- Original: "original bullet text"
  →
  Rewrite: "improved bullet text"
...

Would you like me to output a markdown file with the fixed CV?
```

Rules:
- ATS keywords are listed inline comma-separated, not as individual bullets.
- Suggested Rewrites cover every bullet worth improving — use `→` to show original vs rewrite.
- No preamble before the score. No extra sections.
- Always end with the question asking if the user wants a markdown file with the fixed CV.

## Tone

Direct, professional, brief. No fluff, no encouragement padding, no sarcasm. Every word earns its place.

## Scoring Guidance

Use the full 0-100 range.

Suggested interpretation:
- `85-100`: Strong fit, mostly needs polishing and keyword tailoring
- `70-84`: Viable fit, but important improvements are needed
- `50-69`: Partial fit, needs substantive repositioning or stronger evidence
- `0-49`: Weak fit for the stated role

Do not inflate the score to be polite.

## Handling Weak Inputs

If the resume is extremely short, inconsistent, or obviously generic:
- Say so plainly
- Score accordingly
- Focus on the highest-leverage fixes first

If the resume contains unusual titles such as internal-only titles or unclear academic/course titles:
- Translate them into standard market-facing titles when suggesting rewrites
- Explain why the normalized title will read better to recruiters and ATS systems

## References

Use these references when useful:
- [references/review-rubric.md](references/review-rubric.md)
- [references/good-resume-mock.md](references/good-resume-mock.md)
- [references/bad-resume-mock.md](references/bad-resume-mock.md)
- [references/how-to-write-good-resume.md](references/how-to-write-good-resume.md)

The mock resume references are calibration aids, not strict templates. Use them to anchor what strong and weak resume writing looks like.

## Fixed CV Output Rules

If the user asks you to output a fixed CV as a markdown file:
- Keep the summary near the top only as a placeholder if the current summary is generic, weak, or overly templated
- The placeholder should explicitly tell the user to rewrite the summary in their own voice
- Put the `Skills` section near the bottom of the CV
- Format `Skills` as a single comma-separated line to save space
- Do not use a multi-line bulleted list for skills unless the user explicitly asks for it
