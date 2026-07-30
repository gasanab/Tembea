"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  WalletCards,
  ShoppingBag,
  Ticket,
  Sparkles,
  Car,
  Compass,
  ShieldCheck,
  ChartNoAxesCombined,
  Bell,
  Settings,
  Menu,
  X,
  FileText,
  LogOut,
  UserCircle,
} from "lucide-react";
import { useState } from "react";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { useAuth } from "@/context/AuthContext";

const sidebarItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Partners", href: "/admin/partners", icon: Building2 },
  { label: "Listings", href: "/admin/listings", icon: FileText },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
  { label: "Transactions", href: "/admin/transactions", icon: WalletCards },
  { label: "Marketplace", href: "/admin/marketplace", icon: ShoppingBag },
  { label: "Events", href: "/admin/events", icon: Ticket },
  { label: "Experiences", href: "/admin/experiences", icon: Sparkles },
  { label: "Transport", href: "/admin/transport", icon: Car },
  { label: "Tour Guides", href: "/admin/tour-guides", icon: Compass },
  { label: "Verification", href: "/admin/verification", icon: ShieldCheck },
  { label: "Analytics", href: "/admin/analytics", icon: ChartNoAxesCombined },
  { label: "Reports", href: "/admin/reports", icon: FileText },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Profile", href: "/profile", icon: UserCircle },
  { label: "Account Settings", href: "/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const { user, logout } = useAuth();

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

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#f5fbf7] flex">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <button
            aria-label="Close admin navigation"
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            type="button"
          />
        )}

        {/* Sidebar */}
        <aside
          aria-label="Admin dashboard navigation"
          id="admin-dashboard-navigation"
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
              aria-label="Close admin navigation"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-xl hover:bg-white/10"
              type="button"
            >
              <X size={20} />
            </button>
          </div>

          {/* Admin Badge */}
          <div className="flex items-center gap-2 mb-6 px-3 py-2.5 rounded-xl bg-[#2ECC71]/20 border border-[#2ECC71]/30">
            <ShieldCheck size={18} className="text-[#2ECC71]" />
            <span className="text-sm font-black text-[#2ECC71]">Admin Console</span>
          </div>

          <nav className="grid gap-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
                    isActive
                      ? "bg-[#2ECC71] text-[#145A32]"
                      : "text-white/78 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-xl border border-white/15 bg-white/10 p-4">
            <p className="truncate font-black">{user?.name}</p>
            <p className="mt-1 truncate text-xs font-semibold text-white/70">
              {user?.email}
            </p>
            <p className="mt-3 text-xs font-black uppercase tracking-wide text-[#2ECC71]">
              Administrator
            </p>
          </div>
          <button
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300 transition-colors hover:bg-red-500/20 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoggingOut}
            onClick={handleLogout}
            type="button"
          >
            <LogOut size={18} aria-hidden />
            {isLoggingOut ? "Signing out..." : "Sign out"}
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
              aria-controls="admin-dashboard-navigation"
              aria-expanded={sidebarOpen}
              aria-label="Open admin navigation"
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
            <div className="ml-auto flex items-center gap-1">
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#D5F5E3] text-xs font-bold text-[#145A32]">
                <ShieldCheck size={12} aria-hidden />
                Admin
              </span>
            </div>
          </div>

          {children}
        </div>
      </div>
    </AdminGuard>
  );
}
