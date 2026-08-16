import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { bookService } from "@/services/book.service";
import type {
  BookJourneyResponse,
  BookProgressResponse,
  FinalizeResponse,
} from "@/types/book";

const STALE_5M = 1000 * 60 * 5;
const GC_30M = 1000 * 60 * 30;

/**
 * Fetches the reader's Book Companion state from `/api/book/*`.
 *
 * - `journey` is the full map (stages + nodes with earned flags).
 * - `progress` is the dynamic reader state (badges + Ledger snapshots).
 * - `finalize` triggers the Epilogue close-out.
 *
 * Each query fails soft (returns `null`) so the UI can render an empty/error
 * state instead of crashing when the feature flag is off or the backend
 * returns 404.
 */
export function useBookCompanion() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const enabled = !!user?.id;

  const journeyQuery = useQuery<BookJourneyResponse | null>({
    queryKey: ["book", "journey"],
    queryFn: async () => {
      try {
        return await bookService.getJourney();
      } catch {
        return null;
      }
    },
    enabled,
    staleTime: STALE_5M,
    gcTime: GC_30M,
    refetchOnWindowFocus: true,
  });

  const progressQuery = useQuery<BookProgressResponse | null>({
    queryKey: ["book", "progress"],
    queryFn: async () => {
      try {
        return await bookService.getProgress();
      } catch {
        return null;
      }
    },
    enabled,
    staleTime: STALE_5M,
    gcTime: GC_30M,
    refetchOnWindowFocus: true,
  });

  const finalize = useMutation<FinalizeResponse, Error>({
    mutationFn: async () => {
      const result = await bookService.finalizeJourney();
      if (!result) throw new Error("Invalid finalize response");
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["book", "progress"] });
      qc.invalidateQueries({ queryKey: ["book", "journey"] });
    },
  });

  const isLoading = journeyQuery.isLoading || progressQuery.isLoading;
  const isFetching = journeyQuery.isFetching || progressQuery.isFetching;
  const isError = journeyQuery.isError || progressQuery.isError;

  return {
    isLoading,
    isFetching,
    isError,
    journey: journeyQuery.data,
    progress: progressQuery.data,
    earnedCount: progressQuery.data?.badges.length ?? 0,
    finalize,
    refetch: () => {
      void journeyQuery.refetch();
      void progressQuery.refetch();
    },
  };
}
