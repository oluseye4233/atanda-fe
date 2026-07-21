import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CreditCard, ShieldCheck, GraduationCap } from "lucide-react";
import { subscriptionsService } from "@/services/subscriptions.service";
import { plansService } from "@/services/plans.service";
import { isNotFound } from "@/lib/apiError";
import type { AuthUser } from "@/types/auth";
import type { Plan } from "@/types/plans";
import type { Subscription } from "@/types/subscriptions";

interface SubscriptionTabProps {
  user: Pick<AuthUser, 'subscriptionPlan' | 'contextCraftCertLevel' | 'institution'>;
}

export function SubscriptionTab({ user }: SubscriptionTabProps) {
  const { data: subscription } = useQuery<Subscription | null>({
    queryKey: ["/subscriptions/me"],
    queryFn: async () => {
      try {
        const res = await subscriptionsService.getMine();
        return res.data;
      } catch (err) {
        if (isNotFound(err)) return null;
        throw err;
      }
    },
    staleTime: 1000 * 60,
    retry: false,
  });

  const { data: plans } = useQuery<Plan[]>({
    queryKey: ["/v1/plans/public"],
    queryFn: () => plansService.getPublic().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

  const subPlanId = subscription?.planId ?? null;
  const matchedPlan = plans?.find((p) => p.id === subPlanId) ?? null;
  const isFree = !matchedPlan || matchedPlan.monthlyPrice === "0.00";

  return (
    <div className="space-y-6">
      <Link to="/subscription" className="block" data-testid="link-profile-subscription">
        <div className="glass-card p-6 rounded-xl hover:border-primary/30 transition-all hover:scale-[1.02] cursor-pointer border border-transparent">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 border-2 border-primary/30">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Current Plan</p>
              <h3 className="font-display font-bold text-xl text-white">{matchedPlan?.title ?? "Individual Free"}</h3>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                {isFree ? "Free" : `$${Number(matchedPlan!.monthlyPrice).toFixed(2)}/month`}
              </p>
            </div>
            <div className="px-3 py-1.5 rounded text-[10px] font-mono font-bold uppercase bg-primary/10 border border-primary/30 text-primary">
              ACTIVE
            </div>
          </div>
        </div>
      </Link>

      <div className="glass-card p-5 rounded-xl border border-transparent" data-testid="card-profile-cert-static">
        <div className="flex items-center gap-3 mb-3">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Context Craft</span>
        </div>
        <p className="font-display font-bold text-lg text-white">{user.contextCraftCertLevel || "NONE"}</p>
      </div>

      {user.institution && (
        <div className="glass-card p-5 rounded-xl border border-transparent">
          <div className="flex items-center gap-3 mb-3">
            <GraduationCap className="h-5 w-5 text-purple-400" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Institution</span>
          </div>
          <p className="font-display font-bold text-lg text-white">{user.institution}</p>
        </div>
      )}
    </div>
  );
}