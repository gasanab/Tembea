import { describe, expect, it } from "vitest";
import { toSearchRequest } from "../../src/services/search.service";
import type { SearchFilters } from "../../src/types/search.types";

const defaults: SearchFilters = {
  query: "",
  category: "all",
  region: "All regions",
  minPrice: 0,
  maxPrice: 0,
  minRating: 0,
  page: 1,
  limit: 12,
};

describe("toSearchRequest", () => {
  it("omits inactive filters instead of hiding valid listings", () => {
    expect(toSearchRequest(defaults)).toEqual({
      page: 1,
      limit: 12,
    });
  });

  it("maps public filters to the backend search contract", () => {
    expect(
      toSearchRequest({
        ...defaults,
        query: "  Lake Kivu  ",
        category: "tours",
        region: "Western Province",
        minPrice: 25,
        maxPrice: 250,
        minRating: 4,
        page: 3,
        limit: 24,
      }),
    ).toEqual({
      q: "Lake Kivu",
      type: "TOURS",
      region: "Western Province",
      minPrice: 25,
      maxPrice: 250,
      minRating: 4,
      page: 3,
      limit: 24,
    });
  });

  it("uses accommodation inventory for both stay routes", () => {
    expect(
      toSearchRequest({ ...defaults, category: "hotels" }).type,
    ).toBe("ACCOMMODATION");
    expect(
      toSearchRequest({ ...defaults, category: "apartments" }).type,
    ).toBe("ACCOMMODATION");
  });
});
