"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Ticket,
  ShoppingBag,
  Heart,
  BookOpen,
  Bell,
  UserCircle,
  Settings,
  Menu,
  X,
  Search,
  MessageSquare,
  Star,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { RoleGuard } from "@/components/auth/RoleGuard";

const sidebarItems = [
  { label: "Overview", href: "/client", icon: LayoutDashboard },
  { label: "My Bookings", href: "/client/bookings", icon: CalendarCheck },
  { label: "Reservations", href: "/client/reservations", icon: BookOpen },
  { label: "Tickets", href: "/client/tickets", icon: Ticket },
  { label: "Orders", href: "/client/orders", icon: ShoppingBag },
  { label: "Wishlist", href: "/client/wishlist", icon: Heart },
  { label: "Messages", href: "/client/messages", icon: MessageSquare },
  { label: "Reviews", href: "/client/reviews", icon: Star },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Profile", href: "/profile", icon: UserCircle },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function ClientLayout({ children }: { children: ReactNode }) {
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
    <RoleGuard allowedRoles={["CLIENT"]}>
      <div className="min-h-screen bg-[#f5fbf7] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          aria-label="Close dashboard navigation"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          type="button"
        />
      )}

      {/* Sidebar */}
      <aside
        aria-label="Client dashboard navigation"
        id="client-dashboard-navigation"
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
            aria-label="Close dashboard navigation"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl hover:bg-white/10"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="grid gap-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/client" && pathname.startsWith(item.href));
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
          <p className="truncate font-black">{user?.name}</p>
          <p className="mt-1 truncate text-xs font-semibold text-white/70">
            {user?.email}
          </p>
          <Link
            className="mt-4 flex items-center gap-2 text-sm font-bold text-[#2ECC71] hover:text-white"
            href="/profile"
            onClick={() => setSidebarOpen(false)}
          >
            <UserCircle size={17} aria-hidden />
            Manage profile
          </Link>
          <button
            className="mt-3 flex w-full items-center gap-2 text-sm font-bold text-white/80 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoggingOut}
            onClick={handleLogout}
            type="button"
          >
            <LogOut size={17} aria-hidden />
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </button>
          {logoutError && (
            <p className="mt-2 text-xs font-semibold text-red-200" role="alert">
              {logoutError}
            </p>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex items-center gap-3 bg-[#f5fbf7] p-4 border-b border-[#D5F5E3] lg:hidden">
          <button
            aria-controls="client-dashboard-navigation"
            aria-expanded={sidebarOpen}
            aria-label="Open dashboard navigation"
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
          <div className="ml-auto flex items-center gap-2">
            <Link
              aria-label="Search Tembea"
              href="/search"
              className="p-2 rounded-xl hover:bg-[#D5F5E3]"
            >
              <Search size={18} className="text-[#145A32]" />
            </Link>
          </div>
        </div>

        {children}
      </div>
      </div>
    </RoleGuard>
  );
}
