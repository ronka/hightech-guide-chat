import { type NextRequest, NextResponse } from "next/server";

// Pages with a hand-authored markdown twin under /public, served via
// content negotiation (acceptmarkdown.com) at /md/<slug>.
const MARKDOWN_NEGOTIATED_ROUTES: Record<string, string> = {
  "/": "index",
  "/cracking-the-job-interview": "cracking-the-job-interview",
  "/cv-analysis": "cv-analysis",
};

function prefersMarkdown(request: NextRequest) {
  const accept = request.headers.get("accept") ?? "";
  return accept.includes("text/markdown") && !accept.includes("text/html");
}

export function proxy(request: NextRequest) {
  const markdownSlug = MARKDOWN_NEGOTIATED_ROUTES[request.nextUrl.pathname];
  if (markdownSlug && request.method === "GET" && prefersMarkdown(request)) {
    return NextResponse.rewrite(new URL(`/md/${markdownSlug}`, request.url));
  }

  return NextResponse.next();
}

// Scoped to only the negotiated paths: /courses access control lives in
// src/app/courses/layout.tsx (the mechanism that's actually been enforcing
// it — the root-level middleware.ts this file replaces never compiled,
// since the app lives under src/app), so it's left untouched here.
export const config = {
  matcher: ["/", "/cracking-the-job-interview", "/cv-analysis"],
};
