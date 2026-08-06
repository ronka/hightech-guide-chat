import { CVAnalysisSchema } from "./cv-analysis";

describe("CVAnalysisSchema", () => {
  const validObject = {
    job_title: "מהנדס תוכנה",
    match_percentage: 75,
    strengths: ["ניסיון בריאקט"],
    improvements: ["חסר ניסיון בענן"],
    keywords_found: ["React", "TypeScript"],
    keywords_missing: ["AWS"],
  };

  test("parses a complete valid object including job_title", () => {
    const result = CVAnalysisSchema.safeParse(validObject);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.job_title).toBe("מהנדס תוכנה");
    }
  });

  test("rejects an object missing job_title", () => {
    const { job_title, ...withoutJobTitle } = validObject;
    const result = CVAnalysisSchema.safeParse(withoutJobTitle);
    expect(result.success).toBe(false);
  });

  test("rejects match_percentage of 101", () => {
    const result = CVAnalysisSchema.safeParse({
      ...validObject,
      match_percentage: 101,
    });
    expect(result.success).toBe(false);
  });

  test("rejects match_percentage of -1", () => {
    const result = CVAnalysisSchema.safeParse({
      ...validObject,
      match_percentage: -1,
    });
    expect(result.success).toBe(false);
  });
});
