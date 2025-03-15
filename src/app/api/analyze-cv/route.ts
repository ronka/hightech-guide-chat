import { NextResponse } from "next/server";

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

    // Mock response data
    const analysisResults = {
      match_percentage: jobDescription ? 75 : 50,
      strengths: [
        "רקע טכני חזק",
        "ניסיון בפרויקטים רלוונטיים",
        "כישורי תקשורת טובים",
      ],
      improvements: [
        "הוסף הישגים כמותיים",
        jobDescription
          ? "כלול טכנולוגיות ספציפיות שמוזכרות בתיאור המשרה"
          : "שקול להוסיף מילות מפתח ספציפיות לתעשייה",
        "הדגש ניסיון בהובלה",
      ],
      keywords_found: ["React", "TypeScript", "Node.js"],
      keywords_missing: ["Docker", "AWS", "CI/CD"],
    };

    return NextResponse.json(analysisResults);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
