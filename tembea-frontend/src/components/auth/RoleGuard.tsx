"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Clock3, Loader2, LogOut, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { PartnerStatus, UserRole } from "@/types/api.types";

const roleHome: Record<UserRole, string> = {
  CLIENT: "/client",
  PARTNER: "/partner",
  ADMIN: "/admin",
};

type RoleGuardProps = {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requireVerifiedPartner?: boolean;
};

function PartnerAccessState({
  status,
  businessName,
}: {
  status: PartnerStatus;
  businessName?: string;
}) {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const suspended = status === "SUSPENDED";
  const Icon = suspended ? ShieldAlert : Clock3;

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
    <main className="min-h-screen bg-[#f5fbf7] px-4 py-16">
      <section
        className="mx-auto max-w-xl rounded-2xl border border-[#D5F5E3] bg-white p-8 text-center shadow-sm"
        aria-live="polite"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D5F5E3] text-[#145A32]">
          <Icon size={27} aria-hidden />
        </span>
        <p className="mt-5 text-xs font-black uppercase tracking-wider text-[#145A32]">
          Partner account
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#111827]">
          {suspended ? "Dashboard access is suspended" : "Verification is in progress"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#6B7280]">
          {suspended
            ? `${businessName || "This business"} cannot use partner tools while the account is suspended. Contact Tembea support if you believe this is an error.`
            : `${businessName || "Your business"} can use partner tools after Tembea completes the account review.`}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            className="btn-base btn-dark"
            href={suspended ? "/profile" : "/partner/onboarding"}
          >
            {suspended ? "Review account profile" : "Complete application"}
          </Link>
          {!suspended && (
            <Link className="btn-base btn-ghost" href="/profile">
              Review account profile
            </Link>
          )}
          <button
            className="btn-base btn-ghost"
            disabled={isLoggingOut}
            onClick={handleLogout}
            type="button"
          >
            <LogOut size={17} aria-hidden />
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
        {logoutError && (
          <p className="mt-3 text-sm font-bold text-red-700" role="alert">
            {logoutError}
          </p>
        )}
      </section>
    </main>
  );
}

export function RoleGuard({
  children,
  allowedRoles,
  requireVerifiedPartner = false,
}: RoleGuardProps) {
  const { user, partner, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const roleAllowed = Boolean(
    user && (!allowedRoles || allowedRoles.includes(user.role)),
  );

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      const params = new URLSearchParams({ from: pathname });
      router.replace(`/sign-in?${params.toString()}`);
      return;
    }

    if (user && !roleAllowed) {
      router.replace(roleHome[user.role]);
    }
  }, [isAuthenticated, isLoading, pathname, roleAllowed, router, user]);

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-[#f5fbf7]"
        role="status"
      >
        <Loader2 className="h-8 w-8 animate-spin text-[#145A32]" aria-hidden />
        <span className="sr-only">Checking account access</span>
      </div>
    );
  }

  if (!isAuthenticated || !user || !roleAllowed) return null;

  if (
    requireVerifiedPartner &&
    user.role === "PARTNER" &&
    partner?.status !== "VERIFIED"
  ) {
    return (
      <PartnerAccessState
        businessName={partner?.businessName}
        status={partner?.status ?? "PENDING"}
      />
    );
  }

  return <>{children}</>;
}
