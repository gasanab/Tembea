import type { UserRole } from "@/types/api.types";

export const ROLE_HOME: Record<UserRole, string> = {
  CLIENT: "/client",
  PARTNER: "/partner",
  ADMIN: "/admin",
};

const accountRoutes = [
  "/profile",
  "/settings",
  "/notifications",
  "/wishlist",
  "/payment",
];

function matchesPath(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function canRoleAccessPath(role: UserRole, pathname: string) {
  if (accountRoutes.some((route) => matchesPath(pathname, route))) return true;
  return matchesPath(pathname, ROLE_HOME[role]);
}

export function getPostLoginDestination(
  role: UserRole,
  requested: string | null | undefined,
) {
  if (
    !requested ||
    !requested.startsWith("/") ||
    requested.startsWith("//") ||
    requested.includes("\\")
  ) {
    return ROLE_HOME[role];
  }

  return canRoleAccessPath(role, requested) ? requested : ROLE_HOME[role];
}
