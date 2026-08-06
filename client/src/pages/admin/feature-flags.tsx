import { useQuery } from "@tanstack/react-query";
import { Flag } from "lucide-react";
import { featureFlagsService } from "@/services/feature-flags.service";
import { ErrorAlert } from "@/components/admin/ErrorAlert";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminFeatureFlags() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "feature-flags"],
    queryFn: async () => (await featureFlagsService.getAll()).data,
  });

  const entries = data ? Object.entries(data) : [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Feature Flags</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          Live feature states across the platform.
        </p>
      </header>

      <ErrorAlert message={error ? String(error) : undefined} />

      <Card className="glass-card border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Flag states
          </CardTitle>
          <Flag className="h-4 w-4 text-primary/70" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : entries.length === 0 ? (
            <p className="text-sm text-muted-foreground font-mono">No flags available.</p>
          ) : (
            <div className="divide-y divide-white/5">
              {entries.map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-3">
                  <span className="font-mono text-sm text-white">{key}</span>
                  <StatusBadge status={value ? "active" : "inactive"} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
