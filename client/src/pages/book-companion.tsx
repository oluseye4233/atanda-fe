import { useBookCompanion } from "@/hooks/useBookCompanion";
import { JourneyHeader, JourneyMap } from "@/components/book/JourneyMap";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { getApiErrorMessage } from "@/lib/apiError";
import { toast } from "sonner";
import {
  RefreshCw,
  BookX,
  CheckCircle2,
  Loader2,
  Trophy,
  AlertCircle,
} from "lucide-react";

export default function BookCompanionPage() {
  const {
    journey,
    progress,
    isLoading,
    isError,
    refetch,
    finalize,
  } = useBookCompanion();

  const epilogue = journey?.nodes?.find((node) => node.id === "epilogue");
  const ledgerDelta = finalize.data?.ledger.delta ?? progress?.ledger.delta;

  const handleFinalize = async () => {
    try {
      await finalize.mutateAsync();
      toast.success("Journey closed", {
        description:
          "Your final Ledger snapshot and Proof of Growth badge have been saved.",
      });
    } catch (err) {
      toast.error("Couldn't close journey", {
        description: getApiErrorMessage(err, "Please try again later."),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!journey || isError || !Array.isArray(journey.nodes)) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <Empty className="min-h-[50vh] glass-card rounded-xl border-white/10">
          <EmptyHeader>
            <BookX className="h-10 w-10 text-muted-foreground" />
            <EmptyTitle>Couldn't load the Book Companion</EmptyTitle>
            <EmptyDescription>
              {isError
                ? "We couldn't reach the journey server. Make sure you're signed in and the book_companion feature is enabled."
                : "The journey data we received is incomplete. Check the /api/book/journey response shape."}
            </EmptyDescription>
          </EmptyHeader>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      <JourneyHeader
        title={journey.title}
        totalNodes={journey.totalNodes}
        earnedCount={progress?.badges.length}
      />
      <JourneyMap journey={journey} />

      {epilogue && (
        <section
          className="glass-card rounded-xl border border-white/10 p-6 space-y-4"
          data-testid="journey-finalize-card"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-display font-bold text-white">
                {epilogue.chapterLabel}: {epilogue.title}
              </h3>
              <p className="text-sm text-muted-foreground font-mono mt-1 max-w-2xl">
                {epilogue.earned || finalize.isSuccess
                  ? "Your journey is closed. The final Ledger snapshot and Proof of Growth badge are set."
                  : "Close out the journey to capture your final Ledger snapshot and earn the Proof of Growth badge."}
              </p>
            </div>
            {(epilogue.earned || finalize.isSuccess) && (
              <CheckCircle2 className="h-8 w-8 text-emerald-400 shrink-0" />
            )}
          </div>

          {finalize.isError && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>
                {getApiErrorMessage(finalize.error, "Please try again later.")}
              </span>
            </div>
          )}

          {ledgerDelta && (
            <div className="grid grid-cols-3 gap-3 max-w-md">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
                <p className="text-[10px] uppercase font-mono text-muted-foreground tracking-wider">
                  ARK Score
                </p>
                <p className="text-lg font-display font-bold text-cyan-300 tabular-nums">
                  +{ledgerDelta.arkScore}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
                <p className="text-[10px] uppercase font-mono text-muted-foreground tracking-wider">
                  JST Index
                </p>
                <p className="text-lg font-display font-bold text-fuchsia-300 tabular-nums">
                  +{ledgerDelta.jstIndex}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
                <p className="text-[10px] uppercase font-mono text-muted-foreground tracking-wider">
                  CCMI
                </p>
                <p className="text-lg font-display font-bold text-amber-300 tabular-nums">
                  +{ledgerDelta.ccmi}
                </p>
              </div>
            </div>
          )}

          {!epilogue.earned && !finalize.isSuccess && (
            <Button
              onClick={handleFinalize}
              disabled={finalize.isPending}
              data-testid="button-finalize-journey"
            >
              {finalize.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trophy className="h-4 w-4 mr-2" />
              )}
              Close journey
            </Button>
          )}
        </section>
      )}
    </div>
  );
}
