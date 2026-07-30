"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useThemeContext } from "@/context/ThemeContext";

const mainNavigation = [
  { name: "Home", href: "/" },
  { name: "Hotels", href: "/hotels" },
  { name: "Restaurants", href: "/restaurants" },
  { name: "Events", href: "/events" },
];

const moreNavigation = [
  { name: "Explore", href: "/explore" },
  { name: "Apartments", href: "/apartments" },
  { name: "Experiences", href: "/experiences" },
  { name: "Transport", href: "/transport" },
  { name: "Tour Guides", href: "/tour-guides" },
  { name: "Made in Rwanda", href: "/made-in-rwanda" },
  { name: "Why Rwanda?", href: "/why-rwanda" },
];

const activeLink = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { theme, setTheme } = useThemeContext();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
    setUserOpen(false);
  }, [pathname]);

  const dashboardHref =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "PARTNER"
        ? "/partner"
        : "/client";

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <nav
      className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm transition-colors dark:border-gray-800 dark:bg-gray-900"
      aria-label="Primary navigation"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex-shrink-0 text-2xl font-black text-emerald-800 dark:text-emerald-400"
            aria-label="Tembea home"
          >
            Tembea
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {mainNavigation.map((item) => {
              const active = activeLink(pathname, item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
                    active
                      ? "bg-emerald-50 text-emerald-800 dark:bg-gray-800 dark:text-emerald-400"
                      : "text-gray-700 hover:bg-gray-50 hover:text-emerald-800 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-emerald-400"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}

            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen((open) => !open)}
                aria-expanded={moreOpen}
                aria-controls="desktop-more-menu"
                className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
                  moreNavigation.some((item) =>
                    activeLink(pathname, item.href),
                  )
                    ? "bg-emerald-50 text-emerald-800 dark:bg-gray-800 dark:text-emerald-400"
                    : "text-gray-700 hover:bg-gray-50 hover:text-emerald-800 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-emerald-400"
                }`}
              >
                More
                <ChevronDown
                  aria-hidden="true"
                  size={16}
                  className={`transition-transform ${moreOpen ? "rotate-180" : ""}`}
                />
              </button>

              {moreOpen ? (
                <div
                  id="desktop-more-menu"
                  className="absolute left-0 top-full z-50 mt-2 w-52 rounded-xl border border-gray-200 bg-white py-2 shadow-xl dark:border-gray-700 dark:bg-gray-800"
                >
                  {moreNavigation.map((item) => {
                    const active = activeLink(pathname, item.href);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`block px-4 py-2 text-sm font-semibold ${
                          active
                            ? "bg-emerald-50 text-emerald-800 dark:bg-gray-700 dark:text-emerald-400"
                            : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                        }`}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label={
                theme === "dark" ? "Use light theme" : "Use dark theme"
              }
            >
              {theme === "dark" ? (
                <Sun aria-hidden="true" size={20} />
              ) : (
                <Moon aria-hidden="true" size={20} />
              )}
            </button>

            {!isLoading && isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserOpen((open) => !open)}
                  aria-expanded={userOpen}
                  aria-controls="user-account-menu"
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-emerald-800 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-emerald-400"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-800 text-sm font-black text-white"
                  >
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                  <span className="hidden max-w-32 truncate lg:block">
                    {user.name}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    size={16}
                    className={`transition-transform ${userOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {userOpen ? (
                  <div
                    id="user-account-menu"
                    className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white py-2 shadow-xl dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                      <p className="truncate text-sm font-black text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href={dashboardHref}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <LayoutDashboard aria-hidden="true" size={16} />
                      Dashboard
                    </Link>
                    {user.role === "CLIENT" ? (
                      <Link
                        href="/wishlist"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <Heart aria-hidden="true" size={16} />
                        Wishlist
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      onClick={async () => {
                        setUserOpen(false);
                        await logout();
                      }}
                      className="flex w-full items-center gap-2 border-t border-gray-100 px-4 py-2 text-left text-sm font-semibold text-red-700 hover:bg-red-50 dark:border-gray-700 dark:text-red-400 dark:hover:bg-gray-700"
                    >
                      <LogOut aria-hidden="true" size={16} />
                      Log out
                    </button>
                  </div>
                ) : null}
              </div>
            ) : !isLoading ? (
              <>
                <Link
                  href="/sign-in"
                  className="rounded-lg px-4 py-2 text-sm font-bold text-emerald-800 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-gray-800"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-900"
                >
                  Create account
                </Link>
              </>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 md:hidden"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            {mobileOpen ? (
              <X aria-hidden="true" size={24} />
            ) : (
              <Menu aria-hidden="true" size={24} />
            )}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div
          id="mobile-navigation"
          className="border-t border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-900 md:hidden"
        >
          <div className="space-y-1">
            {[...mainNavigation, ...moreNavigation].map((item) => {
              const active = activeLink(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-lg px-3 py-2 text-base font-semibold ${
                    active
                      ? "bg-emerald-50 text-emerald-800 dark:bg-gray-800 dark:text-emerald-400"
                      : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-base font-semibold text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {theme === "dark" ? (
                <Sun aria-hidden="true" size={18} />
              ) : (
                <Moon aria-hidden="true" size={18} />
              )}
              {theme === "dark" ? "Use light theme" : "Use dark theme"}
            </button>

            {!isLoading && isAuthenticated && user ? (
              <>
                <div className="px-3 py-2">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {user.email}
                  </p>
                </div>
                <Link
                  href={dashboardHref}
                  className="block rounded-lg px-3 py-2 font-semibold text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    setMobileOpen(false);
                    await logout();
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left font-semibold text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-800"
                >
                  Log out
                </button>
              </>
            ) : !isLoading ? (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/sign-in"
                  className="rounded-lg border border-emerald-800 px-3 py-2 text-center font-bold text-emerald-800 dark:border-emerald-400 dark:text-emerald-400"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-lg bg-emerald-800 px-3 py-2 text-center font-bold text-white"
                >
                  Create account
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </nav>
  );
}
