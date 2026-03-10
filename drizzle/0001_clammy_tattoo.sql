CREATE TABLE "ebookPurchase" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"transactionCode" text,
	"purchasedAt" timestamp NOT NULL,
	CONSTRAINT "ebookPurchase_transactionCode_unique" UNIQUE("transactionCode")
);
--> statement-breakpoint
ALTER TABLE "webhookLog" DROP COLUMN "contentType";--> statement-breakpoint
ALTER TABLE "webhookLog" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "webhookLog" DROP COLUMN "errorMessage";--> statement-breakpoint
ALTER TABLE "webhookLog" DROP COLUMN "payerEmail";--> statement-breakpoint
ALTER TABLE "webhookLog" DROP COLUMN "transactionId";--> statement-breakpoint
ALTER TABLE "webhookLog" DROP COLUMN "productId";--> statement-breakpoint
ALTER TABLE "webhookLog" DROP COLUMN "courseSlug";