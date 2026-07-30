"use client";

import { useListing } from "@/hooks/useListings";
import { BookingWidget } from "./BookingWidget";
import {
  Loader2, Shield, MapPin, Star, Heart, Share2,
  CheckCircle2, ChevronLeft, ChevronRight, MessageSquare, Sparkles,
  Calendar, Users, Wifi, Car, Coffee, Dumbbell, Waves, ImageOff,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useWishlist } from "@/hooks/useWishlist";
import { productsApi } from "@/lib/api-client";
import type { Product } from "@/types/api.types";

const CATEGORY_LABELS: Record<string, string> = {
  parks: "National Park",
  events: "Event",
  restaurants: "Restaurant",
  tours: "Tour",
  marketplace: "Made in Rwanda",
  transport: "Transport",
};

const WIDGET_TYPES: Record<string, any> = {
  parks: "parks",
  events: "events",
  restaurants: "restaurants",
  tours: "tours",
  marketplace: "marketplace",
  transport: "transport",
};

function amenityIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("wifi")) return Wifi;
  if (lower.includes("park")) return Car;
  if (lower.includes("breakfast") || lower.includes("coffee")) return Coffee;
  if (lower.includes("gym")) return Dumbbell;
  if (lower.includes("pool") || lower.includes("swim")) return Waves;
  return CheckCircle2;
}

type Props = {
  listingId: string;
  type: "parks" | "events" | "restaurants" | "tours" | "marketplace" | "transport";
};

export function GenericBookingPage({ listingId, type }: Props) {
  const { listing, isLoading, error } = useListing(listingId);
  const [currentImage, setCurrentImage] = useState(0);
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [isToggling, setIsToggling] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [marketplaceProducts, setMarketplaceProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(
    type === "marketplace",
  );
  const [productsError, setProductsError] = useState<string | null>(null);

  useEffect(() => {
    if (type !== "marketplace") return;

    let active = true;
    setProductsLoading(true);
    setProductsError(null);
    setSelectedUnit(null);

    productsApi
      .getByListing(listingId)
      .then((products) => {
        if (active) setMarketplaceProducts(products);
      })
      .catch((caughtError) => {
        if (!active) return;
        setMarketplaceProducts([]);
        setProductsError(
          caughtError instanceof Error
            ? caughtError.message
            : "Products could not be loaded.",
        );
      })
      .finally(() => {
        if (active) setProductsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [listingId, type]);

  const images = listing?.images?.filter(Boolean) || [];
  const wishlisted = isWishlisted(listingId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading details...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md p-8">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Shield className="text-red-600" size={28} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Listing Not Found</h2>
          <p className="text-gray-600 mb-6">
            This listing could not be loaded. It may have been removed or is temporarily unavailable.
          </p>
        </div>
      </div>
    );
  }

  const amenities: string[] = listing.amenities || [];
  const available = listing.available ?? 0;

  return (
    <>
      {/* Hero */}
      <section className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
        {images.length > 0 ? (
          <Image
            src={images[currentImage]}
            alt={listing.name}
            fill
            className="object-cover transition-opacity duration-500"
            priority
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white/80">
            <span className="flex items-center gap-2 font-semibold">
              <ImageOff aria-hidden="true" size={22} />
              No image provided
            </span>
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImage((p) => (p - 1 + images.length) % images.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110 transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => setCurrentImage((p) => (p + 1) % images.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110 transition-all"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImage(idx)}
              className={`h-2 rounded-full transition-all ${idx === currentImage ? "w-8 bg-white" : "w-2 bg-white/50"}`}
            />
          ))}
        </div>

        <div className="absolute top-6 right-6 z-20 flex gap-3">
          <button
            onClick={async () => {
              if (!isToggling) {
                setIsToggling(true);
                try { await toggleWishlist(listingId); } finally { setIsToggling(false); }
              }
            }}
            disabled={isToggling}
            className={`p-3 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110 transition-all ${isToggling ? "opacity-50" : ""}`}
          >
            <Heart size={20} className={wishlisted ? "fill-red-500 text-red-500" : ""} />
          </button>
          <button
            onClick={() => navigator.share?.({ title: listing.name, url: window.location.href })}
            className="p-3 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110 transition-all"
          >
            <Share2 size={20} />
          </button>
        </div>

        <div className="absolute bottom-8 left-8 z-20 text-white">
          <span className="px-3 py-1 rounded-full bg-emerald-500 text-xs font-black mb-3 inline-block">
            {CATEGORY_LABELS[type] || type}
          </span>
          <h1 className="text-4xl lg:text-5xl font-black mb-2 drop-shadow-lg">{listing.name}</h1>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1">
              <MapPin size={18} />
              <span className="font-bold">{listing.location}, {listing.region}</span>
            </div>
            {listing.rating > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                <Star size={16} fill="#FFC700" stroke="#FFC700" />
                <span className="font-black">{listing.rating.toFixed(1)}</span>
                <span className="font-semibold">({listing.reviewCount} reviews)</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Left */}
          <div className="space-y-8">
            {/* Description */}
            <section className="rounded-3xl bg-white border-2 border-gray-200 p-8 shadow-lg">
              <h2 className="text-3xl font-black mb-4 flex items-center gap-2">
                <Sparkles className="text-emerald-600" size={28} />
                About
              </h2>
              <p className="text-gray-700 leading-relaxed font-semibold text-lg">{listing.description}</p>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                  <div className="text-2xl font-black text-emerald-600">${listing.price}</div>
                  <div className="text-sm font-bold text-gray-600">/{listing.priceLabel}</div>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center">
                  <div className="text-2xl font-black text-blue-600">{listing.availability.replace(/_/g, " ")}</div>
                  <div className="text-sm font-bold text-gray-600">Status</div>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                  <div className="text-2xl font-black text-amber-600">{available}</div>
                  <div className="text-sm font-bold text-gray-600">Available</div>
                </div>
              </div>
            </section>

            {/* Amenities / Features */}
            {amenities.length > 0 && (
              <section className="rounded-3xl bg-white border-2 border-gray-200 p-8 shadow-lg">
                <h2 className="text-3xl font-black mb-6">Features & Amenities</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {amenities.map((a: string, i: number) => {
                    const Icon = amenityIcon(a);
                    return (
                      <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                        <Icon className="text-emerald-600 shrink-0" size={22} />
                        <span className="font-bold text-gray-800">{a}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Available Options — per listing type */}
            {(() => {
              const extra = listing.extraData || {};

              // Build the bookable units based on listing type
              let units: any[] = [];
              let unitLabel = "Option";
              let unitIcon = "🎟";

              if (type === "events") {
                units = (extra.ticketCategories || []).map((t: any) => ({
                  title: t.name,
                  subtitle: t.description || "",
                  price: t.price,
                  available: t.quantity || t.available,
                  features: t.benefits || [],
                  raw: t,
                }));
                unitLabel = "Ticket"; unitIcon = "🎟";
              } else if (type === "restaurants") {
                // Flatten menu categories into bookable items
                (extra.menuCategories || []).forEach((cat: any) => {
                  (cat.items || []).forEach((item: any) => {
                    units.push({
                      title: item.name,
                      subtitle: `${cat.name}${item.description ? " — " + item.description : ""}`,
                      price: item.price,
                      available: null,
                      features: [
                        item.isVegetarian ? "Vegetarian" : "",
                        item.isSpicy ? "Spicy" : "",
                        item.isPopular ? "Popular" : "",
                      ].filter(Boolean),
                      raw: item,
                    });
                  });
                });
                unitLabel = "Menu Item"; unitIcon = "🍽";
              } else if (type === "parks") {
                const fees = extra.entryFees || extra.zoneFees || [];
                units = fees.map((f: any) => ({
                  title: f.name || f.zone || f.category || "Entry",
                  subtitle: f.description || "",
                  price: f.price || f.fee,
                  available: f.slots || f.capacity,
                  features: f.includes || f.benefits || [],
                  raw: f,
                }));
                unitLabel = "Entry"; unitIcon = "🌿";
              } else if (type === "tours") {
                const pkgs = extra.tourPackages || extra.packages || [];
                units = pkgs.map((p: any) => ({
                  title: p.name || p.title,
                  subtitle: p.description || `${p.duration || ""} ${p.difficulty ? "| " + p.difficulty : ""}`.trim(),
                  price: p.price,
                  available: p.slots || p.available || p.maxGroupSize,
                  features: p.includes || p.included || [],
                  raw: p,
                }));
                unitLabel = "Package"; unitIcon = "🗺";
              } else if (type === "transport") {
                const vehicles = extra.vehicles || extra.vehicleTypes || [];
                units = vehicles.map((v: any) => ({
                  title: v.name || v.vehicleType || v.type,
                  subtitle: v.description || `${v.seats ? v.seats + " seats" : ""} ${v.transmission || ""}`.trim(),
                  price: v.price || v.pricePerDay,
                  available: v.available || v.quantity,
                  features: v.features || v.includes || [],
                  raw: v,
                }));
                unitLabel = "Vehicle"; unitIcon = "🚗";
              } else if (type === "marketplace") {
                units = marketplaceProducts.map((product) => ({
                  title: product.name,
                  subtitle: product.description || "",
                  price: product.price,
                  available: product.stock,
                  features: product.tags || [],
                  raw: product,
                }));
                unitLabel = "Product"; unitIcon = "📦";
              }

              if (type === "marketplace" && productsLoading) {
                return (
                  <section className="rounded-3xl border-2 border-gray-200 bg-white p-8 shadow-lg">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Loader2
                        className="animate-spin text-emerald-600"
                        size={22}
                        aria-hidden
                      />
                      <p className="font-bold">Loading available products...</p>
                    </div>
                  </section>
                );
              }

              if (type === "marketplace" && productsError) {
                return (
                  <section
                    role="alert"
                    className="rounded-3xl border-2 border-red-200 bg-white p-8 shadow-lg"
                  >
                    <h2 className="text-xl font-black text-gray-900">
                      Products unavailable
                    </h2>
                    <p className="mt-2 text-sm font-semibold text-red-700">
                      {productsError}
                    </p>
                  </section>
                );
              }

              if (type === "marketplace" && units.length === 0) {
                return (
                  <section className="rounded-3xl border-2 border-gray-200 bg-white p-8 shadow-lg">
                    <h2 className="text-xl font-black text-gray-900">
                      No products available
                    </h2>
                    <p className="mt-2 text-sm font-semibold text-gray-600">
                      This shop does not currently have a product available for
                      online purchase.
                    </p>
                  </section>
                );
              }

              if (units.length === 0) return null;

              return (
                <section className="rounded-3xl bg-white border-2 border-gray-200 p-8 shadow-lg">
                  <h2 className="text-3xl font-black mb-6 flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-600" size={28} />
                    Available {unitLabel}s
                  </h2>
                  <div className="space-y-4">
                    {units.map((unit: any, idx: number) => {
                      const unitKey = unit.raw?.id ?? `${unit.title}-${idx}`;
                      const selectedKey =
                        selectedUnit?.raw?.id ?? selectedUnit?.selectionKey;
                      const isSelected = selectedKey === unitKey;
                      const isUnavailable =
                        type === "marketplace" && Number(unit.available) < 1;
                      return (
                        <div key={unitKey} className={`border-2 rounded-2xl overflow-hidden transition-all shadow-sm hover:shadow-md ${
                          isSelected ? "border-emerald-500 ring-2 ring-emerald-200" : "border-gray-200 hover:border-emerald-300"
                        }`}>
                          <div className="p-5 flex justify-between items-start">
                            <div className="flex-1">
                              <h5 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                <span>{unitIcon}</span> {unit.title}
                              </h5>
                              {unit.subtitle && (
                                <p className="text-sm font-semibold text-gray-500 mt-1 leading-snug">{unit.subtitle}</p>
                              )}
                              {unit.features.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                  {unit.features.map((f: string, i: number) => (
                                    <span key={i} className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-md text-xs font-bold text-emerald-800">
                                      ✓ {f}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="ml-4 text-right shrink-0">
                              {unit.price != null && (
                                <>
                                  <div className="text-3xl font-black text-emerald-600">${unit.price}</div>
                                  <div className="text-xs font-bold text-gray-500 mt-0.5">
                                    {type === "transport" ? "/day" : type === "restaurants" ? "" : "/person"}
                                  </div>
                                </>
                              )}
                              {unit.available != null && (
                                <div className="text-xs font-semibold text-gray-400 mt-1">{unit.available} available</div>
                              )}
                            </div>
                          </div>
                          <div className="px-5 pb-4 flex justify-end border-t border-gray-100">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUnit({
                                  ...unit,
                                  selectionKey: unitKey,
                                });
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              disabled={isUnavailable}
                              className={`mt-3 px-6 py-2.5 text-sm font-bold rounded-xl transition-colors ${
                                isUnavailable
                                  ? "cursor-not-allowed bg-gray-200 text-gray-500"
                                  : isSelected
                                    ? "bg-emerald-600 text-white"
                                    : "bg-gray-900 text-white hover:bg-emerald-600"
                              }`}
                            >
                              {isUnavailable
                                ? "Out of stock"
                                : isSelected
                                  ? `${unitIcon} Selected`
                                  : type === "marketplace"
                                    ? "Select product"
                                    : `Book ${unit.title.split(" ")[0]}`}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })()} 

            {/* Extra Data (type-specific info from backend) */}
            {listing.extraData && Object.keys(listing.extraData).length > 0 && (
              <section className="rounded-3xl bg-white border-2 border-gray-200 p-8 shadow-lg">
                <h2 className="text-3xl font-black mb-6">Details</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {Object.entries(listing.extraData).map(([key, val]) => (
                    typeof val === "string" || typeof val === "number" ? (
                      <div key={key} className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                          {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim()}
                        </div>
                        <div className="font-black text-gray-900">{String(val)}</div>
                      </div>
                    ) : null
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            <section className="rounded-3xl bg-white border-2 border-gray-200 p-8 shadow-lg">
              <h2 className="text-3xl font-black mb-6 flex items-center gap-2">
                <MessageSquare className="text-emerald-600" size={28} />
                Guest Reviews
              </h2>
              <div className="flex items-center gap-4 mb-8 p-6 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="text-center">
                  <div className="text-5xl font-black text-emerald-600">
                    {listing.rating?.toFixed(1) || "—"}
                  </div>
                  <div className="text-sm font-bold text-gray-600">Rating</div>
                </div>
                <div className="flex-1">
                  <div className="text-xl font-black mb-2">{listing.reviewCount || 0} Reviews</div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={20}
                        fill={s <= Math.round(listing.rating || 0) ? "#FFC700" : "none"}
                        stroke="#FFC700"
                      />
                    ))}
                  </div>
                </div>
              </div>
              {(listing.reviews || []).slice(0, 3).map((r: any, idx: number) => (
                <div key={idx} className="mb-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-sm">
                      {r.user?.name?.[0] || "G"}
                    </div>
                    <span className="font-bold text-gray-800">{r.user?.name || "Guest"}</span>
                    <div className="flex gap-0.5 ml-auto">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={14} fill={s <= r.rating ? "#FFC700" : "none"} stroke="#FFC700" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 font-semibold">{r.comment}</p>
                </div>
              ))}
              {(!listing.reviews || listing.reviews.length === 0) && (
                <p className="text-gray-500 font-semibold text-center py-4">
                  No reviews yet. Be the first to share your experience!
                </p>
              )}
            </section>

            {/* Location */}
            <section className="rounded-3xl bg-white border-2 border-gray-200 p-8 shadow-lg">
              <h2 className="text-3xl font-black mb-4 flex items-center gap-2">
                <MapPin className="text-emerald-600" size={28} />
                Location
              </h2>
              <div className="h-48 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center border-2 border-emerald-200">
                <div className="text-center">
                  <MapPin size={36} className="text-emerald-600 mx-auto mb-2" />
                  <p className="font-bold text-emerald-800">{listing.location}</p>
                  <p className="text-sm text-emerald-600">{listing.region}, Rwanda</p>
                </div>
              </div>
            </section>
          </div>

          {/* Right - Booking Widget */}
          <div className="lg:sticky lg:top-24 h-fit">
<BookingWidget
              type={WIDGET_TYPES[type]}
              price={selectedUnit ? (selectedUnit.price ?? listing.price) : listing.price}
              available={selectedUnit ? (selectedUnit.available ?? available) : available}
              itemName={selectedUnit ? `${listing.name} — ${selectedUnit.title}` : listing.name}
              listingId={listingId}
              itemId={selectedUnit?.raw?.id}
            />
            <div className="mt-6 rounded-2xl bg-white border-2 border-gray-200 p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="text-emerald-600" size={24} />
                <span className="font-black text-gray-800">Before you book</span>
              </div>
              <p className="text-sm font-semibold text-gray-600 leading-relaxed">
                Review the listing details, dates or quantity, and total before submitting your booking.
              </p>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
