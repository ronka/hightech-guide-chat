import { CVAnalysisSchema } from "./cv-analysis";

describe("CVAnalysisSchema", () => {
  const validScores = {
    hard_requirements: 35,
    experience_alignment: 20,
    ats_keywords: 15,
    impact_evidence: 15,
    clarity: 10,
    seniority_story: 5,
  };

  const validObject = {
    job_title: "מהנדס תוכנה",
    match_percentage: 75,
    scores: {
      hard_requirements: 25,
      experience_alignment: 15,
      ats_keywords: 10,
      impact_evidence: 15,
      clarity: 7,
      seniority_story: 3,
    },
    red_flags: [],
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

  test("parses scores with all six dimensions at their maxima summing to 100", () => {
    const sum = Object.values(validScores).reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);

    const result = CVAnalysisSchema.safeParse({
      ...validObject,
      match_percentage: 100,
      scores: validScores,
    });
    expect(result.success).toBe(true);
  });

  test("rejects a scores object with hard_requirements exceeding the 35 cap", () => {
    const result = CVAnalysisSchema.safeParse({
      ...validObject,
      scores: {
        ...validObject.scores,
        hard_requirements: 36,
      },
    });
    expect(result.success).toBe(false);
  });

  test("rejects an object missing red_flags", () => {
    const { red_flags, ...withoutRedFlags } = validObject;
    const result = CVAnalysisSchema.safeParse(withoutRedFlags);
    expect(result.success).toBe(false);
  });

  test("accepts an empty red_flags array", () => {
    const result = CVAnalysisSchema.safeParse({
      ...validObject,
      red_flags: [],
    });
    expect(result.success).toBe(true);
  });
});
