"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  WalletCards,
  ChartNoAxesCombined,
  Star,
  MessageSquare,
  Bell,
  Settings,
  Plus,
  Menu,
  X,
  BedDouble,
  Ticket,
  Package,
  Car,
  UserCheck,
  LogOut,
  UserCircle,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { RoleGuard } from "@/components/auth/RoleGuard";

const sidebarItems = [
  { label: "Overview", href: "/partner", icon: LayoutDashboard },
  { label: "My Listings", href: "/partner/listings", icon: Building2 },
  { label: "Bookings", href: "/partner/bookings", icon: CalendarCheck },
  { label: "Room Manager", href: "/partner/rooms", icon: BedDouble },
  { label: "Event Tickets", href: "/partner/event-tickets", icon: Ticket },
  { label: "Products & Stock", href: "/partner/products", icon: Package },
  { label: "Vehicle Fleet", href: "/partner/vehicles", icon: Car },
  { label: "Guide Profile", href: "/partner/guide", icon: UserCheck },
  { label: "Earnings", href: "/partner/earnings", icon: WalletCards },
  { label: "Analytics", href: "/partner/analytics", icon: ChartNoAxesCombined },
  { label: "Reviews", href: "/partner/reviews", icon: Star },
  { label: "Messages", href: "/partner/messages", icon: MessageSquare },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Profile", href: "/profile", icon: UserCircle },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function PartnerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const { user, partner, logout } = useAuth();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError("");
    try {
      await logout();
    } catch {
      setLogoutError("Could not sign out. Check your connection and try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (pathname === "/partner/onboarding") {
    return (
      <RoleGuard allowedRoles={["PARTNER"]}>
        {children}
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["PARTNER"]} requireVerifiedPartner>
      <div className="min-h-screen bg-[#f5fbf7] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          aria-label="Close partner navigation"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          type="button"
        />
      )}

      {/* Sidebar */}
      <aside
        aria-label="Partner dashboard navigation"
        id="partner-dashboard-navigation"
        className={`fixed left-0 top-0 z-50 h-screen w-72 overflow-y-auto bg-[#145A32] p-5 text-white transition-transform duration-300 lg:sticky lg:translate-x-0 ${
          sidebarOpen ? "visible translate-x-0" : "invisible -translate-x-full lg:visible"
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <Link className="flex items-center gap-2 text-2xl font-black" href="/">
            <span className="w-3 h-3 rounded-full bg-[#2ECC71]" />
            Tembea
          </Link>
          <button
            aria-label="Close partner navigation"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl hover:bg-white/10"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* LIST YOUR ITEM Button */}
        <Link
          href="/partner/listings?mode=create"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center justify-center gap-2 w-full py-3.5 mb-6 rounded-2xl bg-gradient-to-r from-[#2ECC71] to-[#27AE60] text-[#145A32] font-black text-base hover:shadow-lg hover:scale-[1.02] transition-all"
        >
          <Plus size={20} strokeWidth={3} />
          LIST YOUR ITEM
        </Link>

        <nav className="grid gap-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/partner" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${
                  isActive
                    ? "bg-[#2ECC71] text-[#145A32]"
                    : "text-white/78 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 rounded-xl border border-white/15 bg-white/10 p-4">
          <p className="truncate font-black">
            {partner?.businessName || user?.name}
          </p>
          <p className="mt-1 truncate text-xs font-semibold text-white/70">
            {user?.email}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-black uppercase">
            <span className="rounded-full bg-[#2ECC71]/20 px-2.5 py-1 text-[#2ECC71]">
              {partner?.status ?? "PENDING"}
            </span>
            {partner?.category && (
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-white/80">
                {partner.category.replaceAll("_", " ")}
              </span>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-bold text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut size={18} />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
        {logoutError && (
          <p className="mt-2 text-xs font-semibold text-red-200" role="alert">
            {logoutError}
          </p>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex items-center gap-3 bg-[#f5fbf7] p-4 border-b border-[#D5F5E3] lg:hidden">
          <button
            aria-controls="partner-dashboard-navigation"
            aria-expanded={sidebarOpen}
            aria-label="Open partner navigation"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-[#D5F5E3]"
            type="button"
          >
            <Menu size={20} className="text-[#145A32]" />
          </button>
          <Link className="flex items-center gap-2 text-xl font-black text-[#145A32]" href="/">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2ECC71]" />
            Tembea
          </Link>
          <div className="ml-auto">
            <Link
              href="/partner/listings?mode=create"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#145A32] text-white font-bold text-xs"
            >
              <Plus size={14} />
              List Item
            </Link>
          </div>
        </div>

        {children}
      </div>
      </div>
    </RoleGuard>
  );
}
