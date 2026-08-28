import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { webhookLog } from "@/db/schema";
import { BOOK_ASMACHTA_ID, COURSE_ASMACHTA_ID, EBOOK_ASMACHTA_ID } from "@/lib/paylinks";
import {
  parseNestedFormData,
  handleEbookPurchase,
  handleCoursePurchase,
  handleBookPurchase,
  type GrowWebhookBody,
} from "./handlers";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  let body: GrowWebhookBody;
  try {
    body = JSON.parse(rawBody) as GrowWebhookBody;
  } catch {
    body = parseNestedFormData(rawBody);
  }

  await db.insert(webhookLog).values({
    id: crypto.randomUUID(),
    receivedAt: new Date(),
    rawBody: JSON.stringify(body),
  });

  const { data } = body;

  const payerEmail = data?.payerEmail;
  const paymentLinkProcessId = data?.paymentLinkProcessId;
  const transactionCode = data?.transactionId;
  const productId = data?.productData?.[0]?.product_id;

  if (!payerEmail || !productId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  switch (paymentLinkProcessId) {
    case EBOOK_ASMACHTA_ID:
      return handleEbookPurchase(db, payerEmail, transactionCode);

    case COURSE_ASMACHTA_ID:
      return handleCoursePurchase(db, payerEmail, transactionCode, productId);

    case BOOK_ASMACHTA_ID:
      return handleBookPurchase(db, payerEmail, transactionCode);

    default:
      return NextResponse.json({ error: "Invalid payment link process id" }, { status: 400 });
  }
}
