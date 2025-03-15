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
      system: `You are a professional CV analyzer. Analyze the CV and provide detailed feedback including:
        - A match percentage (0-100) based on job fit
        - Key strengths found in the CV
        - Areas for improvement
        - Keywords found in the CV
        - Important keywords that are missing
        ${
          jobDescription
            ? "Compare the CV against the provided job description."
            : "Analyze the CV for general job market fit."
        }
		
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
