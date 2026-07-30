import { describe, expect, it } from "vitest";
import { normalizeApiBaseUrl } from "../../src/lib/api-url";
import {
  getListingHref,
  isListingRouteType,
} from "../../src/lib/listing-routes";

describe("API URL normalization", () => {
  it("adds the API prefix once", () => {
    expect(normalizeApiBaseUrl("https://api.tembea.rw")).toBe(
      "https://api.tembea.rw/api",
    );
    expect(normalizeApiBaseUrl("https://api.tembea.rw/api/")).toBe(
      "https://api.tembea.rw/api",
    );
  });
});

describe("listing routes", () => {
  it("creates a canonical encoded listing URL", () => {
    expect(getListingHref("ACCOMMODATION", "stay/one")).toBe(
      "/listings/accommodation/stay%2Fone",
    );
  });

  it("rejects unsupported route categories", () => {
    expect(isListingRouteType("accommodation")).toBe(true);
    expect(isListingRouteType("unknown")).toBe(false);
  });
});
