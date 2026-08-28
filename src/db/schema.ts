import { pgTable, text, boolean, timestamp, integer, jsonb, index } from "drizzle-orm/pg-core";
import type { MetaPurchaseEvent, MetaPurchaseDestination } from "@/services/meta-purchases";
import type { GooglePurchasePayload } from "@/services/google-purchases";
import type { DeliveryMode } from "@/services/purchase-delivery";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});

export const coursePurchase = pgTable("coursePurchase", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  courseSlug: text("courseSlug").notNull(),
  transactionCode: text("transactionCode").unique(),
  purchasedAt: timestamp("purchasedAt").notNull(),
});

export const ebookPurchase = pgTable("ebookPurchase", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  transactionCode: text("transactionCode").unique(),
  purchasedAt: timestamp("purchasedAt").notNull(),
});

export const bookPurchase = pgTable("bookPurchase", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  transactionCode: text("transactionCode").unique(),
  purchasedAt: timestamp("purchasedAt").notNull(),
});

export const webhookLog = pgTable("webhookLog", {
  id: text("id").primaryKey(),
  receivedAt: timestamp("receivedAt").notNull(),
  rawBody: text("rawBody"),
});

// Written in the same transaction as the entitlement. Keep the original payload
// and event ID across retries; a duplicate webhook must not create a new event.
export const metaPurchaseOutbox = pgTable("metaPurchaseOutbox", {
  eventId: text("eventId").primaryKey(),
  payload: jsonb("payload").$type<MetaPurchaseEvent>().notNull(),
  testEventCode: text("testEventCode"),
  // Null on pre-migration jobs: never guess their original destination/mode.
  destination: jsonb("destination").$type<MetaPurchaseDestination>(),
  createdAt: timestamp("createdAt").notNull(),
  sentAt: timestamp("sentAt"),
  failedAt: timestamp("failedAt"),
  attempts: integer("attempts").notNull().default(0),
  nextAttemptAt: timestamp("nextAttemptAt").notNull(),
  lockedUntil: timestamp("lockedUntil"),
  lockId: text("lockId"),
  lastError: text("lastError"),
}, (table) => [index("metaPurchaseOutbox_pending_idx").on(table.sentAt, table.failedAt, table.nextAttemptAt)]);

// Separate state: a Meta receipt cannot mark a Google purchase as delivered.
export const googlePurchaseOutbox = pgTable("googlePurchaseOutbox", {
  transactionId: text("transactionId").primaryKey(),
  payload: jsonb("payload").$type<GooglePurchasePayload>(),
  measurementId: text("measurementId"),
  mode: text("mode").$type<DeliveryMode>(),
  sessionStartedAt: timestamp("sessionStartedAt"),
  suppressedReason: text("suppressedReason"),
  createdAt: timestamp("createdAt").notNull(),
  sentAt: timestamp("sentAt"),
  failedAt: timestamp("failedAt"),
  attempts: integer("attempts").notNull().default(0),
  nextAttemptAt: timestamp("nextAttemptAt").notNull(),
  lockedUntil: timestamp("lockedUntil"),
  lockId: text("lockId"),
  lastError: text("lastError"),
}, table => [index("googlePurchaseOutbox_pending_idx").on(table.sentAt, table.failedAt, table.nextAttemptAt)]);
