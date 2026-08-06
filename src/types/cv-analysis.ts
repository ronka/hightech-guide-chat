import { z } from "zod";

export const CVAnalysisSchema = z.object({
  job_title: z
    .string()
    .describe(
      "The most accurate market-facing job title for this CV, in Hebrew."
    ),
  match_percentage: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "Evaluate the CV's overall job fit based on its content, clarity, and industry alignment."
    ),
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
  strengths: z
    .array(z.string())
    .describe(
      "Identify the candidate’s primary strengths, including technical skills, soft skills, and industry experience."
    ),
  improvements: z
    .array(z.string())
    .describe(
      "Highlight any weaknesses or areas that could be improved for better job prospects."
    ),
  keywords_found: z
    .array(z.string())
    .describe("Most relevant keywords found in the CV."),
  keywords_missing: z
    .array(z.string())
    .describe(
      "Keywords that appear in the job description but are not found in the CV."
    ),
});

export type CVAnalysisResults = z.infer<typeof CVAnalysisSchema>;

/**
 * Dimensions that cannot be scored without a job description.
 * Together these are 50 of the 100 available points.
 */
export const JD_DEPENDENT_POINTS = 50;
