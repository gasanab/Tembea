import { describe, expect, it } from "vitest";
import {
  canRoleAccessPath,
  getPostLoginDestination,
} from "../../src/lib/auth-routing";

describe("authenticated routing", () => {
  it("returns each role's dashboard when no destination is requested", () => {
    expect(getPostLoginDestination("CLIENT", null)).toBe("/client");
    expect(getPostLoginDestination("PARTNER", null)).toBe("/partner");
    expect(getPostLoginDestination("ADMIN", null)).toBe("/admin");
  });

  it("preserves safe account destinations for every authenticated role", () => {
    expect(getPostLoginDestination("CLIENT", "/profile")).toBe("/profile");
    expect(getPostLoginDestination("PARTNER", "/notifications")).toBe(
      "/notifications",
    );
    expect(getPostLoginDestination("ADMIN", "/settings")).toBe("/settings");
    expect(
      getPostLoginDestination(
        "CLIENT",
        "/payment/callback?status=successful&tx_ref=payment_1",
      ),
    ).toBe("/payment/callback?status=successful&tx_ref=payment_1");
  });

  it("does not send a user into another role's dashboard", () => {
    expect(getPostLoginDestination("CLIENT", "/admin/users")).toBe("/client");
    expect(getPostLoginDestination("PARTNER", "/client/bookings")).toBe(
      "/partner",
    );
    expect(getPostLoginDestination("ADMIN", "/partner/earnings")).toBe("/admin");
  });

  it("rejects external and backslash-based redirect values", () => {
    expect(getPostLoginDestination("CLIENT", "https://example.com")).toBe(
      "/client",
    );
    expect(getPostLoginDestination("CLIENT", "//example.com")).toBe("/client");
    expect(getPostLoginDestination("CLIENT", "/\\example.com")).toBe("/client");
  });

  it("matches role routes by path segment rather than a partial prefix", () => {
    expect(canRoleAccessPath("CLIENT", "/client/bookings")).toBe(true);
    expect(canRoleAccessPath("CLIENT", "/clientele")).toBe(false);
  });
});
