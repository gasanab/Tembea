"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, ImageOff, MapPin } from "lucide-react";
import { Rating } from "@/components/ui/Rating";
import { useWishlist } from "@/hooks/useWishlist";
import { getListingHref, toListingRouteType } from "@/lib/listing-routes";
import type { Listing as ApiListing } from "@/types/api.types";
import type { Listing as LegacyListing } from "@/types/product.types";
import { formatCurrency } from "@/utils/formatters/currency";

type ListingCardProps = {
  listing: ApiListing | LegacyListing;
};

const actionLabelFor = (category: string) => {
  switch (category) {
    case "events":
      return "View tickets";
    case "marketplace":
      return "View product";
    case "restaurants":
      return "View restaurant";
    case "tour-guides":
      return "View guide";
    case "transport":
      return "View transport";
    default:
      return "View listing";
  }
};

export function ListingCard({ listing }: ListingCardProps) {
  const isApiListing = "type" in listing;
  const category = isApiListing
    ? toListingRouteType(listing.type)
    : listing.category;
  const listingId = listing.id;
  const name = isApiListing ? listing.name : listing.title;
  const reviewCount = isApiListing ? listing.reviewCount : listing.reviews;
  const availability = String(listing.availability || "AVAILABLE").replace(
    /_/g,
    " ",
  );
  const actionPath = getListingHref(
    isApiListing ? listing.type : category,
    listingId,
  );
  const image = listing.images?.find(
    (candidate) => typeof candidate === "string" && candidate.trim().length > 0,
  );
  const priceLabel = String(listing.priceLabel || "").replace(/^per\s+/i, "");
  const location = [listing.location, listing.region]
    .filter((value, index, values) => value && values.indexOf(value) === index)
    .join(", ");

  const { toggleWishlist, isWishlisted } = useWishlist();
  const [isToggling, setIsToggling] = useState(false);
  const wishlisted = isApiListing ? isWishlisted(listingId) : false;

  const isAvailable = isApiListing
    ? listing.availability === "AVAILABLE"
    : listing.availability === "Live" || listing.availability === "Available";
  const isFewLeft = isApiListing
    ? listing.availability === "FEW_LEFT"
    : listing.availability === "Few spots";
  const isUnavailable = isApiListing
    ? listing.availability === "FULLY_BOOKED" ||
      listing.availability === "CLOSED"
    : listing.availability === "Sold out";

  return (
    <article className="tembea-card group">
      <div className="relative overflow-hidden">
        {image ? (
          <Image
            className="media-card-image"
            src={image}
            alt={name}
            width={900}
            height={675}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="media-card-image flex items-center justify-center bg-gray-100 text-gray-500">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <ImageOff aria-hidden="true" size={18} />
              No image provided
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <span className="availability-pill">
              <span
                aria-hidden="true"
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  isAvailable
                    ? "bg-green-600"
                    : isFewLeft
                      ? "bg-yellow-500"
                      : isUnavailable
                        ? "bg-red-600"
                        : "bg-gray-500"
                }`}
              />
              {availability.toLowerCase()}
            </span>
            {listing.featured ? (
              <span className="availability-pill bg-yellow-100 text-yellow-900">
                Featured
              </span>
            ) : null}
          </div>

          {isApiListing ? (
            <button
              type="button"
              onClick={async (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (isToggling) return;

                setIsToggling(true);
                try {
                  await toggleWishlist(listingId);
                } finally {
                  setIsToggling(false);
                }
              }}
              disabled={isToggling}
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/90 text-gray-700 backdrop-blur-sm transition-colors hover:bg-white hover:text-red-600 ${
                isToggling ? "cursor-wait opacity-50" : ""
              }`}
              aria-label={
                wishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              <Heart
                aria-hidden="true"
                size={15}
                className={wishlisted ? "fill-red-600 text-red-600" : ""}
              />
            </button>
          ) : null}
        </div>

        <span className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-bold capitalize text-gray-700 backdrop-blur-sm">
          {category.replace("-", " ")}
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <Link href={actionPath} className="block">
            <h3 className="text-lg font-black leading-tight text-gray-900 transition-colors group-hover:text-[#145A32]">
              {name}
            </h3>
          </Link>
          {location ? (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin aria-hidden="true" size={13} />
              {location}
            </p>
          ) : null}
        </div>

        {listing.description ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-gray-600">
            {listing.description}
          </p>
        ) : null}

        <Rating value={listing.rating} reviews={reviewCount} />

        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="price-tag">
                {formatCurrency(listing.price)}
              </span>
              {priceLabel ? (
                <span className="ml-1 text-sm font-semibold text-gray-500">
                  / {priceLabel}
                </span>
              ) : null}
            </div>
            <Link
              href={actionPath}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#145A32] px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#0e4426] hover:shadow-lg"
            >
              {actionLabelFor(category)}
              <ArrowRight aria-hidden="true" size={15} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
