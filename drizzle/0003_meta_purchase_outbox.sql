CREATE TABLE "metaPurchaseOutbox" (
	"eventId" text PRIMARY KEY NOT NULL,
	"payload" jsonb NOT NULL,
	"testEventCode" text,
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
CREATE INDEX "metaPurchaseOutbox_pending_idx" ON "metaPurchaseOutbox" USING btree ("sentAt","failedAt","nextAttemptAt");