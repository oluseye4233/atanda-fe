import {
  createContext,
  useContext,
  useCallback,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role?: string | null;
  department?: string | null;
  seniority?: string | null;
  location?: string | null;
  contextCraftCertLevel?: string | null;
  subscriptionPlan?: string | null;
  subscriptionStatus?: string | null;
  institution?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userData: AuthUser) => void;
  logout: () => Promise<void>;
  updateUser: (updatedData: Partial<AuthUser>) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

const ME_KEY = ["/api/auth/me"] as const;

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();

  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ME_KEY,
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.status === 401 || res.status === 404) return null;
        if (!res.ok) return null;
        return res.json() as Promise<AuthUser>;
      } catch {
        return null;
      }
    },
    staleTime: 1000 * 60,
    retry: false,
  });

  const login = useCallback(
    (userData: AuthUser) => {
      qc.setQueryData(ME_KEY, userData);
    },
    [qc],
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    qc.setQueryData(ME_KEY, null);
    qc.clear();
  }, [qc]);

  const updateUser = useCallback(
    (updatedData: Partial<AuthUser>) => {
      const current = qc.getQueryData<AuthUser | null>(ME_KEY);
      if (current) qc.setQueryData(ME_KEY, { ...current, ...updatedData });
    },
    [qc],
  );

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
