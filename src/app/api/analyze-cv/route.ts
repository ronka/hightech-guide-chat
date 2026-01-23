import { NextRequest, NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { CVAnalysisSchema } from "@/types/cv-analysis";
import { env } from "@/services/config";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

// Create a new ratelimiter, that allows 5 requests per 1 day
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
      return NextResponse.json({ error: "CV must be a file" }, { status: 400 });
    }

    const cvData = Buffer.from(await cvFile.arrayBuffer());

    const result = await generateText({
      model: "google/gemini-2.5-flash",
      // output: Output.object({ schema: CVAnalysisSchema }),
      output: Output.object({
        schema: CVAnalysisSchema
      }),
      system: `You are an expert CV analyzer with deep knowledge of job market trends and industry requirements. Your task is to analyze the provided CV and deliver a comprehensive review. Your analysis should include:

- Job Title Identification: Determine the most accurate job title based on the CV's content. set it as <job_title>
- Match Percentage (0-100%): Evaluate the CV's overall job fit based on its content, clarity, and industry alignment.
- Key Strengths: Identify the candidate's primary strengths, including technical skills, soft skills, and industry experience.
- Areas for Improvement: Highlight any weaknesses or areas that could be improved for better job prospects.
- Extracted Keywords: List the most relevant to the <job_title> keywords found in the CV, including skills, technologies, and industry terms. see example for keywords in <keywords_examples>
- Missing Important Keywords: List keywords that appear in the job description but are not found in the CV.
    - the missing keywords MUST be in the job description!
	- If a resume contains keywords similar to those in the job description, don't list them as missing keywords. for example: if the job description mentions "accessible technologies" and i have "Led accessibility improvements, achieving WCAG 2.0 AA across all main products." dont mention "accessible technologies" in the missing keywords list. if "Front-end" is mentioned in the job description, dont mention "Frontend" in the missing keywords list.

${jobDescription
          ? "Compare the CV against the provided job description."
          : "Analyze the CV for general job market fit."
        }

Ensure that your response is structured, concise, and actionable.If possible, provide insights on how to optimize the CV for better alignment with industry standards and job market trends.
You MUST respond in Hebrew.

<keywords_examples>
Small example of keywords for different job titles, this is partial list:

Example of keywords for Front - end: "React", "Next.js", "javascript", "typescript", "css", "html", "react native", "flutter", "kotlin", "swift", "react native", "flutter", "kotlin", "swift"
Example of keywords for Back - end: "Node.js", "Express", "MongoDB", "PostgreSQL", "MySQL", "Java", "Python", "C#", "Ruby", "PHP", "Go", "Kotlin", "Swift"
Example for all job titles: "AWS", "Docker", "Kubernetes", "CI/CD", "Agile", "Scrum", "Agile methodologies", "עבודת צוות" ).
  </keywords_examples>
    `,
      messages: [
        {
          role: "system",
          content: `You are an expert CV analyzer with deep knowledge of job market trends and industry requirements.
Your task is to analyze the provided CV and deliver a comprehensive review.

    ${jobDescription
              ? "Compare the CV against the provided job description."
              : "Analyze the CV for general job market fit."
            }

You MUST respond in Hebrew.
`,
        },
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
    console.error("CV Analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
