import { useQuery } from "@tanstack/react-query";
import { Users, Repeat, Gift, Flag, Sparkles } from "lucide-react";
import { usersService } from "@/services/users.service";
import { subscriptionsService } from "@/services/subscriptions.service";
import { f1000Service } from "@/services/f1000.service";
import { aiService } from "@/services/ai.service";
import { featureFlagsService } from "@/services/feature-flags.service";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const users = useQuery({
    queryKey: ["admin", "users", "count"],
    queryFn: async () => (await usersService.list({ pageSize: 1 })).data,
  });

  const subscriptions = useQuery({
    queryKey: ["admin", "subscriptions", "active"],
    queryFn: async () => (await subscriptionsService.list({ status: "active", pageSize: 1 })).data,
  });

  const f1000 = useQuery({
    queryKey: ["admin", "f1000", "stats"],
    queryFn: async () => (await f1000Service.getStats()).data,
  });

  const flags = useQuery({
    queryKey: ["admin", "feature-flags"],
    queryFn: async () => (await featureFlagsService.getAll()).data,
  });

  const ai = useQuery({
    queryKey: ["admin", "ai", "status"],
    queryFn: async () => (await aiService.getStatus()).data,
  });

  const enabledCount = flags.data ? Object.values(flags.data).filter(Boolean).length : 0;
  const totalFlags = flags.data ? Object.keys(flags.data).length : 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Command Center</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          Platform health, user base, and operational controls.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total users"
          value={users.data?.total.toLocaleString()}
          icon={Users}
          isLoading={users.isLoading}
          subtext={users.error ? "Unavailable" : undefined}
        />
        <StatCard
          label="Active subscriptions"
          value={subscriptions.data?.total.toLocaleString()}
          icon={Repeat}
          isLoading={subscriptions.isLoading}
          subtext={subscriptions.error ? "Unavailable" : undefined}
        />
        <StatCard
          label="F1000 remaining"
          value={f1000.data ? f1000.data.remaining.toLocaleString() : "—"}
          subtext={
            f1000.data
              ? `${f1000.data.claimed ?? 0} of ${f1000.data.total ?? 0} claimed`
              : f1000.error
                ? "Unavailable"
                : undefined
          }
          icon={Gift}
          isLoading={f1000.isLoading}
        />
        <StatCard
          label="Feature flags on"
          value={flags.data ? `${enabledCount} / ${totalFlags}` : "—"}
          subtext={flags.error ? "Unavailable" : undefined}
          icon={Flag}
          isLoading={flags.isLoading}
        />
      </div>

      <Card className="glass-card border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            AI budget
          </CardTitle>
          <Sparkles className="h-4 w-4 text-primary/70" />
        </CardHeader>
        <CardContent>
          {ai.isLoading ? (
            <Skeleton className="h-8 w-48" />
          ) : ai.error ? (
            <p className="text-sm text-muted-foreground font-mono">AI budget unavailable.</p>
          ) : ai.data ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-8">
                <div>
                  <p className="text-[10px] uppercase font-mono text-muted-foreground">Usage</p>
                  <p className="text-lg font-bold text-white">${(ai.data.usage.costCents / 100).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono text-muted-foreground">Remaining</p>
                  <p className="text-lg font-bold text-white">${(ai.data.remaining.costCents / 100).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono text-muted-foreground">Guardrail</p>
                  <p className="text-lg font-bold text-white">{ai.data.guardrailActive ? "Active" : "Off"}</p>
                </div>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, ai.data.ratioPct)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                {ai.data.ratioPct.toFixed(1)}% of monthly cap used
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
