import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/index";
import { webhookLog } from "@/db/schema";
import { matchesServerSecret } from "@/lib/server-secret";
import { deliverMetaPurchase } from "@/services/meta-purchase-delivery";
import { deliverGooglePurchase } from "@/services/google-purchase-delivery";
import { parseNestedFormData } from "./handlers";
import {
  parseCompletedPayment,
  recordCompletedPayment,
} from "./completed-payment";

export async function POST(req: NextRequest) {
  // PaymentLinks does not document a signed callback. Configure the same secret
  // in Grow's notify URL (?key=...) and the server; never accept an unverified body.
  if (!process.env.GROW_WEBHOOK_KEY) {
    return NextResponse.json(
      { error: "Webhook authentication not configured" },
      { status: 503 },
    );
  }
  const key =
    req.headers.get("x-grow-webhook-key") ??
    req.nextUrl.searchParams.get("key");
  if (!matchesServerSecret(key, process.env.GROW_WEBHOOK_KEY)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rawBody = await req.text();
  let payment: ReturnType<typeof parseCompletedPayment>;
  try {
    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      body = parseNestedFormData(rawBody);
    }
    payment = parseCompletedPayment(body);
  } catch {
    return NextResponse.json(
      { error: "Invalid payment callback" },
      { status: 400 },
    );
  }
  if (!payment)
    return NextResponse.json({ ok: true, ignored: "Payment not completed" });

  // Log a minimal summary, not customer data, card details, or transaction tokens.
  await db.insert(webhookLog).values({
    id: crypto.randomUUID(),
    receivedAt: new Date(),
    rawBody: JSON.stringify({
      transactionId: payment.transactionId,
      product: payment.product,
      status: "paid",
    }),
  });
  const eventId = await recordCompletedPayment(payment);
  // Each destination has its own committed job and failure state. A failure in
  // one provider must not stop the other provider's attempt or revoke access.
  const deliveries = await Promise.allSettled([
    deliverMetaPurchase(eventId),
    deliverGooglePurchase(payment.transactionId),
  ]);
  if (deliveries.some((result) => result.status === "rejected"))
    console.warn("Purchase delivery deferred to retry worker");
  return NextResponse.json({ ok: true });
}
