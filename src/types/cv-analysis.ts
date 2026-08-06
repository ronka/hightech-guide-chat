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
