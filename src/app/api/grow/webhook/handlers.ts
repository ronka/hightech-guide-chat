import { NextResponse } from "next/server";
import { bookPurchase, coursePurchase, ebookPurchase } from "@/db/schema";
import { PRODUCT_COURSE_MAP } from "@/lib/paylinks";
import { db } from "@/db/index";

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

export async function handleEbookPurchase(
  dbClient: DbClient,
  email: string,
  transactionCode: string | null | undefined,
): Promise<NextResponse> {
  await dbClient
    .insert(ebookPurchase)
    .values({
      id: crypto.randomUUID(),
      email: email.toLowerCase().trim(),
      transactionCode: transactionCode ?? null,
      purchasedAt: new Date(),
    })
    .onConflictDoNothing({ target: ebookPurchase.transactionCode });

  return NextResponse.json({ ok: true });
}

export async function handleCoursePurchase(
  dbClient: DbClient,
  email: string,
  transactionCode: string | null | undefined,
  productId: string,
): Promise<NextResponse> {
  const courseSlug = PRODUCT_COURSE_MAP[productId];
  if (!courseSlug) {
    return NextResponse.json({ error: "Unknown product" }, { status: 400 });
  }

  await dbClient
    .insert(coursePurchase)
    .values({
      id: crypto.randomUUID(),
      email: email.toLowerCase().trim(),
      courseSlug,
      transactionCode: transactionCode ?? null,
      purchasedAt: new Date(),
    })
    .onConflictDoNothing({ target: coursePurchase.transactionCode });

  return NextResponse.json({ ok: true });
}

export async function handleBookPurchase(
  dbClient: DbClient,
  email: string,
  transactionCode: string | null | undefined,
): Promise<NextResponse> {
  await dbClient
    .insert(bookPurchase)
    .values({
      id: crypto.randomUUID(),
      email: email.toLowerCase().trim(),
      transactionCode: transactionCode ?? null,
      purchasedAt: new Date(),
    })
    .onConflictDoNothing({ target: bookPurchase.transactionCode });

  return NextResponse.json({ ok: true });
}
