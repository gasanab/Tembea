"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  DollarSign,
  MapPin,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";
import type { ListingCategory } from "@/types/product.types";
import type { SearchFilters } from "@/types/search.types";

type FilterSidebarProps = {
  filters: SearchFilters;
  onFilterChange: <Key extends keyof SearchFilters>(
    key: Key,
    value: SearchFilters[Key],
  ) => void;
  onClear: () => void;
  resultCount: number;
  onClose?: () => void;
  isMobile?: boolean;
};

export const searchCategories: {
  value: ListingCategory | "all";
  label: string;
}[] = [
  { value: "all", label: "All services" },
  { value: "hotels", label: "Stays" },
  { value: "apartments", label: "Apartments" },
  { value: "restaurants", label: "Restaurants" },
  { value: "parks", label: "National parks" },
  { value: "tours", label: "Tours & experiences" },
  { value: "events", label: "Events" },
  { value: "transport", label: "Transport" },
  { value: "tour-guides", label: "Tour guides" },
  { value: "museums", label: "Museums" },
  { value: "marketplace", label: "Made in Rwanda" },
];

const regions = [
  "All regions",
  "Kigali City",
  "Northern Province",
  "Southern Province",
  "Eastern Province",
  "Western Province",
];

const ratingOptions = [
  { value: 0, label: "Any rating" },
  { value: 3, label: "3.0 and above" },
  { value: 4, label: "4.0 and above" },
  { value: 4.5, label: "4.5 and above" },
];

type Section = "category" | "price" | "rating" | "region";

export function FilterSidebar({
  filters,
  onFilterChange,
  onClear,
  resultCount,
  onClose,
  isMobile = false,
}: FilterSidebarProps) {
  const [expanded, setExpanded] = useState<Record<Section, boolean>>({
    category: true,
    price: true,
    rating: true,
    region: true,
  });

  const toggle = (section: Section) => {
    setExpanded((current) => ({
      ...current,
      [section]: !current[section],
    }));
  };

  const sectionButton = (
    section: Section,
    label: string,
    icon?: React.ReactNode,
  ) => (
    <button
      type="button"
      onClick={() => toggle(section)}
      className="between w-full text-left"
      aria-expanded={expanded[section]}
      aria-controls={`search-filter-${section}`}
    >
      <span className="flex items-center gap-2 font-black text-tembea-dark">
        {icon}
        {label}
      </span>
      {expanded[section] ? (
        <ChevronUp aria-hidden="true" size={18} />
      ) : (
        <ChevronDown aria-hidden="true" size={18} />
      )}
    </button>
  );

  return (
    <aside
      aria-label="Search filters"
      className={`dashboard-card p-5 stack-lg ${
        isMobile
          ? "fixed inset-0 z-50 overflow-y-auto rounded-none bg-white"
          : "sticky top-20 h-fit"
      }`}
    >
      <div className="between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal aria-hidden="true" size={20} />
          <h2 className="text-xl font-black">Filters</h2>
        </div>
        {isMobile ? (
          <button
            type="button"
            onClick={onClose}
            className="btn-base btn-ghost p-2"
            aria-label="Close filters"
          >
            <X aria-hidden="true" size={20} />
          </button>
        ) : null}
      </div>

      <div className="rounded-tembea bg-tembea-light/60 p-3">
        <p className="text-sm font-bold text-tembea-dark">
          {resultCount} {resultCount === 1 ? "result" : "results"}
        </p>
        <button
          type="button"
          onClick={onClear}
          className="mt-2 text-xs font-bold text-tembea-primary hover:underline"
        >
          Clear filters
        </button>
      </div>

      <section className="stack-sm border-b border-tembea-light pb-4">
        {sectionButton("category", "Category")}
        {expanded.category ? (
          <div id="search-filter-category" className="stack-sm">
            {searchCategories.map((category) => (
              <label
                key={category.value}
                className="flex cursor-pointer items-center gap-2 rounded-tembea p-2 hover:bg-tembea-light/40"
              >
                <input
                  type="radio"
                  name="category"
                  value={category.value}
                  checked={filters.category === category.value}
                  onChange={(event) =>
                    onFilterChange(
                      "category",
                      event.target.value as ListingCategory | "all",
                    )
                  }
                  className="accent-tembea-primary"
                />
                <span className="text-sm font-semibold">{category.label}</span>
              </label>
            ))}
          </div>
        ) : null}
      </section>

      <section className="stack-sm border-b border-tembea-light pb-4">
        {sectionButton(
          "price",
          "Price",
          <DollarSign aria-hidden="true" size={16} />,
        )}
        {expanded.price ? (
          <div id="search-filter-price" className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs font-bold text-muted">Minimum</span>
              <input
                className="field-control"
                inputMode="decimal"
                min="0"
                type="number"
                placeholder="No minimum"
                value={filters.minPrice || ""}
                onChange={(event) =>
                  onFilterChange(
                    "minPrice",
                    Math.max(0, Number(event.target.value) || 0),
                  )
                }
                aria-label="Minimum price"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-bold text-muted">Maximum</span>
              <input
                className="field-control"
                inputMode="decimal"
                min="0"
                type="number"
                placeholder="No maximum"
                value={filters.maxPrice || ""}
                onChange={(event) =>
                  onFilterChange(
                    "maxPrice",
                    Math.max(0, Number(event.target.value) || 0),
                  )
                }
                aria-label="Maximum price"
              />
            </label>
            {filters.minPrice > 0 &&
            filters.maxPrice > 0 &&
            filters.minPrice > filters.maxPrice ? (
              <p className="col-span-2 text-xs font-semibold text-red-600">
                Minimum price must not exceed maximum price.
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="stack-sm border-b border-tembea-light pb-4">
        {sectionButton(
          "rating",
          "Rating",
          <Star aria-hidden="true" size={16} />,
        )}
        {expanded.rating ? (
          <div id="search-filter-rating" className="stack-sm">
            {ratingOptions.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 rounded-tembea p-2 hover:bg-tembea-light/40"
              >
                <input
                  type="radio"
                  name="rating"
                  value={option.value}
                  checked={filters.minRating === option.value}
                  onChange={(event) =>
                    onFilterChange("minRating", Number(event.target.value))
                  }
                  className="accent-tembea-primary"
                />
                <span className="text-sm font-semibold">{option.label}</span>
              </label>
            ))}
          </div>
        ) : null}
      </section>

      <section className="stack-sm pb-4">
        {sectionButton(
          "region",
          "Region",
          <MapPin aria-hidden="true" size={16} />,
        )}
        {expanded.region ? (
          <div id="search-filter-region" className="stack-sm">
            {regions.map((region) => (
              <label
                key={region}
                className="flex cursor-pointer items-center gap-2 rounded-tembea p-2 hover:bg-tembea-light/40"
              >
                <input
                  type="radio"
                  name="region"
                  value={region}
                  checked={filters.region === region}
                  onChange={(event) =>
                    onFilterChange("region", event.target.value)
                  }
                  className="accent-tembea-primary"
                />
                <span className="text-sm font-semibold">{region}</span>
              </label>
            ))}
          </div>
        ) : null}
      </section>

      {isMobile ? (
        <button type="button" onClick={onClose} className="btn-base btn-dark w-full">
          View {resultCount} {resultCount === 1 ? "result" : "results"}
        </button>
      ) : null}
    </aside>
  );
}
