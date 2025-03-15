import { z } from "zod";

export const CVAnalysisSchema = z.object({
  match_percentage: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  keywords_found: z.array(z.string()),
  keywords_missing: z.array(z.string()),
});

export type CVAnalysisResults = z.infer<typeof CVAnalysisSchema>;
