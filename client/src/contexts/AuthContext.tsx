import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { subscriptionsService } from "@/services/subscriptions.service";
import { isNotFound } from "@/lib/apiError";
import type { AuthUser } from "@/types/auth";
import type { Subscription } from "@/types/subscriptions";

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

const ME_KEY = ["/auth/whoami"] as const;
const SUBSCRIPTION_KEY = ["/subscriptions/me"] as const;

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery<AuthUser | null>({
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

  // Fetch subscription data when user is authenticated
  const { data: subscription, isLoading: subLoading } = useQuery<Subscription | null>({
    queryKey: SUBSCRIPTION_KEY,
    queryFn: async () => {
      try {
        const res = await subscriptionsService.getMine();
        return res.data;
      } catch (err) {
        // 404 means no subscription exists — this is valid, not an error
        if (isNotFound(err)) return null;
        throw err;
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60,
    retry: false,
  });

  const isLoading = userLoading || (user ? subLoading : false);

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
    qc.setQueryData(SUBSCRIPTION_KEY, null);
    qc.removeQueries({ predicate: (q) => q.queryKey[0] !== ME_KEY[0] && q.queryKey[0] !== SUBSCRIPTION_KEY[0] });
  }, [qc]);

  // Listen for the 401-interceptor event so the context clears even when
  // the failed request wasn't initiated through a React hook. Only the
  // cached user is cleared here — NOT the whole query client. Clearing
  // everything would force every mounted query (including this provider's
  // own `whoami` query) to refetch immediately, and since the session is
  // genuinely dead that refetch just 401s again, creating an infinite loop.
  useEffect(() => {
    const handler = () => {
      qc.setQueryData(ME_KEY, null);
      qc.setQueryData(SUBSCRIPTION_KEY, null);
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

  // Merge subscription data into user object for convenience
  const userWithSubscription = user
    ? {
        ...user,
        subscriptionPlan: user.planId ?? subscription?.planId ?? null,
        subscriptionStatus: user.subscriptionStatus ?? subscription?.status ?? null,
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        user: userWithSubscription,
        isLoading,
        isAuthenticated: Boolean(user),
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}