import { describe, expect, it } from "vitest";
import { filterListings } from "../../src/utils/helpers/filterListings";
import type { Listing } from "../../src/types/product.types";

const listings: Listing[] = [
  {
    id: "kigali-stay",
    title: "Kigali Green Stay",
    category: "hotels",
    location: "Kigali",
    region: "Kigali City",
    description: "A central stay",
    shortDescription: "A central stay",
    images: ["/placeholder.svg"],
    price: 120,
    priceLabel: "per night",
    rating: 4.7,
    reviews: 12,
    availability: "Available",
    tags: ["city", "kigali"],
  },
  {
    id: "lake-tour",
    title: "Lake Kivu Tour",
    category: "tours",
    location: "Rubavu",
    region: "Western Province",
    description: "A lake excursion",
    shortDescription: "A lake excursion",
    images: ["/placeholder.svg"],
    price: 420,
    priceLabel: "per guest",
    rating: 4.2,
    reviews: 4,
    availability: "Available",
    tags: ["lake"],
  },
];

describe("filterListings", () => {
  it("applies query, region, rating, and price filters together", () => {
    const results = filterListings(listings, {
      query: "Kigali",
      category: "all",
      region: "Kigali City",
      minPrice: 0,
      minRating: 4,
      maxPrice: 300,
      page: 1,
      limit: 12,
    });

    expect(results.map((listing) => listing.id)).toEqual(["kigali-stay"]);
  });

  it("returns no result when an item exceeds the selected price", () => {
    const results = filterListings(listings, {
      query: "Lake",
      category: "tours",
      region: "All regions",
      minPrice: 0,
      minRating: 0,
      maxPrice: 300,
      page: 1,
      limit: 12,
    });

    expect(results).toEqual([]);
  });
});
