import { SUBSCRIPTION_PLANS, CONTEXT_CRAFT_LEVELS, type SubscriptionPlan, type ContextCraftLevel } from "@shared/schema";
import { Link } from "react-router-dom";
import { CreditCard, ShieldCheck, GraduationCap } from "lucide-react";
import type { AuthUser } from "@/types/auth";

interface SubscriptionTabProps {
  user: Pick<AuthUser, 'subscriptionPlan' | 'contextCraftCertLevel' | 'institution'>;
}

export function SubscriptionTab({ user }: SubscriptionTabProps) {
  const plan = SUBSCRIPTION_PLANS[(user.subscriptionPlan || "INDIVIDUAL_FREE") as SubscriptionPlan] || SUBSCRIPTION_PLANS.INDIVIDUAL_FREE;
  const cert = CONTEXT_CRAFT_LEVELS[(user.contextCraftCertLevel || "NONE") as ContextCraftLevel] || CONTEXT_CRAFT_LEVELS.NONE;

  return (
    <div className="space-y-6">
      <Link to="/subscription" className="block" data-testid="link-profile-subscription">
        <div className="glass-card p-6 rounded-xl hover:border-primary/30 transition-all hover:scale-[1.02] cursor-pointer border border-transparent">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${plan.color}15`, border: `2px solid ${plan.color}40` }}>
              <CreditCard className="h-6 w-6" style={{ color: plan.color }} />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Current Plan</p>
              <h3 className="font-display font-bold text-xl text-white">{plan.label}</h3>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                {plan.price === 0 ? (plan.key === "ENTERPRISE" ? "Custom pricing" : "Free") : `$${plan.price}/${plan.period}`}
              </p>
            </div>
            <div className="px-3 py-1.5 rounded text-[10px] font-mono font-bold uppercase" style={{ color: plan.color, backgroundColor: `${plan.color}15`, border: `1px solid ${plan.color}30` }}>
              ACTIVE
            </div>
          </div>
        </div>
      </Link>

      <div className="glass-card p-5 rounded-xl border border-transparent" data-testid="card-profile-cert-static">
        <div className="flex items-center gap-3 mb-3">
          <ShieldCheck className="h-5 w-5" style={{ color: cert.color }} />
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Context Craft</span>
        </div>
        <p className="font-display font-bold text-lg text-white">{cert.label}</p>
        <p className="text-sm text-muted-foreground mt-1">{cert.multiplier}x JST Multiplier</p>
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