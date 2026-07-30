import { RoleGuard } from "@/components/auth/RoleGuard";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["ADMIN"]}>{children}</RoleGuard>;
}
