// Shared safe diagnostics/configuration, not a shared provider success state.
export class PurchaseDeliveryError extends Error {
  constructor(
    readonly provider: "google" | "meta",
    readonly reason:
      | "configuration"
      | "network"
      | "rejected"
      | "validation"
      | "expired",
    readonly httpStatus?: number,
    readonly providerCode?: number,
  ) {
    super(
      `${provider} purchase ${reason}${httpStatus === undefined ? "" : ` (HTTP ${httpStatus})`}${providerCode === undefined ? "" : ` (code ${providerCode})`}`,
    );
  }
}

export function purchaseErrorSummary(error: unknown) {
  // Never retain arbitrary provider bodies, fetch URLs or error.message strings.
  return error instanceof PurchaseDeliveryError
    ? error.message
    : "Purchase delivery failed; retry scheduled";
}

export type DeliveryMode = "production" | "test";
export function serverDeliveryMode(
  provider: "meta" | "google",
): DeliveryMode | null {
  const mode =
    provider === "meta"
      ? process.env.META_PURCHASE_MODE
      : process.env.GOOGLE_PURCHASE_MODE;
  if (mode === "test") return "test";
  if (
    mode === "production" &&
    process.env.NODE_ENV === "production" &&
    (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production")
  )
    return "production";
  return null;
}
