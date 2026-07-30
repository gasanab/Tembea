"use client";

import { createContext, useContext, useState, useCallback, type ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi, usersApi } from "@/lib/api-client";
import type { PartnerSummary, User } from "@/types/api.types";

type AuthContextType = {
  user: User | null;
  partner: PartnerSummary | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role: "CLIENT" | "PARTNER") => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [partner, setPartner] = useState<PartnerSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const data = await usersApi.getMe();
      setUser(data);
      setPartner(data.role === "PARTNER" ? data.partner ?? null : null);
    } catch (error) {
      // User is not authenticated
      setUser(null);
      setPartner(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const data = await authApi.login({ email, password });
      const profile = await usersApi.getMe().catch(() => data.user as User);
      setUser(profile);
      setPartner(
        profile.role === "PARTNER"
          ? ("partner" in profile ? profile.partner ?? data.partner ?? null : data.partner ?? null)
          : null,
      );
      return profile;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, role: "CLIENT" | "PARTNER"): Promise<User> => {
      setIsLoading(true);
      try {
        const data = await authApi.register({ name, email, password, role });
        const profile = await usersApi.getMe().catch(() => data.user as User);
        setUser(profile);
        setPartner(
          profile.role === "PARTNER"
            ? ("partner" in profile ? profile.partner ?? data.partner ?? null : data.partner ?? null)
            : null,
        );
        return profile;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    setPartner(null);
    router.replace("/");
    router.refresh();
  }, [router]);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : prev));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        partner,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
