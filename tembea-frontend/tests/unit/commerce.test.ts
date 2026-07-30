import { describe, expect, it } from "vitest";
import {
  createCommerceReference,
  requireSecureCheckoutUrl,
} from "../../src/lib/commerce";

describe("hosted commerce helpers", () => {
  it("accepts only a valid HTTPS checkout link", () => {
    expect(
      requireSecureCheckoutUrl(
        "https://checkout.flutterwave.com/v3/hosted/pay/reference",
      ),
    ).toBe("https://checkout.flutterwave.com/v3/hosted/pay/reference");

    expect(() => requireSecureCheckoutUrl(undefined)).toThrow(
      "did not return a checkout link",
    );
    expect(() => requireSecureCheckoutUrl("not a URL")).toThrow(
      "invalid checkout link",
    );
    expect(() =>
      requireSecureCheckoutUrl("http://checkout.example.test/payment"),
    ).toThrow("secure checkout URL");
  });

  it("creates a namespaced idempotency reference", () => {
    expect(createCommerceReference("order", () => "fixed-id")).toBe(
      "tembea-order-fixed-id",
    );
  });
});
