import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  bookPurchase,
  coursePurchase,
  ebookPurchase,
  metaPurchaseOutbox,
  googlePurchaseOutbox,
} from "@/db/schema";
import {
  BOOK_ASMACHTA_ID,
  BOOK_PAYLINK,
  COURSE_ASMACHTA_ID,
  COURSE_PAYLINKS,
  EBOOK_ASMACHTA_ID,
  EBOOK_PAYLINK,
  PRODUCT_COURSE_MAP,
} from "@/lib/paylinks";
import {
  getMetaPurchaseDestination,
  hashEmail,
  type MetaPurchaseEvent,
} from "@/services/meta-purchases";
import {
  buildGooglePurchase,
  getGooglePurchaseDestination,
  type GooglePurchaseInput,
  type GooglePurchasePayload,
} from "@/services/google-purchases";
import {
  handleBookPurchase,
  handleCoursePurchase,
  handleEbookPurchase,
} from "./handlers";

const scalar = z
  .union([z.string(), z.number().finite()])
  .transform((value) => String(value).trim());
const id = scalar.pipe(z.string().min(1).max(128));
const amount = scalar
  .pipe(z.string().regex(/^\d+(\.\d{1,2})?$/))
  .transform(Number)
  .pipe(z.number().finite().positive());
const quantity = scalar
  .pipe(z.string().regex(/^\d+$/))
  .transform(Number)
  .pipe(z.number().int().positive().max(10000));

// PaymentLinks callback contract, not a browser redirect or an API success alone.
const statusSchema = z
  .object({
    err: scalar,
    status: scalar,
    data: z.object({ statusCode: scalar }).passthrough(),
  })
  .passthrough();
const paidDataSchema = z.object({
  payerEmail: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((value) => value.toLowerCase()),
  transactionId: id,
  paymentLinkProcessId: id,
  sum: amount,
  productData: z
    .array(z.object({ product_id: id, quantity }))
    .min(1)
    .max(100),
  // Grow's documented PaymentLinks payload omits currency. These three configured
  // paylinks charge ILS. Reject an explicitly different currency if one is sent.
  currency: z.literal("ILS").optional(),
});

export function parseCompletedPayment(body: unknown) {
  const envelope = statusSchema.parse(body);
  if (
    !["", "0"].includes(envelope.err) ||
    envelope.status !== "1" ||
    envelope.data.statusCode !== "2"
  ) {
    return null;
  }
  const data = paidDataSchema.parse(envelope.data);
  let product: "digital-book" | "physical-book" | "job-interview-course";
  let sourceUrl: string;
  switch (data.paymentLinkProcessId) {
    case EBOOK_ASMACHTA_ID:
      product = "digital-book";
      sourceUrl = EBOOK_PAYLINK;
      break;
    case BOOK_ASMACHTA_ID:
      product = "physical-book";
      sourceUrl = BOOK_PAYLINK;
      break;
    case COURSE_ASMACHTA_ID:
      if (
        PRODUCT_COURSE_MAP[data.productData[0].product_id] !==
        "job-interview-course"
      ) {
        throw new Error("Unknown course product");
      }
      product = "job-interview-course";
      sourceUrl = COURSE_PAYLINKS[product];
      break;
    default:
      throw new Error("Unknown payment link");
  }
  return { ...data, product, sourceUrl };
}

type CompletedPayment = NonNullable<ReturnType<typeof parseCompletedPayment>>;

export function buildMetaPurchase(
  payment: CompletedPayment,
  purchasedAt: Date,
): MetaPurchaseEvent {
  // No webhook IP/user agent: those belong to Grow, not the buyer. No invented
  // fbp/fbc IDs. Hashed email provides customer matching for these static links.
  const contents = payment.productData.map((item, index) => ({
    id: index === 0 ? payment.product : `grow:${item.product_id}`,
    quantity: item.quantity,
  }));
  return {
    event_name: "Purchase",
    event_id: `grow:purchase:${payment.transactionId}`,
    event_time: Math.floor(purchasedAt.getTime() / 1000),
    action_source: "website",
    event_source_url: payment.sourceUrl,
    user_data: { em: [hashEmail(payment.payerEmail)] },
    custom_data: {
      currency: "ILS",
      // Paid total includes applicable shipping/tax/discounts. Never substitute
      // advertised prices or guess whether productData.price is VAT-inclusive.
      value: payment.sum,
      order_id: payment.transactionId,
      content_type: "product",
      content_ids: contents.map((item) => item.id),
      contents,
      num_items: contents.reduce((sum, item) => sum + item.quantity, 0),
    },
  };
}

// Trusted server-side integration seam. The HTTP webhook does NOT read this from
// arbitrary callback fields: the Grow checkout-to-browser mapping is owner-managed.
export type VerifiedGoogleContext = Omit<
  GooglePurchaseInput,
  "transactionId" | "paidTotalCents" | "purchasedAt" | "currency"
>;

export async function recordCompletedPayment(
  payment: CompletedPayment,
  googleContext?: VerifiedGoogleContext,
) {
  return db.transaction(async (tx) => {
    // Keep entitlement handling, but commit it atomically with the delivery job.
    const { payerEmail, transactionId } = payment;
    if (payment.product === "job-interview-course") {
      await handleCoursePurchase(
        tx,
        payerEmail,
        transactionId,
        payment.productData[0].product_id,
      );
    } else if (payment.product === "digital-book") {
      await handleEbookPurchase(tx, payerEmail, transactionId);
    } else {
      await handleBookPurchase(tx, payerEmail, transactionId);
    }

    const table =
      payment.product === "job-interview-course"
        ? coursePurchase
        : payment.product === "digital-book"
          ? ebookPurchase
          : bookPurchase;
    const [purchase] = await tx
      .select({ purchasedAt: table.purchasedAt })
      .from(table)
      .where(eq(table.transactionCode, transactionId))
      .limit(1);
    // The first receipt time is retained even when a duplicate webhook arrives
    // later. PaymentLinks only documents a date, not an exact payment timestamp.
    if (!purchase) throw new Error("Purchase was not saved");
    const payload = buildMetaPurchase(payment, purchase.purchasedAt);
    await tx
      .insert(metaPurchaseOutbox)
      .values({
        eventId: payload.event_id,
        payload,
        testEventCode: process.env.META_TEST_EVENT_CODE || null,
        destination: getMetaPurchaseDestination(),
        createdAt: new Date(),
        nextAttemptAt: new Date(),
      })
      .onConflictDoNothing({ target: metaPurchaseOutbox.eventId });

    const googleDestination = getGooglePurchaseDestination();
    let googlePayload: GooglePurchasePayload | null = null;
    let suppressedReason: string | null = !googleContext
      ? "missing_verified_attribution"
      : !googleDestination
        ? "delivery_not_configured"
        : null;
    if (!suppressedReason && googleContext) {
      try {
        // Amounts and transaction identity are always from the paid record. A
        // context for another product must not silently be attached to this sale.
        if (
          googleContext.items.length !== payload.custom_data.contents.length ||
          googleContext.items.some(
            (item, index) =>
              item.id !== payload.custom_data.contents[index].id ||
              item.quantity !== payload.custom_data.contents[index].quantity,
          )
        )
          throw new Error("Context does not match purchased products");
        googlePayload = buildGooglePurchase({
          ...googleContext,
          transactionId: payment.transactionId,
          paidTotalCents: Math.round(payment.sum * 100),
          purchasedAt: purchase.purchasedAt,
          currency: "ILS",
        });
      } catch {
        // Invalid analytics context must not deny access to a valid paid order.
        suppressedReason = "invalid_verified_context";
      }
    }
    await tx
      .insert(googlePurchaseOutbox)
      .values({
        transactionId,
        payload: googlePayload,
        measurementId: googleDestination?.measurementId ?? null,
        mode: googleDestination?.mode ?? null,
        sessionStartedAt: googlePayload
          ? googleContext?.sessionStartedAt ?? null
          : null,
        suppressedReason,
        createdAt: new Date(),
        nextAttemptAt: new Date(),
      })
      .onConflictDoNothing({ target: googlePurchaseOutbox.transactionId });
    return payload.event_id;
  });
}
