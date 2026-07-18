import { Check, Building2, CheckCircle2 } from "lucide-react";
import type { Plan } from "@/types/plans";

const DEFAULT_COLOR = "hsl(188 86% 53%)";

export interface PricingCardProps {
  plan: Plan;
  onSubscribe: (planId: string) => void;
  isCurrent?: boolean;
  currentPlanId?: string;
}

export function PricingCard({ plan, onSubscribe, isCurrent, currentPlanId }: PricingCardProps) {
  const isCurrentPlan = isCurrent && currentPlanId === plan.id;
  const isFree = plan.monthlyPrice === "0.00";

  return (
    <div
      className="glass-card rounded-2xl overflow-hidden flex flex-col relative"
      data-testid={`card-pricing-${plan.id}`}
    >
      {isCurrentPlan && (
        <div className="text-[10px] font-mono uppercase tracking-widest text-center py-1.5 flex items-center justify-center gap-1" style={{ backgroundColor: `${DEFAULT_COLOR}20`, color: DEFAULT_COLOR }}>
          <CheckCircle2 className="h-3 w-3" /> Current Plan
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: `${DEFAULT_COLOR}15`,
              border: `1px solid ${DEFAULT_COLOR}30`,
            }}
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
                  ${plan.monthlyPrice}
                </span>
                <span className="text-sm text-muted-foreground font-mono">/month</span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-secondary">
                ${plan.yearlyPrice}/year (save ~17%)
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

        {!isCurrentPlan && (
          <button
            onClick={() => onSubscribe(plan.id)}
            className="w-full py-3 rounded-lg font-mono text-sm uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02]"
            style={{
              color: DEFAULT_COLOR,
              backgroundColor: `${DEFAULT_COLOR}15`,
              border: `1px solid ${DEFAULT_COLOR}30`,
            }}
            data-testid={`button-pricing-${plan.id}`}
          >
            {isFree ? "Get Started Free" : "Start Free Trial"}
          </button>
        )}

        {isCurrentPlan && (
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
    </div>
  );
}

export interface FeatureComparisonProps {
  plans: Plan[];
  sortedPlans: Plan[];
}

export function FeatureComparison({ plans, sortedPlans }: FeatureComparisonProps) {
  const features = [
    { key: "resumeUploads", label: "Resume uploads" },
    { key: "jstScore", label: "JST Score" },
    { key: "fullDashboard", label: "Full Dashboard" },
    { key: "careerPathways", label: "Career Pathways" },
    { key: "forgeCards", label: "FORGE Cards" },
    { key: "executiveReport", label: "Executive Report" },
    { key: "contextCraft", label: "Context Craft (CCGE)" },
    { key: "workforceIntel", label: "Workforce Intelligence" },
    { key: "institutionDashboard", label: "Institution Dashboard" },
    { key: "prioritySupport", label: "Priority Support" },
  ];

  return (
    <div className="mt-16 glass-card p-6 rounded-xl" data-testid="card-pricing-comparison">
      <h3 className="font-display font-bold text-lg text-primary uppercase tracking-widest mb-6">
        Feature Comparison
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 pr-4 font-mono text-muted-foreground uppercase tracking-wide text-xs">
                Feature
              </th>
              {[...sortedPlans].reverse().map((plan) => (
                <th key={plan.id} className="py-3 px-2 text-center">
                  <span className="font-mono text-xs uppercase tracking-wide" style={{ color: DEFAULT_COLOR }}>
                    {plan.title}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feature) => (
              <tr key={feature.key} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3 pr-4 text-muted-foreground font-mono text-xs">{feature.label}</td>
                {[...sortedPlans].reverse().map((plan) => {
                  const hasFeature = plan.planRule?.[feature.key as keyof typeof plan.planRule];
                  return (
                    <td key={plan.id} className="py-3 px-2 text-center">
                      {typeof hasFeature === "boolean" ? (
                        hasFeature ? (
                          <Check className="h-4 w-4 mx-auto" style={{ color: DEFAULT_COLOR }} />
                        ) : (
                          <span className="text-muted-foreground/30">—</span>
                        )
                      ) : (
                        <span className="text-xs font-mono text-muted-foreground">{String(hasFeature)}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}