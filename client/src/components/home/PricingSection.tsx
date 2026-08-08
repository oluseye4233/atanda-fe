import { useAuth } from "@/lib/useAuth";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { plansService } from "@/services/plans.service";
import { billingService } from "@/services/billing.service";
import type { Plan } from "@/types/plans";
import { PricingCard } from "./PricingComponents";

export function PricingSection() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: plans, isLoading, error } = useQuery<Plan[]>({
    queryKey: ["/v1/plans/public"],
    queryFn: () => plansService.getPublic().then((res) => res.data),
    staleTime: 1000 * 60 * 5,
  });

  const handleSubscribe = async (planKey: string) => {
    if (!user) {
      navigate("/signup");
      return;
    }
    try {
      const response = await billingService.startCheckout({ plan: planKey as any });
      const session = response.data;
      if (session.redirectUrl) {
        window.location.href = session.redirectUrl;
      } else if (session.sessionId) {
        navigate(`/checkout/${session.sessionId}`);
      }
    } catch (err) {
      console.error("Failed to start checkout:", err);
      navigate("/subscription");
    }
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
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

  if (error) {
    return (
      <section className="bg-[#0d1117] px-6 sm:px-10 py-24" data-testid="section-pricing">
        <div className="max-w-6xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/3 px-3 py-1 text-[11px] font-mono tracking-widest text-muted-foreground uppercase mb-4">
            Pricing
          </span>
          <h2 className="font-sans font-bold text-2xl sm:text-3xl text-white mb-3 tracking-tight">
            Pricing temporarily unavailable
          </h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
            We couldn't load the plans right now. Please refresh the page or try again later.
          </p>
        </div>
      </section>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <section className="bg-[#0d1117] px-6 sm:px-10 py-24" data-testid="section-pricing">
        <div className="max-w-6xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/3 px-3 py-1 text-[11px] font-mono tracking-widest text-muted-foreground uppercase mb-4">
            Pricing
          </span>
          <h2 className="font-sans font-bold text-2xl sm:text-3xl text-white mb-3 tracking-tight">
            No plans available
          </h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
            Check back soon — we're working on bringing the right options for your career stage.
          </p>
        </div>
      </section>
    );
  }

  const currentPlanId = user?.planId || undefined;

  return (
    <section
      id="pricing"
      className="bg-[#0d1117] px-6 sm:px-10 py-24"
      data-testid="section-pricing"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, hsl(188 86% 53% / 0.3), transparent)",
        }}
      />

      <div className="max-w-6xl mx-auto relative">
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

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              onSubscribe={handleSubscribe}
              isCurrent={!!currentPlanId}
              currentPlanId={currentPlanId}
            />
          ))}
        </div>
      </div>
    </section>
  );
}