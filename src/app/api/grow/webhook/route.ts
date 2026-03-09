import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { coursePurchase } from "@/db/schema";
import { PAYLINK_COURSE_MAP } from "@/lib/paylinks";

export async function POST(req: NextRequest) {
  let body: Record<string, string>;

  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const text = await req.text();
    body = Object.fromEntries(new URLSearchParams(text));
  } else {
    body = await req.json();
  }

  const { webhookKey, payerEmail, transactionCode, paymentLinkProcessToken } = body;

  if (webhookKey !== process.env.GROW_WEBHOOK_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!payerEmail || !paymentLinkProcessToken) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const courseSlug = PAYLINK_COURSE_MAP[paymentLinkProcessToken];
  if (!courseSlug) {
    return NextResponse.json({ error: "Unknown paylink" }, { status: 400 });
  }

  await db
    .insert(coursePurchase)
    .values({
      id: crypto.randomUUID(),
      email: payerEmail.toLowerCase().trim(),
      courseSlug,
      transactionCode: transactionCode ?? null,
      purchasedAt: new Date(),
    })
    .onConflictDoNothing({ target: coursePurchase.transactionCode });

  return NextResponse.json({ ok: true });
}
