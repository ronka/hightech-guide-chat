import { NextResponse } from "next/server";
import { bookPurchase, coursePurchase, ebookPurchase } from "@/db/schema";
import type { CourseSlug } from "@/lib/paylinks";
import type { db } from "@/db/index";
import { sendMetaPurchase } from "@/services/meta-purchases";

export type GrowProductData = {
  product_id: string;
  name: string;
  catalog_number: string;
  vat: string;
  quantity: string;
  price: string;
  price_mark: string;
};

export type GrowWebhookData = {
  payerEmail: string;
  payerPhone: string;
  fullName: string;
  sum: string;
  transactionId: string;
  asmachta: string;
  paymentLinkProcessId: string;
  productData: GrowProductData[];
};

export type GrowWebhookBody = {
  err: string;
  status: string;
  data: GrowWebhookData;
};

export function parseNestedFormData(rawBody: string): GrowWebhookBody {
  const params = new URLSearchParams(rawBody);
  const result: Record<string, unknown> = {};

  for (const [key, value] of params.entries()) {
    const keys = key.replace(/\]/g, "").split("[");
    let current = result;
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current)) {
        current[k] = /^\d+$/.test(keys[i + 1]) ? [] : {};
      }
      current = current[k] as Record<string, unknown>;
    }
    const lastKey = keys[keys.length - 1];
    if (Array.isArray(current)) {
      (current as unknown[])[parseInt(lastKey)] = value;
    } else {
      current[lastKey] = value;
    }
  }

  return result as unknown as GrowWebhookBody;
}

type DbClient = typeof db;

export type MetaPurchaseDetails = {
  // The actual amount charged (data.sum) — not a line item's list price,
  // which ignores coupons/discounts applied to the transaction.
  value: string;
  name: string;
  fullName?: string;
  phone?: string;
  eventSourceUrl: string;
};

// Awaited (not fire-and-forget) because background work scheduled via
// next/server's after() is only guaranteed to run on Vercel projects with
// Fluid Compute enabled; this project predates that default, so after()
// callbacks were silently dropped once the response was sent.
async function reportMetaPurchase(params: {
  email: string;
  transactionCode: string | null | undefined;
  contentIds: string[];
  contentType: string;
  meta: MetaPurchaseDetails;
}): Promise<void> {
  const value = Number.parseFloat(params.meta.value);

  try {
    await sendMetaPurchase({
      email: params.email,
      phone: params.meta.phone,
      fullName: params.meta.fullName,
      transactionCode: params.transactionCode ?? null,
      value: Number.isFinite(value) ? value : 0,
      currency: "ILS",
      contentIds: params.contentIds,
      contentType: params.contentType,
      contentName: params.meta.name,
      eventSourceUrl: params.meta.eventSourceUrl,
      eventTime: new Date(),
    });
  } catch (err) {
    console.error("sendMetaPurchase failed", err);
  }
}

export async function handleEbookPurchase(
  dbClient: DbClient,
  email: string,
  transactionCode: string | null | undefined,
  meta: MetaPurchaseDetails,
): Promise<NextResponse> {
  const inserted = await dbClient
    .insert(ebookPurchase)
    .values({
      id: crypto.randomUUID(),
      email: email.toLowerCase().trim(),
      transactionCode: transactionCode ?? null,
      purchasedAt: new Date(),
    })
    .onConflictDoNothing({ target: ebookPurchase.transactionCode })
    .returning({ id: ebookPurchase.id });

  if (inserted.length > 0) {
    await reportMetaPurchase({
      email,
      transactionCode,
      contentIds: ["ebook"],
      contentType: "ebook",
      meta,
    });
  }

  return NextResponse.json({ ok: true });
}

export async function handleCoursePurchase(
  dbClient: DbClient,
  email: string,
  transactionCode: string | null | undefined,
  courseSlug: CourseSlug | undefined,
  meta: MetaPurchaseDetails,
): Promise<NextResponse> {
  if (!courseSlug) {
    return NextResponse.json({ error: "Unknown product" }, { status: 400 });
  }

  const inserted = await dbClient
    .insert(coursePurchase)
    .values({
      id: crypto.randomUUID(),
      email: email.toLowerCase().trim(),
      courseSlug,
      transactionCode: transactionCode ?? null,
      purchasedAt: new Date(),
    })
    .onConflictDoNothing({ target: coursePurchase.transactionCode })
    .returning({ id: coursePurchase.id });

  if (inserted.length > 0) {
    await reportMetaPurchase({
      email,
      transactionCode,
      contentIds: [courseSlug],
      contentType: "course",
      meta,
    });
  }

  return NextResponse.json({ ok: true });
}

export async function handleBookPurchase(
  dbClient: DbClient,
  email: string,
  transactionCode: string | null | undefined,
  meta: MetaPurchaseDetails,
): Promise<NextResponse> {
  const inserted = await dbClient
    .insert(bookPurchase)
    .values({
      id: crypto.randomUUID(),
      email: email.toLowerCase().trim(),
      transactionCode: transactionCode ?? null,
      purchasedAt: new Date(),
    })
    .onConflictDoNothing({ target: bookPurchase.transactionCode })
    .returning({ id: bookPurchase.id });

  if (inserted.length > 0) {
    await reportMetaPurchase({
      email,
      transactionCode,
      contentIds: ["book"],
      contentType: "book",
      meta,
    });
  }

  return NextResponse.json({ ok: true });
}
