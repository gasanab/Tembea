import Link from "next/link";
import { Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";

const footerSections = [
  {
    title: "Discover",
    links: [
      { label: "Hotels", href: "/hotels" },
      { label: "Apartments", href: "/apartments" },
      { label: "Restaurants", href: "/restaurants" },
      { label: "Events", href: "/events" },
      { label: "Experiences", href: "/experiences" },
      { label: "National Parks", href: "/experiences#parks" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Made in Rwanda", href: "/made-in-rwanda" },
      { label: "Transport", href: "/transport" },
      { label: "Tour Guides", href: "/tour-guides" },
      { label: "Explore", href: "/explore" },
      { label: "Why Rwanda", href: "/why-rwanda" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Why Rwanda", href: "/why-rwanda" },
      { label: "Partner With Us", href: "/partner" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
  {
    title: "Dashboards",
    links: [
      { label: "Client Dashboard", href: "/client" },
      { label: "Partner Dashboard", href: "/partner" },
      { label: "Admin Dashboard", href: "/admin" },
      { label: "List Your Item", href: "/partner/listings" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="site-footer">
      {/* Main Footer */}
      <div className="tembea-container py-16">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
          {/* Brand Column */}
          <div className="space-y-5">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2ECC71] shadow-lg shadow-green-500/30" />
              <span className="text-2xl font-black text-white font-manrope">Tembea</span>
            </Link>
            <p className="text-sm leading-relaxed text-white/60 max-w-xs">
              Rwanda's all-in-one tourism marketplace. Discover, compare, and book
              accommodations, dining, events, transport, tours, and locally made products.
            </p>
            {/* Contact Info */}
            <div className="space-y-3 text-sm text-white/60">
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-[#2ECC71]" />
                <span>Kigali, Rwanda</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-[#2ECC71]" />
                <a href="mailto:hello@tembea.rw" className="hover:text-white transition-colors">
                  hello@tembea.rw
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-[#2ECC71]" />
                <a href="tel:+250788000000" className="hover:text-white transition-colors">
                  +250 788 000 000
                </a>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight
                        size={12}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="tembea-container py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} Tembea. All rights reserved. Rwanda Tourism Marketplace.
          </p>
          <div className="flex items-center gap-6 text-sm text-white/40">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
