import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Star, MapPin, Globe2, Leaf, Users, Camera, Sun } from "lucide-react";
import { RWANDA_IMAGES } from "@/utils/constants/rwanda-images";

export const metadata: Metadata = { title: "Why Visit Rwanda" };

const highlights = [
  {
    icon: ShieldCheck,
    title: "Safest Country in Africa",
    body: "Rwanda consistently ranks as one of the safest destinations on the continent, with low crime rates and well-maintained infrastructure.",
  },
  {
    icon: Leaf,
    title: "Gorilla Trekking",
    body: "Home to over a third of the world's mountain gorillas in Volcanoes National Park — a once-in-a-lifetime wildlife encounter.",
  },
  {
    icon: MapPin,
    title: "4 Stunning National Parks",
    body: "From Akagera's Big Five savannah to Nyungwe's ancient rainforest canopy walk, Rwanda's parks offer unmatched biodiversity.",
  },
  {
    icon: Globe2,
    title: "Visa-Free Travel",
    body: "Citizens of most African Union countries can enter Rwanda visa-free. Others can obtain a visa on arrival or online in minutes.",
  },
  {
    icon: Star,
    title: "Luxury & Eco Tourism",
    body: "World-class lodges, award-winning eco-resorts, and boutique hotels blend seamlessly with the country's conservation mission.",
  },
  {
    icon: Users,
    title: "Warm Hospitality",
    body: "The spirit of 'Agaciro' — dignity and mutual respect — flows through every interaction. Rwandans are renowned for their warmth.",
  },
  {
    icon: Camera,
    title: "Vibrant Culture",
    body: "Immerse yourself in Intore dance performances, Imigongo art, lively markets, and the annual Kwita Izina gorilla naming ceremony.",
  },
  {
    icon: Sun,
    title: "Year-Round Sunshine",
    body: "With two dry seasons (June–September and December–February), Rwanda offers pleasant weather for travel most of the year.",
  },
];

const regions = [
  {
    name: "Kigali",
    tagline: "The clean, modern capital",
    img: RWANDA_IMAGES.kigali,
    href: "/hotels",
  },
  {
    name: "Volcanoes",
    tagline: "Gorilla & golden monkey trekking",
    img: RWANDA_IMAGES.mountain_gorilla,
    href: "/experiences",
  },
  {
    name: "Lake Kivu",
    tagline: "Beaches, islands & sunsets",
    img: RWANDA_IMAGES.lake_kivu,
    href: "/hotels",
  },
  {
    name: "Akagera",
    tagline: "Big Five safari adventures",
    img: RWANDA_IMAGES.akagera_national_park,
    href: "/experiences",
  },
];

export default function WhyRwandaPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <Image
          src={RWANDA_IMAGES.landscape}
          alt="Rwanda aerial landscape"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        <div className="relative text-center text-white px-4 max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 bg-[#2ECC71]/90 rounded-full text-sm font-bold mb-4">
            Discover Rwanda
          </span>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-4">
            The Land of a Thousand Hills
          </h1>
          <p className="text-lg md:text-xl text-white/85 leading-relaxed mb-8">
            A country of extraordinary natural beauty, remarkable resilience, and genuine warmth.
            Rwanda is Africa's most inspiring destination.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/explore" className="btn-base bg-[#2ECC71] text-[#145A32] font-black px-8 py-3.5">
              Explore Listings <ArrowRight size={18} aria-hidden />
            </Link>
            <Link href="/sign-up" className="btn-base bg-white/15 text-white px-8 py-3.5 hover:bg-white/25">
              Plan My Trip
            </Link>
          </div>
        </div>
      </section>

      {/* Quick stats */}
      <section className="bg-[#145A32] py-10">
        <div className="tembea-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            {[
              { v: "4", l: "National Parks" },
              { v: "5", l: "Tourism Regions" },
              { v: "1,000+", l: "Mountain Gorillas" },
              { v: "#1", l: "Safest in Africa" },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-3xl font-black text-[#2ECC71]">{s.v}</p>
                <p className="text-sm font-semibold text-white/70 mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="section-pad">
        <div className="tembea-container">
          <div className="text-center mb-12">
            <span className="section-kicker">Why Choose Rwanda</span>
            <h2 className="section-title mt-2">8 reasons to visit Rwanda</h2>
            <p className="section-subtitle mt-2 mx-auto">
              Beyond the gorillas, Rwanda offers a depth of experience that surprises every traveler.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((h) => {
              const Icon = h.icon;
              return (
                <div key={h.title} className="dashboard-card p-6 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#D5F5E3] flex items-center justify-center">
                    <Icon size={22} className="text-[#145A32]" aria-hidden />
                  </div>
                  <h3 className="font-black text-gray-900">{h.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{h.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Regions */}
      <section className="section-pad bg-gray-50">
        <div className="tembea-container">
          <div className="text-center mb-12">
            <span className="section-kicker">Explore Regions</span>
            <h2 className="section-title mt-2">Where to go in Rwanda</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {regions.map((r) => (
              <Link key={r.name} href={r.href} className="group block rounded-2xl overflow-hidden shadow-soft hover:shadow-hover transition-shadow">
                <div className="relative h-52">
                  <Image src={r.img} alt={r.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4 text-white">
                    <p className="font-black text-lg">{r.name}</p>
                    <p className="text-xs text-white/80">{r.tagline}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#145A32]">
        <div className="tembea-container text-center max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl font-black text-white">Ready to experience Rwanda?</h2>
          <p className="text-white/75">
            Book your hotels, experiences, transport, and more — all in one place with Tembea.
          </p>
          <Link href="/explore" className="btn-base bg-[#2ECC71] text-[#145A32] font-black px-8 py-3.5 inline-flex">
            Start Exploring <ArrowRight size={18} aria-hidden />
          </Link>
        </div>
      </section>
    </main>
  );
}
