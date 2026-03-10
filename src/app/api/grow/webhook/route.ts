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
  productData: GrowProductData[];
};

type GrowWebhookBody = {
  err: string;
  status: string;
  data: GrowWebhookData;
};

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  const rawBody = await req.text();

  await db.insert(webhookLog).values({
    id: crypto.randomUUID(),
    receivedAt: new Date(),
    rawBody,
  });

  let body: GrowWebhookBody;
  if (contentType.includes("application/x-www-form-urlencoded")) {
    body = Object.fromEntries(new URLSearchParams(rawBody)) as unknown as GrowWebhookBody;
  } else {
    body = JSON.parse(rawBody) as GrowWebhookBody;
  }

  const { data } = body;

  const payerEmail = data?.payerEmail;
  const asmachta = data?.asmachta;
  const transactionCode = data?.transactionId;
  const productId = data?.productData?.[0]?.product_id;

  if (!payerEmail || !productId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (asmachta !== ASMACHTA_ID) {
    return NextResponse.json({ error: "Invalid asmachta" }, { status: 400 });
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
