import Link from "next/link";
import { SmartSearch } from "@/components/search/SmartSearch";
import type { ListingCategory } from "@/types/product.types";

type ListingPageShellProps = {
  category: ListingCategory;
  title: string;
  description: string;
};

export function ListingPageShell({
  category,
  title,
  description,
}: ListingPageShellProps) {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-[#145A32] to-[#277C4B] py-16 md:py-20">
        <div className="tembea-container">
          <div className="max-w-3xl">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 transition-colors hover:text-white"
            >
              <span aria-hidden="true">←</span> Home
            </Link>
            <h1 className="text-4xl font-black leading-tight text-white md:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/85">
              {description}
            </p>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="tembea-container">
          <SmartSearch
            showResults
            initialFilters={{
              category,
              ...(category === "apartments" ? { query: "apartment" } : {}),
            }}
          />
        </div>
      </section>
    </main>
  );
}
