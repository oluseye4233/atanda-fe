import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, RefreshCw } from "lucide-react";
import { isAxiosError } from "axios";
import { plansService } from "@/services/plans.service";
import type { Plan } from "@/types/plans";
import { getApiErrorMessage } from "@/lib/apiError";
import { RULE_FIELDS } from "@/pages/admin/plans";
import { ErrorAlert } from "@/components/admin/ErrorAlert";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

export default function AdminPlanDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncHidden, setSyncHidden] = useState(false);

  const planQuery = useQuery({
    queryKey: ["admin", "plans", id],
    queryFn: async () => (await plansService.get(id)).data,
    enabled: !!id,
  });

  const plan = planQuery.data;

  const needsSync = !!plan && (!plan.stripeMonthlyId || !plan.stripeYearlyId);

  const runSync = async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const { data: synced } = await plansService.syncStripe(id);
      qc.setQueryData<Plan>(["admin", "plans", id], synced);
      qc.invalidateQueries({ queryKey: ["admin", "plans"] });
      toast({ title: "Stripe synced", description: synced.title });
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 403) {
        setSyncHidden(true);
        return;
      }
      if (isAxiosError(err) && err.response?.status === 404) {
        toast({
          title: "Plan not found",
          description: "The plan was deleted; returning to the list.",
          variant: "destructive",
        });
        qc.invalidateQueries({ queryKey: ["admin", "plans"] });
        navigate("/plans");
        return;
      }
      const message = getApiErrorMessage(err, "Stripe sync failed.");
      setSyncError(
        message.startsWith("Stripe sync failed") ? message : `Stripe sync failed: ${message}`,
      );
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" aria-label="Back to plans">
            <Link to="/plans">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{plan?.title ?? "Plan"}</h1>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              {plan?.description || "—"}
            </p>
          </div>
        </div>
        {plan && (
          <StatusBadge status={plan.freeTrial ? "active" : "inactive"} />
        )}
      </header>

      <ErrorAlert message={planQuery.error ? String(planQuery.error) : undefined} />

      {plan && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-card border-primary/20">
              <CardContent className="pt-6">
                <p className="text-[10px] uppercase font-mono text-muted-foreground">Monthly</p>
                <p className="text-lg font-bold text-white">${plan.monthlyPrice}</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-primary/20">
              <CardContent className="pt-6">
                <p className="text-[10px] uppercase font-mono text-muted-foreground">Yearly</p>
                <p className="text-lg font-bold text-white">${plan.yearlyPrice}</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-primary/20">
              <CardContent className="pt-6">
                <p className="text-[10px] uppercase font-mono text-muted-foreground">Trial</p>
                <div className="mt-1">
                  <StatusBadge status={plan.freeTrial ? "active" : "inactive"} />
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-primary/20">
              <CardContent className="pt-6">
                <p className="text-[10px] uppercase font-mono text-muted-foreground">Resume uploads</p>
                <p className="text-lg font-bold text-white">
                  {plan.planRule.resumeUploads === "unlimited"
                    ? "Unlimited"
                    : plan.planRule.resumeUploads}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Stripe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-mono text-muted-foreground">
                    Monthly ID
                  </p>
                  <p className="font-mono text-xs text-white break-all">
                    {plan.stripeMonthlyId ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono text-muted-foreground">
                    Yearly ID
                  </p>
                  <p className="font-mono text-xs text-white break-all">
                    {plan.stripeYearlyId ?? "—"}
                  </p>
                </div>
              </div>

              {syncError && <p className="text-sm text-destructive">{syncError}</p>}

              {!syncHidden && needsSync && (
                <Button onClick={runSync} disabled={isSyncing} className="gap-2">
                  <RefreshCw className={isSyncing ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                  {syncError ? "Retry" : "Sync with Stripe"}
                </Button>
              )}

              {!syncHidden && !needsSync && (
                <span className="inline-flex items-center gap-1 text-sm font-mono text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Synced
                </span>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Entitlements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {RULE_FIELDS.map((field) => (
                  <div key={field.key} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground">{field.label}</span>
                    <StatusBadge status={Boolean(plan.planRule[field.key])} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              {plan.features.length === 0 ? (
                <p className="text-sm text-muted-foreground font-mono">No features.</p>
              ) : (
                <ul className="list-disc pl-5 space-y-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="text-sm text-white">
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
