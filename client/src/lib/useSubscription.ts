import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { plansService } from "@/services/plans.service";
import type { Plan, PlanRule } from "@/types/plans";

const STALE_5M = 1000 * 60 * 5;

export interface SubscriptionLimits {
  pathwaysAccess: boolean;
  enterpriseAccess: boolean;
  reportAccess: boolean;
  forgeCards: boolean;
  trainingProviderAccess: boolean;
  uploadsPerMonth: number;
}

function toLimits(rule?: PlanRule | null): SubscriptionLimits {
  const uploads = rule?.resumeUploads;
  return {
    pathwaysAccess: rule?.careerPathways ?? false,
    enterpriseAccess:
      (rule?.workforceIntel ?? false) || (rule?.institutionDashboard ?? false),
    reportAccess: rule?.executiveReport ?? false,
    forgeCards: rule?.forgeCards ?? false,
    trainingProviderAccess: false,
    uploadsPerMonth:
      uploads === "unlimited"
        ? -1
        : typeof uploads === "number"
          ? uploads
          : 0,
  };
}

/**
 * The live `/v1/plans/public` catalog currently returns features/pricing but not
 * the `planRule` object. We therefore rank the known plans by tier so gating
 * reflects the feature lists returned by the API.
 *
 * Order: Explorer < Pro < Architect < Schools < Institution
 */
const PLAN_RANKS = ["Explorer", "Pro", "Architect", "Schools", "Institution"];

function deriveLimitsFromPlan(plan: Plan): SubscriptionLimits {
  // Prefer explicit planRule if the API ever returns it.
  if (plan.planRule) {
    return toLimits(plan.planRule);
  }

  const rank = PLAN_RANKS.indexOf(plan.title);

  return {
    pathwaysAccess: rank >= 1, // Pro+
    reportAccess: rank >= 1, // Pro+
    forgeCards: rank >= 2, // Architect+
    enterpriseAccess: rank >= 3, // Schools+
    trainingProviderAccess: rank >= 0, // Explorer+
    uploadsPerMonth: rank >= 1 ? -1 : 1, // Explorer gets 1 upload
  };
}

function findPlan(
  plans: Plan[],
  planId?: string | null,
  planTitle?: string | null,
): Plan | null {
  if (planId) {
    const byId = plans.find((p) => p.id === planId);
    if (byId) return byId;
  }
  if (planTitle) {
    const normalized = planTitle.trim().toLowerCase();
    const byTitle = plans.find(
      (p) => p.title.trim().toLowerCase() === normalized,
    );
    if (byTitle) return byTitle;
  }
  return null;
}

/**
 * Subscription access derived from the live `/v1/plans/public` catalog.
 *
 * This hook intentionally does **not** import `SUBSCRIPTION_PLANS` from
 * `@shared/schema`. It matches the user's current subscription (by planId, then
 * plan title). If the API plan has a `planRule` it is used; otherwise access is
 * inferred from the plan title using the feature lists returned by `/plans/public`.
 */
export function useSubscription() {
  const { user } = useAuth();

  const { data: publicPlans, isLoading } = useQuery<Plan[]>({
    queryKey: ["/v1/plans/public"],
    queryFn: async () => {
      try {
        return (await plansService.getPublic()).data;
      } catch {
        return [];
      }
    },
    staleTime: STALE_5M,
    retry: false,
  });

  const plans = publicPlans ?? [];
  const currentPlan = findPlan(
    plans,
    user?.planId,
    user?.subscription?.plan?.title ?? user?.subscriptionPlan,
  );
  // Free users with no subscription get the Explorer gate rules.
  const effectivePlan = currentPlan ?? plans.find((p) => p.title === "Explorer");

  const limits = effectivePlan ? deriveLimitsFromPlan(effectivePlan) : toLimits(null);

  return {
    /** Current plan object from the public catalog, if matched. */
    planData: currentPlan,
    /** Current plan title (human-readable, from the API). */
    plan: currentPlan?.title ?? user?.subscriptionPlan ?? "Free",
    limits,
    isLoading,
    canAccessPathways: limits.pathwaysAccess,
    canAccessEnterprise: limits.enterpriseAccess,
    canAccessReport: limits.reportAccess,
    canAccessForgeCards: limits.forgeCards,
    canAccessTraining: limits.trainingProviderAccess,
    hasUnlimitedUploads: limits.uploadsPerMonth === -1,
    // Full ARK RESUME is a Pro/Architect/Schools/Institution feature per the
    // public plan catalog. Derived by title because `planRule` is not returned.
    canAccessArkResume:
      ["Pro", "Architect", "Schools", "Institution"].includes(
        effectivePlan?.title ?? "",
      ) || (effectivePlan?.planRule?.arkResume ?? false),
  };
}
