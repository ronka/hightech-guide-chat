import path from "path";
import fs from "fs/promises";
import { type NextRequest, NextResponse } from "next/server";

const MARKDOWN_FILES: Record<string, string> = {
  index: "index.html.md",
  "cracking-the-job-interview": "cracking-the-job-interview.html.md",
  "cv-analysis": "cv-analysis.html.md",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const fileName = MARKDOWN_FILES[slug];

  if (!fileName) {
    return NextResponse.json(
      { code: "not_found", error: `No markdown variant for '${slug}'.` },
      { status: 404 },
    );
  }

  const content = await fs.readFile(
    path.join(process.cwd(), "public", fileName),
    "utf8",
  );

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
      "X-Robots-Tag": "noindex",
    },
  });
}
