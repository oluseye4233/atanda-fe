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