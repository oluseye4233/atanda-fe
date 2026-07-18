import { useState, useEffect } from "react";
import { FEATURES } from "@shared/featureFlags";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/useAuth";
import { getApiErrorMessage } from "@/lib/apiError";
import { subscriptionsService } from "@/services/subscriptions.service";
import { f1000Service } from "@/services/f1000.service";
import { plansService } from "@/services/plans.service";
import type { F1000Membership } from "@/types/f1000";
import type { Plan } from "@/types/plans";
import type { CreateSubscriptionBody } from "@/types/subscriptions";
import { SUBSCRIPTION_PLANS } from "@shared/schema";
import {
  Crown,
  GraduationCap,
  User,
  Building2,
  Check,
  Zap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Shield,
  AlertTriangle,
  Compass,
} from "lucide-react";

const PLAN_ICONS: Record<string, typeof User> = {
  INDIVIDUAL_FREE: User,
  INDIVIDUAL_EXPLORER: Compass,
  INDIVIDUAL_PRO: Crown,
  SCHOOL_STUDENT: GraduationCap,
  ENTERPRISE: Building2,
};

const PLAN_ORDER = [
  "INDIVIDUAL_FREE",
  "INDIVIDUAL_EXPLORER",
  "INDIVIDUAL_PRO",
  "SCHOOL_STUDENT",
  "ENTERPRISE",
];

function mapPlanToSubscriptionPlan(plan: Plan): string {
  const title = plan.title.toUpperCase().replace(/\s+/g, "_");
  if (title.includes("EXPLORER")) return "INDIVIDUAL_EXPLORER";
  if (title.includes("PRO")) return "INDIVIDUAL_PRO";
  if (title.includes("ARCHITECT")) return "INDIVIDUAL_PRO";
  if (title.includes("SCHOOL") || title.includes("STUDENT")) return "SCHOOL_STUDENT";
  if (title.includes("INSTITUTION") || title.includes("ENTERPRISE")) return "ENTERPRISE";
  return "INDIVIDUAL_FREE";
}

export default function SubscriptionPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState<string>("INDIVIDUAL_FREE");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [institution, setInstitution] = useState("");

  const f1000Query = useQuery<F1000Membership | null>({
    queryKey: ["/v1/f1000/me"],
    queryFn: async () => {
      try {
        const response = await f1000Service.getMe();
        return response.data;
      } catch {
        return null;
      }
    },
    enabled: FEATURES.f1000Promo && !!user,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const isF1000 = !!f1000Query.data?.member;

  const plansQuery = useQuery<Plan[]>({
    queryKey: ["/v1/plans/public"],
    queryFn: () => plansService.getPublic().then((res) => res.data),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (user?.planId) {
      setCurrentPlan(user.planId);
    }
    if (user?.institution) {
      setInstitution(user.institution);
    }
  }, [user]);

  const handleSubscribe = async (planKey: string) => {
    if (!user) {
      navigate("/signup");
      return;
    }
    setErrorMsg(null);
    if (planKey === "ENTERPRISE") {
      setErrorMsg("Enterprise plans are configured by sales — please contact us.");
      return;
    }
    setIsUpdating(true);
    try {
      // Generate idempotency key for safe retries
      const idempotencyKey = `sub_${user.id}_${planKey}_${Date.now()}`;
      
      const body: CreateSubscriptionBody = {
        planId: planKey,
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
      // Get current subscription first
      const subResponse = await subscriptionsService.getMine();
      const subscription = subResponse.data;
      
      if (subscription.id) {
        await subscriptionsService.update(subscription.id, { status: "inactive" });
      }
      updateUser({ subscriptionStatus: "canceling" });
      setShowSuccess(true);
      setErrorMsg("Subscription will be canceled at the end of the current period.");
      setTimeout(() => setShowSuccess(false), 3000);
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
            {PLAN_ORDER.map((_, i) => (
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
  const sortedPlans = [...plans].sort((a, b) => {
    const aIndex = PLAN_ORDER.indexOf(a.title.toUpperCase().replace(/\s+/g, "_"));
    const bIndex = PLAN_ORDER.indexOf(b.title.toUpperCase().replace(/\s+/g, "_"));
    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
  });

  const currentPlanData = sortedPlans.find((p) => mapPlanToSubscriptionPlan(p) === currentPlan) || sortedPlans[0];
  const isSubscribed = user?.planId && user.planId !== "INDIVIDUAL_FREE";

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
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-4 rounded-xl border border-secondary/30 bg-secondary/5 flex items-center gap-3"
            data-testid="alert-subscription-updated"
          >
            <CheckCircle2 className="h-5 w-5 text-secondary shrink-0" />
            <span className="font-mono text-sm text-secondary">
              Subscription updated successfully. Your new plan features are now active.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {isSubscribed ? (
        <div className="glass-card p-6 rounded-xl" data-testid="card-current-plan">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${currentPlanData.color}15`, border: `2px solid ${currentPlanData.color}40` }}
            >
              {(() => {
                const Icon = PLAN_ICONS[currentPlan] || User;
                return <Icon className="h-7 w-7" style={{ color: currentPlanData.color }} />;
              })()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="font-display font-bold text-xl text-white" data-testid="text-current-plan">
                  {currentPlanData.title}
                </h2>
                <span
                  className="px-2 py-0.5 rounded text-xs font-mono font-bold uppercase"
                  style={{ color: currentPlanData.color, backgroundColor: `${currentPlanData.color}15`, border: `1px solid ${currentPlanData.color}30` }}
                  data-testid="text-subscription-status"
                >
                  {user?.subscriptionStatus === "canceling" ? "CANCELING" : (user?.subscriptionStatus || "ACTIVE").toUpperCase()}
                </span>
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                {currentPlanData.monthlyPrice === "0.00"
                  ? currentPlan === "ENTERPRISE" ? "Custom pricing" : "Free tier"
                  : `$${currentPlanData.monthlyPrice}/${currentPlanData.period}`}
                {user?.institution && currentPlan === "SCHOOL_STUDENT" && (
                  <span className="ml-2 text-primary/70">{user.institution}</span>
                )}
              </p>
            </div>
            {FEATURES.subscriptionCancel && Number(currentPlanData.monthlyPrice) > 0 && currentPlan !== "ENTERPRISE" && user?.subscriptionStatus !== "canceling" && (
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {sortedPlans.map((planData, index) => {
          const planKey = mapPlanToSubscriptionPlan(planData);
          const isCurrent = planKey === currentPlan;
          const Icon = PLAN_ICONS[planKey] || User;
          const isPopular = planKey === "INDIVIDUAL_PRO";
          const isSchool = planKey === "SCHOOL_STUDENT";
          const isEnterprise = planKey === "ENTERPRISE";
          const isFree = planData.monthlyPrice === "0.00";

          return (
            <motion.div
              key={planData.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-card rounded-xl overflow-hidden flex flex-col relative ${
                isCurrent ? "ring-2" : isPopular ? "ring-1 ring-primary/40" : ""
              } ${isEnterprise ? "ring-1 ring-secondary/40" : ""}`}
              style={isCurrent ? { borderColor: `${planData.color}50` } : {}}
              data-testid={`card-plan-${planKey.toLowerCase()}`}
            >
              {isPopular && !isCurrent && (
                <div className="bg-primary text-primary-foreground text-[10px] font-mono uppercase tracking-widest text-center py-1.5 flex items-center justify-center gap-1">
                  <Sparkles className="h-3 w-3" /> Most Popular
                </div>
              )}
              {isCurrent && (
                <div className="text-[10px] font-mono uppercase tracking-widest text-center py-1.5 flex items-center justify-center gap-1" style={{ backgroundColor: `${planData.color}20`, color: planData.color }}>
                  <Shield className="h-3 w-3" /> Current Plan
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${planData.color}15`, border: `1px solid ${planData.color}30` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: planData.color }} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-sm uppercase tracking-wide">{planData.title}</h3>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{planData.freeTrial ? "Free trial available" : "No free trial"}</span>
                  </div>
                </div>

                <div className="mb-6">
                  {isFree ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-display font-black text-white">{isEnterprise ? "Custom" : "Free"}</span>
                    </div>
                  ) : isEnterprise ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-display font-black text-white">Custom</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-1 flex-wrap">
                        <span className="text-3xl font-display font-black text-white">
                          ${Number(planData.monthlyPrice).toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground font-mono">/month</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-secondary">
                        ${Number(planData.yearlyPrice).toFixed(2)}/year (save ~17%)
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
                  {planData.description}
                </p>

                <div className="space-y-2.5 mb-6">
                  {SUBSCRIPTION_PLANS[planKey]?.features.slice(0, 4).map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="h-4 w-4 shrink-0 mt-0.5" style={{ color: planData.color }} />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {!isCurrent && !isEnterprise && (
                  <button
                    onClick={() => {
                      if (isSchool) {
                        setSelectedPlan(selectedPlan === planKey ? null : planKey);
                      } else {
                        handleSubscribe(planKey);
                      }
                    }}
                    disabled={isUpdating}
                    className="w-full py-3 rounded-lg font-mono text-sm uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02]"
                    style={{
                      color: planData.color,
                      backgroundColor: `${planData.color}15`,
                      border: `1px solid ${planData.color}30`,
                    }}
                    data-testid={`button-subscribe-${planKey.toLowerCase()}`}
                  >
                    {isUpdating ? (
                      <Zap className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                    {isUpdating ? "Processing..." : isSchool ? "Select Plan" : "Subscribe"}
                  </button>
                )}

                {isEnterprise && !isCurrent && (
                  <button
                    className="w-full py-3 rounded-lg font-mono text-sm uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-2 opacity-60 cursor-default"
                    style={{
                      color: planData.color,
                      backgroundColor: `${planData.color}10`,
                      border: `1px solid ${planData.color}20`,
                    }}
                    data-testid="button-contact-sales"
                  >
                    <Building2 className="h-4 w-4" />
                    Contact Sales
                  </button>
                )}

                {isCurrent && (
                  <div
                    className="w-full py-3 rounded-lg font-mono text-sm uppercase tracking-wide flex items-center justify-center gap-2"
                    style={{
                      color: planData.color,
                      backgroundColor: `${planData.color}10`,
                      border: `1px solid ${planData.color}20`,
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Active
                  </div>
                )}
              </div>

              <AnimatePresence>
                {selectedPlan === planKey && isSchool && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-2 border-t border-white/10 space-y-3">
                      <label className="text-[10px] uppercase font-mono text-muted-foreground tracking-widest block">
                        School / University Name
                      </label>
                      <input
                        data-testid="input-institution"
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="Enter your institution name"
                        className="w-full bg-black/40 border border-white/10 rounded-md px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                      />
                      <button
                        onClick={() => handleSubscribe(planKey)}
                        disabled={isUpdating || !institution.trim()}
                        className="w-full py-3 rounded-lg font-mono text-sm uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] disabled:opacity-40"
                        style={{
                          color: planData.color,
                          backgroundColor: `${planData.color}15`,
                          border: `1px solid ${planData.color}30`,
                        }}
                        data-testid="button-confirm-school-subscription"
                      >
                        {isUpdating ? (
                          <Zap className="h-4 w-4 animate-spin" />
                        ) : (
                          <GraduationCap className="h-4 w-4" />
                        )}
                        {isUpdating ? "Processing..." : "Activate Student Plan"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
                {sortedPlans.map((planData) => (
                  <th key={planData.id} className="py-3 px-2 text-center">
                    <span className="font-mono text-xs uppercase tracking-wide" style={{ color: planData.color }}>
                      {planData.title}
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
                          <Check className="h-4 w-4 mx-auto" style={{ color: sortedPlans[j]?.color }} />
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

      <AnimatePresence>
      </AnimatePresence>
    </div>
  );
}