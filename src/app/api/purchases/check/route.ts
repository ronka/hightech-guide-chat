import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { coursePurchase } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const courseSlug = request.nextUrl.searchParams.get("courseSlug");

  if (!courseSlug) {
    return NextResponse.json({ purchased: false });
  }

  const session = await auth.api.getSession({ headers: await headers() });
  const email = session?.user?.email?.toLowerCase().trim();

  if (!email) {
    return NextResponse.json({ purchased: false });
  }

  const purchased = await db
    .select()
    .from(coursePurchase)
    .where(and(eq(coursePurchase.email, email), eq(coursePurchase.courseSlug, courseSlug)))
    .limit(1)
    .then((rows) => rows.length > 0);

  return NextResponse.json({ purchased });
}
