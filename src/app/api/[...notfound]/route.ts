import { type NextRequest, NextResponse } from "next/server";

function jsonNotFound(request: NextRequest) {
  return NextResponse.json(
    {
      code: "not_found",
      error: `No API route matches ${request.nextUrl.pathname}.`,
      hint: "See /openapi.json for the documented API surface, or /llms.txt for a docs index.",
    },
    { status: 404 },
  );
}

export const GET = jsonNotFound;
export const POST = jsonNotFound;
export const PUT = jsonNotFound;
export const PATCH = jsonNotFound;
export const DELETE = jsonNotFound;
export const OPTIONS = jsonNotFound;
