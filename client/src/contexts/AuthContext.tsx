import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import type { AuthUser } from "@/types/auth";

export type { AuthUser };

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

const ME_KEY = ["/v1/auth/whoami"] as const;

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();

  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ME_KEY,
    queryFn: async () => {
      try {
        const res = await authService.whoami();
        return res.data;
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
    try {
      await authService.logout();
    } catch {
      // best-effort — clear local state regardless
    }
    qc.setQueryData(ME_KEY, null);
    qc.clear();
  }, [qc]);

  // Listen for the 401-interceptor event so the context clears even when
  // the failed request wasn't initiated through a React hook.
  useEffect(() => {
    const handler = () => {
      qc.setQueryData(ME_KEY, null);
      qc.clear();
    };
    window.addEventListener("ark:session-expired", handler);
    return () => window.removeEventListener("ark:session-expired", handler);
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
