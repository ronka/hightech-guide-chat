import { z } from "zod";

export const CVAnalysisSchema = z.object({
  job_title: z
    .string()
    .describe(
      "The most accurate market-facing job title for this CV, in Hebrew.",
    ),
  match_percentage: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "Evaluate the CV's overall job fit based on its content, clarity, and industry alignment.",
    ),
  scores: z
    .object({
      hard_requirements: z
        .number()
        .min(0)
        .max(35)
        .describe(
          "Match against the job description's must-have requirements. 0-35. If no job description was supplied, return 0.",
        ),
      experience_alignment: z
        .number()
        .min(0)
        .max(20)
        .describe(
          "Relevance of experience and domain to the target role. 0-20.",
        ),
      ats_keywords: z
        .number()
        .min(0)
        .max(15)
        .describe(
          "Keyword and ATS overlap with the job description. 0-15. If no job description was supplied, return 0.",
        ),
      impact_evidence: z
        .number()
        .min(0)
        .max(15)
        .describe(
          "Evidence of measurable outcomes and quantified achievements. 0-15.",
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
      "Sub-scores by rubric dimension. These must sum to match_percentage.",
    ),
  red_flags: z
    .array(z.string())
    .describe(
      "Specific detected weaknesses, in Hebrew. Examples: responsibility-phrased bullets instead of achievements, no metrics anywhere, generic summary boilerplate, unclear seniority, personal details that should be removed.",
    ),
  strengths: z
    .array(z.string())
    .describe(
      "Identify the candidate’s primary strengths, including technical skills, soft skills, and industry experience.",
    ),
  improvements: z
    .array(z.string())
    .describe(
      "Highlight any weaknesses or areas that could be improved for better job prospects.",
    ),
  keywords_found: z
    .array(z.string())
    .describe("Most relevant keywords found in the CV."),
  keywords_missing: z
    .array(z.string())
    .describe(
      "Keywords that appear in the job description but are not found in the CV.",
    ),
});

export type CVAnalysisResults = z.infer<typeof CVAnalysisSchema>;

/**
 * Dimensions that cannot be scored without a job description.
 * Together these are 50 of the 100 available points.
 */
export const JD_DEPENDENT_POINTS = 50;

/**
 * The rubric, in display order, with the Hebrew labels the results UI uses.
 * `short` is for narrow contexts where the full label will not fit.
 * Maxima mirror the `scores` sub-schema above and must stay in sync with it.
 */
export const RUBRIC_DIMENSIONS = [
  { key: "hard_requirements", label: "דרישות חובה", short: "חובה", max: 35 },
  {
    key: "experience_alignment",
    label: "התאמת ניסיון",
    short: "ניסיון",
    max: 20,
  },
  { key: "ats_keywords", label: "מילות מפתח ו-ATS", short: "ATS", max: 15 },
  { key: "impact_evidence", label: "הוכחת אימפקט", short: "אימפקט", max: 15 },
  { key: "clarity", label: "בהירות וניסוח", short: "בהירות", max: 10 },
  {
    key: "seniority_story",
    label: "סיפור הסניוריטי",
    short: "סניוריטי",
    max: 5,
  },
] as const satisfies ReadonlyArray<{
  key: keyof CVAnalysisResults["scores"];
  label: string;
  short: string;
  max: number;
}>;

export type RubricDimension = (typeof RUBRIC_DIMENSIONS)[number];

/** Dimensions the model can only score when a job description was supplied. */
const JD_DEPENDENT_KEYS: ReadonlyArray<RubricDimension["key"]> = [
  "hard_requirements",
  "ats_keywords",
];

/**
 * The dimensions worth showing for this analysis. Without a job description
 * the JD-dependent dimensions are forced to 0 by the schema, so rendering them
 * would show zeros that the user cannot act on.
 */
export function visibleDimensions(
  hasJobDescription: boolean,
): readonly RubricDimension[] {
  if (hasJobDescription) return RUBRIC_DIMENSIONS;
  return RUBRIC_DIMENSIONS.filter((d) => !JD_DEPENDENT_KEYS.includes(d.key));
}
