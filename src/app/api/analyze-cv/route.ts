import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { CVAnalysisSchema } from "@/types/cv-analysis";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const cv = formData.get("cv");
    const jobDescription = formData.get("jobDescription") || "";

    if (!cv) {
      return NextResponse.json(
        { error: "CV file is required" },
        { status: 400 }
      );
    }

    // Handle the CV content - FormData files are Blob objects in Next.js
    let cvText = "";
    if (cv instanceof Blob) {
      cvText = await cv.text();
    } else {
      cvText = cv.toString();
    }

    const result = await generateObject({
      model: google("gemini-2.0-flash-001"),
      system: `You are an expert CV analyzer with deep knowledge of job market trends and industry requirements. Your task is to analyze the provided CV and deliver a comprehensive review. Your analysis should include:

- Job Title Identification: Determine the most accurate job title based on the CV's content.
- Match Percentage (0-100%): Evaluate the CV's overall job fit based on its content, clarity, and industry alignment.
- Key Strengths: Identify the candidate’s primary strengths, including technical skills, soft skills, and industry experience.
- Areas for Improvement: Highlight any weaknesses or areas that could be improved for better job prospects.
- Extracted Keywords: List the most relevant to the job title keywords found in the CV, including skills, technologies, and industry terms.
- Missing Important Keywords: List keywords that appear in the job description but are not found in the CV.

${
  jobDescription
    ? "Compare the CV against the provided job description."
    : "Analyze the CV for general job market fit."
}

Ensure that your response is structured, concise, and actionable. If possible, provide insights on how to optimize the CV for better alignment with industry standards and job market trends.		
You MUST respond in Hebrew.`,
      prompt: `CV Content:\n${cvText}\n${
        jobDescription ? `Job Description:\n${jobDescription}` : ""
      }`,
      schema: CVAnalysisSchema,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("CV Analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
