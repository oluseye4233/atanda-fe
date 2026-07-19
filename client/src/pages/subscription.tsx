import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/useAuth";
import { getApiErrorMessage } from "@/lib/apiError";
import { subscriptionsService } from "@/services/subscriptions.service";
import { plansService } from "@/services/plans.service";
import type { Plan } from "@/types/plans";
import type { CreateSubscriptionBody } from "@/types/subscriptions";
import { Building2, Check, Zap, ArrowRight, CheckCircle2, Shield, AlertTriangle } from "lucide-react";

const DEFAULT_COLOR = "hsl(188 86% 53%)";

export default function SubscriptionPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const plansQuery = useQuery<Plan[]>({
    queryKey: ["/v1/plans/public"],
    queryFn: () => plansService.getPublic().then((res) => res.data),
    staleTime: 1000 * 60 * 5,
  });

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      navigate("/signup");
      return;
    }
    setErrorMsg(null);
    setIsUpdating(true);
    try {
      const idempotencyKey = `sub_${user.id}_${planId}_${Date.now()}`;
      
      const body: CreateSubscriptionBody = {
        planId,
        duration: "monthly",
      };

      const response = await subscriptionsService.create(body, idempotencyKey);
      const data = response.data;

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setErrorMsg("Checkout couldn't be opened. Please try again.");
      }
    } catch (err: unknown) {
      setErrorMsg(getApiErrorMessage(err, "Couldn't start checkout. Please try again."));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!user) return;
    if (!confirm("Cancel your subscription? You'll keep access until the end of the current period.")) return;
    setIsUpdating(true);
    setErrorMsg(null);
    try {
      const subResponse = await subscriptionsService.getMine();
      const subscription = subResponse.data;
      
      if (subscription.id) {
        await subscriptionsService.update(subscription.id, { status: "inactive" });
      }
      updateUser({ subscriptionStatus: "canceling" });
      setErrorMsg("Subscription will be canceled at the end of the current period.");
    } catch (err: unknown) {
      setErrorMsg(getApiErrorMessage(err, "Couldn't cancel the subscription. Please try again."));
    } finally {
      setIsUpdating(false);
    }
  };

  if (plansQuery.isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-white/5 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card rounded-xl p-6 flex flex-col space-y-4">
                <div className="h-10 bg-white/5 rounded" />
                <div className="h-8 bg-white/5 rounded w-3/4" />
                <div className="h-4 bg-white/5 rounded" />
                <div className="h-4 bg-white/5 rounded" />
                <div className="h-4 bg-white/5 rounded" />
                <div className="h-4 bg-white/5 rounded" />
                <div className="h-10 bg-white/5 rounded mt-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (plansQuery.error || !plansQuery.data) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="glass-card p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="font-mono text-sm text-muted-foreground">Unable to load plans. Please try again later.</p>
        </div>
      </div>
    );
  }

  const plans = plansQuery.data;
  const currentPlanId = user?.subscriptionPlan || null;
  const currentPlanData = plans.find((p) => p.id === currentPlanId) || plans[0];
  const isSubscribed = user?.subscriptionPlan && user.subscriptionPlan !== "INDIVIDUAL_FREE";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-primary tracking-widest uppercase" data-testid="text-subscription-title">
          Subscription Plans
        </h1>
        <p className="text-muted-foreground font-mono text-sm mt-2">
          SELECT YOUR ACCESS TIER // Individual & School Plans Available
        </p>
      </div>

      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-4 rounded-xl border border-destructive/30 bg-destructive/5 flex items-center gap-3"
            data-testid="alert-billing-error"
          >
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <span className="font-mono text-sm text-destructive">{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {isSubscribed ? (
        <div className="glass-card p-6 rounded-xl" data-testid="card-current-plan">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${DEFAULT_COLOR}15`, border: `2px solid ${DEFAULT_COLOR}40` }}
            >
              <Building2 className="h-7 w-7" style={{ color: DEFAULT_COLOR }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="font-display font-bold text-xl text-white" data-testid="text-current-plan">
                  {currentPlanData.title}
                </h2>
                <span
                  className="px-2 py-0.5 rounded text-xs font-mono font-bold uppercase"
                  style={{ color: DEFAULT_COLOR, backgroundColor: `${DEFAULT_COLOR}15`, border: `1px solid ${DEFAULT_COLOR}30` }}
                  data-testid="text-subscription-status"
                >
                  {user?.subscriptionStatus === "canceling" ? "CANCELING" : (user?.subscriptionStatus || "ACTIVE").toUpperCase()}
                </span>
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                {currentPlanData.monthlyPrice === "0.00" ? "Free tier" : `$${currentPlanData.monthlyPrice}/month`}
                {user?.institution && (
                  <span className="ml-2 text-primary/70">{user.institution}</span>
                )}
              </p>
            </div>
            {Number(currentPlanData.monthlyPrice) > 0 && user?.subscriptionStatus !== "canceling" && (
              <button
                onClick={handleCancel}
                disabled={isUpdating}
                className="px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wide border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
                data-testid="button-cancel-subscription"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-card p-6 rounded-xl text-center" data-testid="card-no-subscription">
          <Shield className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="font-display font-bold text-xl text-white mb-2">No active subscription</h2>
          <p className="text-muted-foreground text-sm mb-6">
            You&apos;re on the Free tier. Upgrade to unlock full ARK intelligence.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const isFree = plan.monthlyPrice === "0.00";

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`glass-card rounded-xl overflow-hidden flex flex-col relative ${isCurrent ? "ring-2" : ""}`}
              style={isCurrent ? { borderColor: `${DEFAULT_COLOR}50` } : {}}
              data-testid={`card-plan-${plan.id}`}
            >
              {isCurrent && (
                <div className="text-[10px] font-mono uppercase tracking-widest text-center py-1.5 flex items-center justify-center gap-1" style={{ backgroundColor: `${DEFAULT_COLOR}20`, color: DEFAULT_COLOR }}>
                    <Shield className="h-3 w-3" /> Current Plan
                  </div>
              )}

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${DEFAULT_COLOR}15`, border: `1px solid ${DEFAULT_COLOR}30` }}
                  >
                    <Building2 className="h-5 w-5" style={{ color: DEFAULT_COLOR }} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-sm uppercase tracking-wide">{plan.title}</h3>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{plan.freeTrial ? "Free trial available" : "No free trial"}</span>
                  </div>
                </div>

                <div className="mb-6">
                  {isFree ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-display font-black text-white">Free</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-1 flex-wrap">
                        <span className="text-3xl font-display font-black text-white">
                          ${Number(plan.monthlyPrice).toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground font-mono">/month</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-secondary">
                        ${Number(plan.yearlyPrice).toFixed(2)}/year (save ~17%)
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
                  {plan.description}
                </p>

                <div className="space-y-2.5 mb-6">
                  {plan.features.slice(0, 4).map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="h-4 w-4 shrink-0 mt-0.5" style={{ color: DEFAULT_COLOR }} />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {!isCurrent && (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isUpdating}
                    className="w-full py-3 rounded-lg font-mono text-sm uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02]"
                    style={{
                      color: DEFAULT_COLOR,
                      backgroundColor: `${DEFAULT_COLOR}15`,
                      border: `1px solid ${DEFAULT_COLOR}30`,
                    }}
                    data-testid={`button-subscribe-${plan.id}`}
                  >
                    {isUpdating ? (
                      <Zap className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                    {isUpdating ? "Processing..." : "Subscribe"}
                  </button>
                )}

                {isCurrent && (
                  <div
                    className="w-full py-3 rounded-lg font-mono text-sm uppercase tracking-wide flex items-center justify-center gap-2"
                    style={{
                      color: DEFAULT_COLOR,
                      backgroundColor: `${DEFAULT_COLOR}10`,
                      border: `1px solid ${DEFAULT_COLOR}20`,
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Active
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="glass-card p-6 rounded-xl" data-testid="card-plan-comparison">
        <h3 className="font-display font-bold text-lg text-primary uppercase tracking-widest mb-6">
          Feature Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 pr-4 font-mono text-muted-foreground uppercase tracking-wide text-xs">Feature</th>
                {plans.map((plan) => (
                  <th key={plan.id} className="py-3 px-2 text-center">
                    <span className="font-mono text-xs uppercase tracking-wide" style={{ color: DEFAULT_COLOR }}>
                      {plan.title}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "Resume Uploads", values: ["1/month", "Unlimited", "Unlimited", "Unlimited", "Unlimited"] },
                { feature: "JST Score", values: [true, true, true, true, true] },
                { feature: "Full Dashboard", values: [true, true, true, true, true] },
                { feature: "Career Pathways", values: [false, true, true, true, true] },
                { feature: "FORGE Cards", values: [false, true, true, true, true] },
                { feature: "Executive Report", values: [false, true, true, true, true] },
                { feature: "Context Craft", values: [false, true, true, true, true] },
                { feature: "Workforce Intel", values: [false, false, false, false, true] },
                { feature: "Institution Dashboard", values: [false, false, false, true, false] },
                { feature: "Priority Support", values: [false, false, false, false, true] },
              ].map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 pr-4 text-muted-foreground font-mono text-xs">{row.feature}</td>
                  {row.values.map((val, j) => (
                    <td key={j} className="py-3 px-2 text-center">
                      {typeof val === "boolean" ? (
                        val ? (
                          <Check className="h-4 w-4 mx-auto" style={{ color: DEFAULT_COLOR }} />
                        ) : (
                          <span className="text-muted-foreground/30">—</span>
                        )
                      ) : (
                        <span className="text-xs font-mono text-muted-foreground">{val}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}