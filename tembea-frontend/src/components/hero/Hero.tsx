"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bus,
  Compass,
  Hotel,
  MapPin,
  Search,
  ShoppingBag,
  Ticket,
  Users,
  Utensils,
} from "lucide-react";
import type { ListingCategory } from "@/types/product.types";
import { RWANDA_IMAGES } from "@/utils/constants/rwanda-images";

const tabs: {
  category: Exclude<ListingCategory, "apartments" | "lakes">;
  label: string;
  icon: typeof Hotel;
}[] = [
  { category: "hotels", label: "Stays", icon: Hotel },
  { category: "restaurants", label: "Restaurants", icon: Utensils },
  { category: "tours", label: "Tours", icon: Compass },
  { category: "parks", label: "Parks", icon: Compass },
  { category: "events", label: "Events", icon: Ticket },
  { category: "transport", label: "Transport", icon: Bus },
  { category: "tour-guides", label: "Guides", icon: Users },
  {
    category: "marketplace",
    label: "Made in Rwanda",
    icon: ShoppingBag,
  },
];

const suggestions = [
  "Kigali",
  "Volcanoes National Park",
  "Lake Kivu",
  "Akagera",
];

export function Hero() {
  const router = useRouter();
  const [category, setCategory] =
    useState<(typeof tabs)[number]["category"]>("hotels");
  const [query, setQuery] = useState("");

  const openSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams({ category });
    if (query.trim()) params.set("q", query.trim());
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <section className="relative flex min-h-[620px] w-full items-center justify-center overflow-hidden py-24">
      <div className="absolute inset-0 z-0">
        <Image
          src={RWANDA_IMAGES.hero}
          alt="Rwanda landscape"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/45 to-black/30" />
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl text-center">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/30 px-4 py-2 text-xs font-bold text-white backdrop-blur-md">
            Rwanda tourism marketplace
          </p>

          <h1 className="mb-4 text-4xl font-black leading-tight tracking-tight text-white drop-shadow-lg md:text-6xl lg:text-7xl">
            Discover Rwanda
            <span className="block text-[#2ECC71]">in one place</span>
          </h1>
          <p className="mx-auto mb-9 max-w-2xl text-lg font-medium text-white md:text-xl">
            Search current listings from Tembea partners by service,
            destination, region, price, and rating.
          </p>

          <form
            onSubmit={openSearch}
            className="mx-auto max-w-5xl rounded-3xl bg-white p-3 shadow-2xl"
            role="search"
          >
            <div
              className="mb-3 flex gap-2 overflow-x-auto border-b border-gray-100 px-2 pb-3"
              aria-label="Service category"
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = category === tab.category;
                return (
                  <button
                    key={tab.category}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCategory(tab.category)}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-bold transition-all ${
                      active
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-transparent text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon
                      aria-hidden="true"
                      size={16}
                      className={active ? "text-emerald-700" : "text-gray-400"}
                    />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-2 px-2 pb-2 md:flex-row">
              <label className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 p-3 text-left transition-colors focus-within:border-emerald-600 focus-within:bg-white">
                <span className="mb-1 block text-[10px] font-black uppercase tracking-wider text-gray-800">
                  Destination or service
                </span>
                <span className="flex items-center gap-2">
                  <MapPin
                    aria-hidden="true"
                    size={17}
                    className="text-gray-400"
                  />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Try Kigali, a hotel name, or a park"
                    className="w-full border-none bg-transparent text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-500"
                  />
                </span>
              </label>

              <button
                type="submit"
                className="flex min-h-[60px] items-center justify-center gap-2 rounded-2xl bg-[#145A32] px-8 py-3 font-bold text-white shadow-lg transition-all hover:bg-[#0e4426]"
              >
                <Search aria-hidden="true" size={18} />
                Search listings
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs font-bold text-white">Try a destination:</span>
            {suggestions.map((term) => (
              <Link
                key={term}
                href={`/explore?q=${encodeURIComponent(term)}`}
                className="rounded-full border border-white/30 bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition-all hover:bg-white/30"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
