import { env } from "@/services/config";
import logger from "@/services/logger";
import { CVAnalysisSchema } from "@/types/cv-analysis";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { Output, generateText } from "ai";
import { checkBotId } from "botid/server";
import { type NextRequest, NextResponse } from "next/server";
import { validateCvUpload } from "./validation";

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

// Allow 20 requests per day per client IP
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(20, "1 d"),
});

// Local dev has no x-forwarded-for, so every request buckets to 127.0.0.1 and
// a single afternoon of testing burns the whole daily quota — against the same
// Upstash instance production uses. Skip the limit outside production.
const isRateLimitEnabled = process.env.NODE_ENV === "production";

export async function POST(request: NextRequest) {
  // Everything below can throw (bot check, rate limiter, form parsing, the
  // model call) — wrapped in one try/catch so every failure mode, including
  // infra errors in checkBotId/ratelimit, still returns a JSON envelope
  // instead of Next's default empty HTML 500.
  try {
    const verification = await checkBotId();
    if (verification.isBot) {
      return NextResponse.json(
        {
          code: "bot_detected",
          message: "הבקשה נחסמה. אם אתם משתמשים אמיתיים, נסו שוב מדפדפן אחר.",
          hint: "Automated traffic is blocked on this endpoint; retry from a real browser session.",
        },
        { status: 403 },
      );
    }

    // Vercel overwrites x-forwarded-for and refuses to forward external IPs, so
    // the leftmost entry is trustworthy TODAY. If a proxy (e.g. Cloudflare) is
    // ever put in front of Vercel, this becomes client-controlled and the daily
    // quota is trivially bypassable. Switch to x-vercel-forwarded-for if that happens.
    const identifier = (
      request.headers.get("x-forwarded-for") ?? "127.0.0.1"
    ).split(",")[0];

    if (isRateLimitEnabled) {
      const rateLimitResult = await ratelimit.limit(identifier);

      if (!rateLimitResult.success) {
        return NextResponse.json(
          {
            code: "rate_limited",
            message: `הגעת למגבלת השימוש היומית. נסה שוב בעוד ${Math.ceil(
              (rateLimitResult.reset - Date.now()) / (1000 * 60 * 60),
            )} שעות.`,
            hint: "Retry after the timestamp in the X-RateLimit-Reset header (epoch ms).",
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": rateLimitResult.limit.toString(),
              "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
              "X-RateLimit-Reset": rateLimitResult.reset.toString(),
            },
          },
        );
      }
    }

    const formData = await request.formData();
    const cvFile = formData.get("cv");
    const jobDescription = formData.get("jobDescription")?.toString() || "";

    if (!(cvFile instanceof File)) {
      return NextResponse.json(
        {
          code: "missing_file",
          message: "לא התקבל קובץ קורות חיים. נא להעלות קובץ PDF.",
          hint: "Send the CV as a 'cv' field of type File in a multipart/form-data body.",
        },
        { status: 400 },
      );
    }

    const validation = validateCvUpload(cvFile, jobDescription);
    if (!validation.ok) {
      return NextResponse.json(
        { code: validation.code, message: validation.message },
        { status: validation.status },
      );
    }

    const cvData = Buffer.from(await cvFile.arrayBuffer());

    const result = await generateText({
      model: "google/gemini-2.5-flash",
      output: Output.object({
        schema: CVAnalysisSchema,
      }),
      // Rubric weights mirror .agents/skills/roast-my-cv/SKILL.md (Scoring section).
      // Keep the two in sync — the skill is the source of truth.
      system: `You are an expert CV reviewer for the Israeli hightech job market. Analyze the attached CV and return a structured review.

## Scoring

Score the CV on six dimensions. The six sub-scores MUST sum exactly to match_percentage.

- hard_requirements (0-35): match against the job description's must-have requirements.
- experience_alignment (0-20): relevance of experience, domain, and scope to the target role.
- ats_keywords (0-15): keyword and ATS overlap with the job description.
- impact_evidence (0-15): measurable outcomes. Prefer evidence, scope and numbers over responsibilities.
- clarity (0-10): tight wording, fast readability, low fluff, strong verbs.
- seniority_story (0-5): coherent career narrative and clear seniority.

${
  jobDescription
    ? "A job description WAS supplied. Score all six dimensions."
    : "NO job description was supplied. You MUST return 0 for hard_requirements and 0 for ats_keywords, because there is nothing to match against. Score only the remaining four dimensions, for a maximum of 50. Do NOT inflate the other dimensions to compensate."
}

Scoring rules:
- Score the CV in front of you, not the candidate in the abstract.
- Hard requirement gaps matter more than wording improvements.
- Missing multiple explicit must-have requirements should cap the score below 85.
- Do NOT inflate the score to be polite. Use the full range.

## The fix list

"red_flags" and "improvements" are rendered to the user as a single checklist of things to DO. Every entry in both arrays is an object with two fields:

- issue: what is wrong. One concrete sentence, quoting the CV's own wording where possible.
- action: what to change. MUST start with an imperative verb addressed to the candidate, in Hebrew second-person plural (החליפו, הוסיפו, נסחו, מחקו, פרטו) — the voice the rest of the interface uses.

Rules for "action":
- It must never restate the issue. "פסקת הסיכום גנרית" describes a problem; it is not an action.
- It must be specific enough to execute without further thought. Say what to write, not that something should be better.
- Never invent metrics the CV does not support. If a number is needed, instruct the candidate to supply it.

<fix_example>
issue: "פסקת הסיכום פותחת ב-'Dedicated and efficient' — ניסוח שמתאים לכל מועמד ולא אומר עליכם דבר."
action: "החליפו את פסקת הסיכום בשתי שורות: תחום ההתמחות, שנות הניסיון, וההישג הבולט ביותר שלכם עם מספר."
</fix_example>

## Red flags to detect

Report any of these that are present, as issue/action pairs in Hebrew:
- Bullets that describe duties rather than outcomes ("responsible for", "helped with", "worked on", "took part in").
- No metrics anywhere in the document.
- Generic summary boilerplate that says nothing specific.
- Unclear or non-market-facing job titles (internal titles, academic titles).
- Unclear seniority, or mixed signals about role focus.
- Personal details that do not belong on an Israeli tech CV: ID number, driving licence, home address, personal photo, marital status.
- Star ratings or progress bars used to rate skills.
- High-school education listed by a candidate who is not early-career.
- Skills sections padded with irrelevant or obsolete technologies.

## Job title

- job_title: the most accurate market-facing job title for this CV. MUST be written in Hebrew, even when the CV itself is in English.

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

Same issue/action shape as the red flags, for weaknesses that are not outright red flags. Where a weak bullet exists, the "issue" quotes the original phrasing and the "action" gives the improved rewrite. Never invent metrics the CV does not support — if a number is needed, tell the candidate to supply it.

${
  jobDescription
    ? "Compare the CV against the provided job description."
    : "Analyze the CV for general market readiness."
}

You MUST respond in Hebrew. Keep every string concise and actionable.`,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze the attached CV.${
                jobDescription
                  ? ` Compare against this job description: ${jobDescription}`
                  : ""
              } `,
            },
            {
              type: "file",
              data: cvData,
              mediaType: cvFile.type,
            },
          ],
        },
      ],
    });

    const output = await result.output;
    return NextResponse.json({ object: output });
  } catch (error) {
    logger.error({ err: error }, "CV Analysis failed");
    return NextResponse.json(
      {
        code: "analysis_failed",
        message:
          "הניתוח נכשל. ייתכן שהקובץ פגום או בפורמט שאינו נתמך. נסו קובץ PDF אחר.",
        hint: "Retry with a different, non-corrupted PDF file.",
      },
      { status: 500 },
    );
  }
}
