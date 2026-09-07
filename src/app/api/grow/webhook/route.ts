import { db } from "@/db/index";
import { webhookLog } from "@/db/schema";
import {
  BOOK_ASMACHTA_ID,
  BOOK_PAYLINK,
  COURSE_ASMACHTA_ID,
  COURSE_EBOOK_BUNDLE,
  COURSE_PAYLINKS,
  EBOOK_ASMACHTA_ID,
  EBOOK_PAYLINK,
  PRODUCT_COURSE_MAP,
} from "@/lib/paylinks";
import { type NextRequest, NextResponse } from "next/server";
import {
  type GrowWebhookBody,
  type MetaPurchaseDetails,
  handleBookPurchase,
  handleCourseEbookBundlePurchase,
  handleCoursePurchase,
  handleEbookPurchase,
  hasAllProductIds,
  parseNestedFormData,
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
  // transactionId is the primary idempotency key; some Grow payloads omit it,
  // so fall back to asmachta (the payment processor's transaction reference)
  // rather than leaving transactionCode null, since Postgres unique
  // constraints don't dedupe NULLs and a retried webhook would double-report.
  const transactionCode = data?.transactionId || data?.asmachta || null;
  const product = data?.productData?.[0];
  const productId = product?.product_id;

  if (!payerEmail || !productId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const baseMeta = {
    // data.sum is the actual amount charged (after coupons/discounts);
    // productData[i].price is a line-item list price and can overstate value.
    value: data?.sum ?? product?.price ?? "0",
    name: product?.name ?? "",
    fullName: data?.fullName,
    phone: data?.payerPhone,
  };

  switch (paymentLinkProcessId) {
    case EBOOK_ASMACHTA_ID: {
      const meta: MetaPurchaseDetails = {
        ...baseMeta,
        eventSourceUrl: EBOOK_PAYLINK,
      };
      return handleEbookPurchase(db, payerEmail, transactionCode, meta);
    }

    case COURSE_ASMACHTA_ID: {
      const courseSlug = PRODUCT_COURSE_MAP[productId];
      const meta: MetaPurchaseDetails = {
        ...baseMeta,
        eventSourceUrl: courseSlug ? COURSE_PAYLINKS[courseSlug] : "",
      };
      return handleCoursePurchase(
        db,
        payerEmail,
        transactionCode,
        courseSlug,
        meta,
      );
    }

    case BOOK_ASMACHTA_ID: {
      const meta: MetaPurchaseDetails = {
        ...baseMeta,
        eventSourceUrl: BOOK_PAYLINK,
      };
      return handleBookPurchase(db, payerEmail, transactionCode, meta);
    }

    case COURSE_EBOOK_BUNDLE.paymentLinkProcessId: {
      const hasExpectedProducts = hasAllProductIds(
        data.productData.map((item) => item.product_id),
        Object.values(COURSE_EBOOK_BUNDLE.productIds),
      );

      if (!hasExpectedProducts) {
        return NextResponse.json(
          { error: "Invalid bundle products" },
          { status: 400 },
        );
      }

      if (!transactionCode) {
        return NextResponse.json(
          { error: "Missing transaction identifier" },
          { status: 400 },
        );
      }

      const meta: MetaPurchaseDetails = {
        ...baseMeta,
        name: COURSE_EBOOK_BUNDLE.name,
        eventSourceUrl: COURSE_EBOOK_BUNDLE.paymentLink,
      };
      return handleCourseEbookBundlePurchase(
        db,
        payerEmail,
        transactionCode,
        "job-interview-course",
        meta,
      );
    }

    default:
      return NextResponse.json(
        { error: "Invalid payment link process id" },
        { status: 400 },
      );
  }
}
