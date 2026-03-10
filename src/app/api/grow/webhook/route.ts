import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { coursePurchase, webhookLog } from "@/db/schema";
import { ASMACHTA_ID, PRODUCT_COURSE_MAP } from "@/lib/paylinks";

type GrowProductData = {
  product_id: string;
  name: string;
  catalog_number: string;
  vat: string;
  quantity: string;
  price: string;
  price_mark: string;
};

type GrowWebhookData = {
  payerEmail: string;
  transactionId: string;
  asmachta: string;
  paymentLinkProcessId: string;
  productData: GrowProductData[];
};

type GrowWebhookBody = {
  err: string;
  status: string;
  data: GrowWebhookData;
};

function parseNestedFormData(rawBody: string): GrowWebhookBody {
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

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  const rawBody = await req.text();

  let body: GrowWebhookBody;
  if (contentType.includes("application/x-www-form-urlencoded")) {
    body = parseNestedFormData(rawBody);
  } else {
    body = JSON.parse(rawBody) as GrowWebhookBody;
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

  if (paymentLinkProcessId !== ASMACHTA_ID) {
    return NextResponse.json({ error: "Invalid payment link process id" }, { status: 400 });
  }

  const courseSlug = PRODUCT_COURSE_MAP[productId];
  if (!courseSlug) {
    return NextResponse.json({ error: "Unknown product" }, { status: 400 });
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
