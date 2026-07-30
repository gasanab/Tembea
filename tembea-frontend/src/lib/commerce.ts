export const hostedPaymentsConfigured =
  process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true" &&
  process.env.NEXT_PUBLIC_PAYMENT_PROVIDER?.trim().toLowerCase() ===
    "flutterwave";

export function requireSecureCheckoutUrl(value: string | undefined): string {
  if (!value) {
    throw new Error("The payment provider did not return a checkout link.");
  }

  let checkoutUrl: URL;
  try {
    checkoutUrl = new URL(value);
  } catch {
    throw new Error("The payment provider returned an invalid checkout link.");
  }

  if (checkoutUrl.protocol !== "https:") {
    throw new Error("The payment provider did not return a secure checkout URL.");
  }

  return checkoutUrl.toString();
}

export function createCommerceReference(
  prefix: "booking" | "order",
  randomId: () => string = () => crypto.randomUUID(),
): string {
  return `tembea-${prefix}-${randomId()}`;
}
