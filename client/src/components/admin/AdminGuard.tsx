import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { ShieldAlert, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Guards admin routes to authenticated users with admin or staff role.
 * Unauthenticated users are sent to login; authenticated non-admins see
 * a clear access-denied screen instead of looping back to the admin dashboard.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-mono text-sm text-muted-foreground">Verifying clearance…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin" && user.role !== "staff") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-xl font-bold text-white mb-2">Command Center access required</h1>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          Your account does not have admin or staff clearance. If you believe this is a mistake, contact the platform team.
        </p>
        <Button variant="outline" onClick={logout} className="gap-2">
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
