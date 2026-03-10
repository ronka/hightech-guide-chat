CREATE TABLE "bookPurchase" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"transactionCode" text,
	"purchasedAt" timestamp NOT NULL,
	CONSTRAINT "bookPurchase_transactionCode_unique" UNIQUE("transactionCode")
);
