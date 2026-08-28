CREATE TABLE "googlePurchaseOutbox" (
	"transactionId" text PRIMARY KEY NOT NULL,
	"payload" jsonb,
	"measurementId" text,
	"mode" text,
	"sessionStartedAt" timestamp,
	"suppressedReason" text,
	"createdAt" timestamp NOT NULL,
	"sentAt" timestamp,
	"failedAt" timestamp,
	"attempts" integer DEFAULT 0 NOT NULL,
	"nextAttemptAt" timestamp NOT NULL,
	"lockedUntil" timestamp,
	"lockId" text,
	"lastError" text
);
--> statement-breakpoint
CREATE INDEX "googlePurchaseOutbox_pending_idx" ON "googlePurchaseOutbox" USING btree ("sentAt","failedAt","nextAttemptAt");