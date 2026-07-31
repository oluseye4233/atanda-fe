import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { ccgeService } from "@/services/ccge.service";
import type { CcgeCard, CcgeScenario, CcgeSession } from "@/types/ccge";

const STALE_5M = 1000 * 60 * 5;
const GC_30M = 1000 * 60 * 30;

export interface UseCcgeOptions {
  /** Filter scenarios by a tier key such as "Bronze" or "Silver". */
  tier?: string;
  /** Also fetch the current user's recent CCGE sessions. */
  includeHistory?: boolean;
}

/**
 * Single data source for the Skill Games (CCGE) module. Fetches the card
 * compendium, available scenarios, and — when requested — the user's recent
 * sessions in parallel. Each query fails soft and is cached for 5 minutes so
 * navigating to /play or related pages does not re-fetch on every mount.
 *
 * Use this instead of calling ccgeService directly in a useEffect; the cache
 * removes the per-mount refetch behaviour and gives every CCGE view the same
 * up-to-date catalog.
 */
export function useCcge(options: UseCcgeOptions = {}) {
  const { tier, includeHistory } = options;
  const { user } = useAuth();
  const userId = user?.id;

  const cards = useQuery({
    queryKey: ["ccge", "cards"],
    queryFn: async (): Promise<CcgeCard[] | null> => {
      try {
        return (await ccgeService.getCards()).data.data;
      } catch {
        return null;
      }
    },
    enabled: !!userId,
    staleTime: STALE_5M,
    gcTime: GC_30M,
  });

  const scenarios = useQuery({
    queryKey: ["ccge", "scenarios", tier ?? "all"],
    queryFn: async (): Promise<CcgeScenario[] | null> => {
      try {
        return (await ccgeService.getScenarios(tier)).data.data;
      } catch {
        return null;
      }
    },
    enabled: !!userId,
    staleTime: STALE_5M,
    gcTime: GC_30M,
  });

  const sessions = useQuery({
    queryKey: ["ccge", "sessions", "user", userId],
    queryFn: async (): Promise<CcgeSession[] | null> => {
      if (!userId) return null;
      try {
        return (await ccgeService.getUserSessions(userId)).data.data;
      } catch {
        return null;
      }
    },
    enabled: !!userId && includeHistory === true,
    staleTime: STALE_5M,
    gcTime: GC_30M,
  });

  const isLoading =
    cards.isLoading ||
    scenarios.isLoading ||
    (includeHistory && sessions.isLoading);

  return {
    isLoading,
    isFetching:
      cards.isFetching || scenarios.isFetching || sessions.isFetching,
    cards: cards.data,
    scenarios: scenarios.data,
    sessions: sessions.data,
    hasData: !!cards.data || !!scenarios.data,
    refetch: () => {
      cards.refetch();
      scenarios.refetch();
      if (includeHistory) sessions.refetch();
    },
  };
}
