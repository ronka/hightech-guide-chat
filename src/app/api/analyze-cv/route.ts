import { NextRequest, NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { CVAnalysisSchema } from "@/types/cv-analysis";
import { env } from "@/services/config";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import logger from "@/services/logger";

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

// Allow 20 requests per day per client IP
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(20, "1 d"),
});

export async function POST(request: NextRequest) {
  const identifier = (
    request.headers.get("x-forwarded-for") ?? "127.0.0.1"
  ).split(",")[0];
  const rateLimitResult = await ratelimit.limit(identifier);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        message: `הגעת למגבלת השימוש היומית. נסה שוב בעוד ${Math.ceil(
          (rateLimitResult.reset - Date.now()) / (1000 * 60 * 60)
        )} שעות.`,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": rateLimitResult.reset.toString(),
        },
      }
    );
  }

  try {
    const formData = await request.formData();
    const cvFile = formData.get("cv");
    const jobDescription = formData.get("jobDescription")?.toString() || "";

    if (!(cvFile instanceof File)) {
      return NextResponse.json(
        { message: "לא התקבל קובץ קורות חיים. נא להעלות קובץ PDF." },
        { status: 400 }
      );
    }

    const cvData = Buffer.from(await cvFile.arrayBuffer());

    const result = await generateText({
      model: "google/gemini-2.5-flash",
      output: Output.object({
        schema: CVAnalysisSchema
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

${jobDescription
          ? "A job description WAS supplied. Score all six dimensions."
          : "NO job description was supplied. You MUST return 0 for hard_requirements and 0 for ats_keywords, because there is nothing to match against. Score only the remaining four dimensions, for a maximum of 50. Do NOT inflate the other dimensions to compensate."
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

Each entry in "improvements" must be specific and actionable. Where a weak bullet exists, quote the original phrasing and give the improved rewrite in the same entry. Never invent metrics the CV does not support — if a number is needed, tell the candidate to supply it.

${jobDescription
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
              text: `Analyze the attached CV.${jobDescription
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
        message:
          "הניתוח נכשל. ייתכן שהקובץ פגום או בפורמט שאינו נתמך. נסו קובץ PDF אחר.",
      },
      { status: 500 }
    );
  }
}
