import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, Crown, GraduationCap, User, Building2, Sparkles, Zap } from "lucide-react";
import { plansService } from "@/services/plans.service";
import type { Plan } from "@/types/plans";

const PLAN_ICONS: Record<string, typeof User> = {
  INDIVIDUAL_FREE: User,
  INDIVIDUAL_EXPLORER: Zap,
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

function PricingCard({ plan, index }: { plan: Plan; index: number }) {
  const Icon = PLAN_ICONS[plan.title.toUpperCase().replace(/\s+/g, "_")] || User;
  const isPopular = plan.title === "Pro";
  const isEnterprise = plan.title === "Institution";
  const isFree = plan.monthlyPrice === "0.00";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`glass-card rounded-2xl overflow-hidden flex flex-col relative ${
        isPopular ? "ring-1 ring-primary/40" : ""
      } ${isEnterprise ? "ring-1 ring-secondary/40" : ""}`}
      style={isPopular ? { borderColor: "hsl(188 86% 53% / 0.3)" } : {}}
      data-testid={`card-pricing-${plan.title.toLowerCase()}`}
    >
      {isPopular && !isEnterprise && (
        <div className="bg-primary text-primary-foreground text-[10px] font-mono uppercase tracking-widest text-center py-1.5 flex items-center justify-center gap-1">
          <Sparkles className="h-3 w-3" /> Most Popular
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${isPopular ? "hsl(188 86% 53%)" : isEnterprise ? "hsl(152 69% 31%)" : "hsl(188 86% 53%)"}15`, border: `1px solid ${isPopular ? "hsl(188 86% 53%)" : isEnterprise ? "hsl(152 69% 31%)" : "hsl(188 86% 53%)"}30` }}
          >
            <Icon className="h-5 w-5" style={{ color: isPopular ? "hsl(188 86% 53%)" : isEnterprise ? "hsl(152 69% 31%)" : "hsl(188 86% 53%)" }} />
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
          ) : isEnterprise ? (
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-display font-black text-white">Custom</span>
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
          {plan.features.map((feature, i) => (
            <div key={i} className="flex items-start gap-2">
              <Check className="h-4 w-4 shrink-0 mt-0.5" style={{ color: isPopular ? "hsl(188 86% 53%)" : isEnterprise ? "hsl(152 69% 31%)" : "hsl(188 86% 53%)" }} />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>

        {!isEnterprise && (
          <a
            href={isFree ? "/signup" : "/signup"}
            className="w-full py-3 rounded-lg font-mono text-sm uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02]"
            style={{
              color: isPopular ? "hsl(188 86% 53%)" : isEnterprise ? "hsl(152 69% 31%)" : "hsl(188 86% 53%)",
              backgroundColor: `${isPopular ? "hsl(188 86% 53%)" : isEnterprise ? "hsl(152 69% 31%)" : "hsl(188 86% 53%)"}15`,
              border: `1px solid ${isPopular ? "hsl(188 86% 53%)" : isEnterprise ? "hsl(152 69% 31%)" : "hsl(188 86% 53%)"}30`,
            }}
            data-testid={`button-pricing-${plan.title.toLowerCase()}`}
          >
            {isFree ? "Get Started Free" : "Start Free Trial"}
          </a>
        )}

        {isEnterprise && (
          <a
            href="/contact"
            className="w-full py-3 rounded-lg font-mono text-sm uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-2 opacity-60 cursor-default"
            style={{
              color: "hsl(152 69% 31%)",
              backgroundColor: "hsl(152 69% 31% / 0.1)",
              border: "1px solid hsl(152 69% 31% / 0.2)",
            }}
            data-testid="button-contact-sales"
          >
            <Building2 className="h-4 w-4" />
            Contact Sales
          </a>
        )}
      </div>
    </motion.div>
  );
}

export function PricingSection() {
  const { data: plans, isLoading, error } = useQuery<Plan[]>({
    queryKey: ["/v1/plans/public"],
    queryFn: () => plansService.getPublic().then(res => res.data),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <section className="bg-[#0d1117] px-6 sm:px-10 py-24" data-testid="section-pricing">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/3 px-3 py-1 text-[11px] font-mono tracking-widest text-muted-foreground uppercase mb-4">
              Pricing
            </span>
            <h2 className="font-sans font-bold text-2xl sm:text-3xl text-white mb-3 tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
              Choose the plan that fits your career stage. All plans include core ARK intelligence.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
            {PLAN_ORDER.map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-6 flex flex-col"
              >
                <div className="animate-pulse space-y-4">
                  <div className="h-10 bg-white/5 rounded" />
                  <div className="h-8 bg-white/5 rounded w-3/4" />
                  <div className="h-8 bg-white/5 rounded w-1/2" />
                  <div className="h-4 bg-white/5 rounded w-full" />
                  <div className="h-4 bg-white/5 rounded w-full" />
                  <div className="h-4 bg-white/5 rounded w-full" />
                  <div className="h-4 bg-white/5 rounded w-full" />
                  <div className="h-4 bg-white/5 rounded w-full" />
                  <div className="h-10 bg-white/5 rounded mt-auto" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !plans) {
    return null;
  }

  // Sort plans by our defined order
  const sortedPlans = [...plans].sort((a, b) => {
    const aIndex = PLAN_ORDER.indexOf(a.title.toUpperCase().replace(/\s+/g, "_"));
    const bIndex = PLAN_ORDER.indexOf(b.title.toUpperCase().replace(/\s+/g, "_"));
    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
  });

  return (
    <section
      id="pricing"
      className="bg-[#0d1117] px-6 sm:px-10 py-24"
      data-testid="section-pricing"
    >
      {/* Subtle section divider glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, hsl(188 86% 53% / 0.3), transparent)",
        }}
      />

      <div className="max-w-6xl mx-auto relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/3 px-3 py-1 text-[11px] font-mono tracking-widest text-muted-foreground uppercase mb-4">
            Pricing
          </span>
          <h2 className="font-sans font-bold text-2xl sm:text-3xl lg:text-4xl text-white mb-3 tracking-tight">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Choose the plan that fits your career stage. All plans include core ARK
            intelligence — JST scoring, vulnerability analysis, and pivot pathways.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
          {sortedPlans.map((plan, index) => (
            <PricingCard key={plan.id} plan={plan} index={index} />
          ))}
        </div>

        {/* Feature comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 glass-card p-6 rounded-xl"
          data-testid="card-pricing-comparison"
        >
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
                  {sortedPlans.map((plan) => (
                    <th key={plan.id} className="py-3 px-2 text-center">
                      <span className="font-mono text-xs uppercase tracking-wide" style={{ color: plan.title === "Pro" ? "hsl(188 86% 53%)" : plan.title === "Institution" ? "hsl(152 69% 31%)" : "hsl(188 86% 53%)" }}>
                        {plan.title}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Resume uploads", values: ["1/month", "Unlimited", "Unlimited", "Unlimited", "Unlimited"] },
                  { feature: "JST Score", values: [true, true, true, true, true] },
                  { feature: "Full Dashboard", values: [true, true, true, true, true] },
                  { feature: "Career Pathways", values: [false, true, true, true, true] },
                  { feature: "FORGE Cards", values: [false, true, true, true, true] },
                  { feature: "Executive Report", values: [false, true, true, true, true] },
                  { feature: "Context Craft (CCGE)", values: [false, true, true, true, true] },
                  { feature: "Workforce Intelligence", values: [false, false, false, false, true] },
                  { feature: "Institution Dashboard", values: [false, false, false, true, false] },
                  { feature: "Priority Support", values: [false, false, false, false, true] },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 pr-4 text-muted-foreground font-mono text-xs">{row.feature}</td>
                    {row.values.map((val, j) => (
                      <td key={j} className="py-3 px-2 text-center">
                        {typeof val === "boolean" ? (
                          val ? (
                            <Check className="h-4 w-4 mx-auto" style={{ color: sortedPlans[j]?.title === "Pro" ? "hsl(188 86% 53%)" : sortedPlans[j]?.title === "Institution" ? "hsl(152 69% 31%)" : "hsl(188 86% 53%)" }} />
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
        </motion.div>
      </div>
    </section>
  );
}