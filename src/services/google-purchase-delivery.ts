import { randomUUID } from "node:crypto";
import { and, asc, eq, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { googlePurchaseOutbox as outbox } from "@/db/schema";
import {
  getGooglePurchaseDestination,
  sendGooglePurchase,
} from "./google-purchases";
import {
  PurchaseDeliveryError,
  purchaseErrorSummary,
} from "./purchase-delivery";

const due = (now: Date) =>
  and(
    isNull(outbox.sentAt),
    isNull(outbox.failedAt),
    isNull(outbox.suppressedReason),
    lte(outbox.nextAttemptAt, now),
    or(isNull(outbox.lockedUntil), lte(outbox.lockedUntil, now)),
  );

export async function deliverGooglePurchase(transactionId: string) {
  const destination = getGooglePurchaseDestination();
  if (!destination) return "disabled";
  const now = new Date();
  const lockId = randomUUID();
  const [job] = await db
    .update(outbox)
    .set({
      lockId,
      lockedUntil: new Date(now.getTime() + 60_000),
      attempts: sql`${outbox.attempts} + 1`,
    })
    .where(and(eq(outbox.transactionId, transactionId), due(now)))
    .returning();
  if (!job) return "skipped";
  const owned = and(
    eq(outbox.transactionId, transactionId),
    eq(outbox.lockId, lockId),
  );
  if (
    !job.payload ||
    !job.mode ||
    !job.measurementId ||
    !job.sessionStartedAt ||
    destination.measurementId !== job.measurementId ||
    destination.mode !== job.mode
  ) {
    await db
      .update(outbox)
      .set({
        suppressedReason: "delivery_destination_changed",
        lockId: null,
        lockedUntil: null,
      })
      .where(owned);
    return "disabled";
  }
  try {
    await sendGooglePurchase({
      payload: job.payload,
      mode: job.mode,
      measurementId: job.measurementId,
      sessionStartedAt: job.sessionStartedAt,
    });
  } catch (error) {
    const terminal =
      error instanceof PurchaseDeliveryError &&
      ["expired", "validation", "rejected", "configuration"].includes(
        error.reason,
      );
    await db
      .update(outbox)
      .set({
        lastError: purchaseErrorSummary(error),
        ...(terminal
          ? { failedAt: new Date() }
          : {
              nextAttemptAt: new Date(
                Date.now() +
                  Math.min(
                    3600_000,
                    60_000 * 2 ** Math.min(job.attempts - 1, 6),
                  ),
              ),
            }),
        lockId: null,
        lockedUntil: null,
      })
      .where(owned);
    return terminal ? "failed" : "retry";
  }
  // Receipt, not proof of attribution. Crash before this write retries the same
  // transaction_id in the same GA property, never a newly generated purchase.
  await db
    .update(outbox)
    .set({
      sentAt: new Date(),
      lastError: null,
      lockId: null,
      lockedUntil: null,
    })
    .where(owned);
  return "transport_received";
}

export async function retryGooglePurchases() {
  const results: string[] = [];
  const startedAt = Date.now();
  let hasMore = false;
  // Two possible 8s calls per event: leave room for the last network wave.
  while (results.length < 200 && Date.now() - startedAt < 35_000) {
    const jobs = await db
      .select({ transactionId: outbox.transactionId })
      .from(outbox)
      .where(due(new Date()))
      .orderBy(asc(outbox.nextAttemptAt))
      .limit(20);
    if (!jobs.length) {
      hasMore = false;
      break;
    }
    for (let offset = 0; offset < jobs.length; offset += 4) {
      if (Date.now() - startedAt >= 35_000) break;
      results.push(
        ...(await Promise.all(
          jobs.slice(offset, offset + 4).map(async (job) => {
            try {
              return await deliverGooglePurchase(job.transactionId);
            } catch {
              return "worker_error";
            }
          }),
        )),
      );
    }
    hasMore = true;
    if (
      results.includes("worker_error") ||
      results.every((result) => result === "skipped")
    )
      break;
  }
  return {
    checked: results.length,
    received: results.filter((r) => r === "transport_received").length,
    retry: results.filter((r) => r === "retry").length,
    failed: results.filter((r) => r === "failed").length,
    disabled: results.filter((r) => r === "disabled").length,
    workerErrors: results.filter((r) => r === "worker_error").length,
    hasMore,
  };
}
