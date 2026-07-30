import type { UserRole } from "@/types/auth.types";

export function canAccessDashboard(role: UserRole, dashboard: UserRole) {
  return role === "admin" || role === dashboard;
}
