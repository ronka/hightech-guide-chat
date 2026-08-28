import { randomUUID } from "node:crypto";
import { and, asc, eq, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { metaPurchaseOutbox as outbox } from "@/db/schema";
import { getMetaPurchaseDestination, sendMetaPurchase } from "./meta-purchases";
import { purchaseErrorSummary } from "./purchase-delivery";

const pending = () => and(isNull(outbox.sentAt), isNull(outbox.failedAt));
const due = (now: Date) =>
  and(
    pending(),
    lte(outbox.nextAttemptAt, now),
    or(isNull(outbox.lockedUntil), lte(outbox.lockedUntil, now)),
  );

export async function deliverMetaPurchase(eventId: string) {
  const destination = getMetaPurchaseDestination();
  if (!destination) return "disabled";
  const now = new Date();
  const lockId = randomUUID();
  // Atomic claim: concurrent webhook/cron invocations cannot both send this row.
  // A crash releases the lease after one minute, including a crash after sending.
  const [job] = await db
    .update(outbox)
    .set({
      lockId,
      lockedUntil: new Date(now.getTime() + 60_000),
      attempts: sql`${outbox.attempts} + 1`,
    })
    .where(and(eq(outbox.eventId, eventId), due(now)))
    .returning();
  if (!job) return "skipped";

  const owned = and(eq(outbox.eventId, eventId), eq(outbox.lockId, lockId));
  if (
    !job.destination ||
    job.destination.mode !== destination.mode ||
    job.destination.pixelId !== destination.pixelId
  ) {
    await db
      .update(outbox)
      .set({
        lastError:
          "Delivery destination missing or changed; operator review required",
        nextAttemptAt: new Date(now.getTime() + 3600_000),
        lockId: null,
        lockedUntil: null,
      })
      .where(owned);
    return "disabled";
  }
  // Never change the original timestamp to make an expired purchase look new.
  if (
    Math.floor(now.getTime() / 1000) - job.payload.event_time >=
    7 * 24 * 60 * 60
  ) {
    await db
      .update(outbox)
      .set({
        failedAt: now,
        lastError: "Purchase is older than Meta's seven-day event window",
        lockId: null,
        lockedUntil: null,
      })
      .where(owned);
    return "expired";
  }

  try {
    await sendMetaPurchase(job.payload, job.testEventCode, job.destination);
  } catch (error) {
    await db
      .update(outbox)
      .set({
        // Store no provider response, access token, or customer details.
        lastError: purchaseErrorSummary(error),
        nextAttemptAt: new Date(
          Date.now() +
            Math.min(3_600_000, 60_000 * 2 ** Math.min(job.attempts - 1, 6)),
        ),
        lockId: null,
        lockedUntil: null,
      })
      .where(owned);
    return "retry";
  }

  // If this write fails, the lease expires and the same event_id is resent.
  await db
    .update(outbox)
    .set({
      sentAt: new Date(),
      lastError: null,
      lockId: null,
      lockedUntil: null,
    })
    .where(owned);
  return "sent";
}

export async function retryMetaPurchases() {
  const results: string[] = [];
  const startedAt = Date.now();
  let hasMore = false;
  // Drain fast, healthy backlogs instead of limiting every daily run to 20.
  // Start no 8-second network wave after 45s (route maxDuration is 60s).
  while (results.length < 200 && Date.now() - startedAt < 45_000) {
    const jobs = await db
      .select({ eventId: outbox.eventId })
      .from(outbox)
      .where(due(new Date()))
      .orderBy(asc(outbox.nextAttemptAt))
      .limit(20);
    if (!jobs.length) {
      hasMore = false;
      break;
    }
    for (let offset = 0; offset < jobs.length; offset += 4) {
      if (Date.now() - startedAt >= 45_000) {
        hasMore = true;
        break;
      }
      const wave = await Promise.all(
        jobs.slice(offset, offset + 4).map(async ({ eventId }) => {
          try {
            return await deliverMetaPurchase(eventId);
          } catch {
            return "worker_error";
          }
        }),
      );
      results.push(...wave);
    }
    hasMore = true;
    // A DB failure may leave a row due: do not hot-loop the same broken batch.
    if (
      results.includes("worker_error") ||
      results.every((result) => result === "skipped")
    )
      break;
  }
  return {
    checked: results.length,
    sent: results.filter((result) => result === "sent").length,
    retry: results.filter((result) => result === "retry").length,
    expired: results.filter((result) => result === "expired").length,
    disabled: results.filter((result) => result === "disabled").length,
    workerErrors: results.filter((result) => result === "worker_error").length,
    hasMore,
  };
}
