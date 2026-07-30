"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Bus,
  Compass,
  Hotel,
  ShoppingBag,
  Ticket,
  Users,
  Utensils,
} from "lucide-react";
import { Hero } from "@/components/hero/Hero";
import { ListingCard } from "@/components/cards/ListingCard";
import {
  useFeaturedListings,
  useListingsByType,
} from "@/hooks/useListings";
import { RWANDA_IMAGES } from "@/utils/constants/rwanda-images";

const categories = [
  {
    icon: Hotel,
    label: "Hotels",
    href: "/hotels",
    image: RWANDA_IMAGES.hotel,
  },
  {
    icon: Building2,
    label: "Apartments",
    href: "/apartments",
    image: RWANDA_IMAGES.apartment,
  },
  {
    icon: Utensils,
    label: "Restaurants",
    href: "/restaurants",
    image: RWANDA_IMAGES.restaurant,
  },
  {
    icon: Ticket,
    label: "Events",
    href: "/events",
    image: RWANDA_IMAGES.event,
  },
  {
    icon: Compass,
    label: "Tours",
    href: "/experiences",
    image: RWANDA_IMAGES.tour,
  },
  {
    icon: Bus,
    label: "Transport",
    href: "/transport",
    image: RWANDA_IMAGES.vehicle,
  },
  {
    icon: Users,
    label: "Tour guides",
    href: "/tour-guides",
    image: RWANDA_IMAGES.gorilla,
  },
  {
    icon: ShoppingBag,
    label: "Made in Rwanda",
    href: "/made-in-rwanda",
    image: RWANDA_IMAGES.crafts,
  },
];

const destinations = [
  { name: "Kigali", image: RWANDA_IMAGES.kigali },
  { name: "Volcanoes National Park", image: RWANDA_IMAGES.volcanoes },
  { name: "Lake Kivu", image: RWANDA_IMAGES.lake_kivu },
  { name: "Akagera National Park", image: RWANDA_IMAGES.akagera },
  { name: "Nyungwe Forest", image: RWANDA_IMAGES.nyungwe },
  { name: "Huye", image: RWANDA_IMAGES.culture },
];

function ListingSection({
  title,
  description,
  href,
  listings,
  isLoading,
  error,
}: {
  title: string;
  description: string;
  href: string;
  listings: ReturnType<typeof useFeaturedListings>["listings"];
  isLoading: boolean;
  error: Error | null;
}) {
  return (
    <section className="border-b border-gray-100 bg-white py-16">
      <div className="tembea-container">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900">{title}</h2>
            <p className="mt-2 font-medium text-gray-600">{description}</p>
          </div>
          <Link
            href={href}
            className="hidden items-center gap-1 text-sm font-bold text-emerald-800 transition-colors hover:text-emerald-600 sm:flex"
          >
            View all <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>

        {isLoading ? (
          <div className="auto-grid" aria-label={`Loading ${title}`}>
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-80 animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
            <h3 className="font-black text-gray-900">Listings unavailable</h3>
            <p className="mt-2 text-sm text-gray-600">
              The listing service could not be reached. Please try again later.
            </p>
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8 text-center">
            <h3 className="font-black text-gray-900">
              No listings to show yet
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Published partner listings will appear here when available.
            </p>
          </div>
        ) : (
          <div className="auto-grid">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function HomePage() {
  const {
    listings: featuredListings,
    isLoading: featuredLoading,
    error: featuredError,
  } = useFeaturedListings(4);
  const {
    listings: tours,
    isLoading: toursLoading,
    error: toursError,
  } = useListingsByType("TOURS", 4);

  return (
    <main>
      <Hero />

      <section className="border-b border-gray-100 bg-white py-16">
        <div className="tembea-container">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900">
              Explore by category
            </h2>
            <Link
              href="/explore"
              className="hidden items-center gap-1 text-sm font-bold text-emerald-800 transition-colors hover:text-emerald-600 sm:flex"
            >
              Search all services <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.href}
                  href={category.href}
                  className="group block"
                >
                  <div className="relative mb-3 aspect-[4/3] w-full overflow-hidden rounded-2xl">
                    <Image
                      src={category.image}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-md">
                        <Icon aria-hidden="true" size={16} />
                      </span>
                      <h3 className="text-sm font-black">{category.label}</h3>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-gray-100 bg-gray-50 py-16">
        <div className="tembea-container">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900">
                Search by destination
              </h2>
              <p className="mt-2 font-medium text-gray-600">
                See current listings that mention each destination.
              </p>
            </div>
            <Link
              href="/explore"
              className="hidden items-center gap-1 text-sm font-bold text-emerald-800 transition-colors hover:text-emerald-600 sm:flex"
            >
              Open search <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {destinations.map((destination) => (
              <Link
                key={destination.name}
                href={`/explore?q=${encodeURIComponent(destination.name)}`}
                className="group relative block h-64 overflow-hidden rounded-3xl"
              >
                <Image
                  src={destination.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 flex w-full items-end justify-between p-6">
                  <h3 className="text-2xl font-black text-white drop-shadow-md">
                    {destination.name}
                  </h3>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md transition-colors group-hover:bg-white group-hover:text-emerald-700">
                    <ArrowRight aria-hidden="true" size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ListingSection
        title="Featured listings"
        description="Listings marked as featured by Tembea."
        href="/explore"
        listings={featuredListings}
        isLoading={featuredLoading}
        error={featuredError}
      />

      <ListingSection
        title="Tours and experiences"
        description="Currently published tour listings from Tembea partners."
        href="/experiences"
        listings={tours}
        isLoading={toursLoading}
        error={toursError}
      />
    </main>
  );
}
