import { Redirect } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Wraps a route that requires authentication.
 * Unauthenticated users are redirected to /login.
 * Shows nothing while auth state is resolving.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Avoid a flash of redirect before the session check resolves
    return null;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}
