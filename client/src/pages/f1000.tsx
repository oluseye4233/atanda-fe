import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { f1000Service } from "@/services/f1000.service";
import { F1000QrCard } from "@/components/f1000/F1000QrCard";
import { F1000RandomCodePanel } from "@/components/f1000/F1000RandomCodePanel";
import type { F1000Stats } from "@/types/f1000";

export default function F1000Page() {
  const queryClient = useQueryClient();

  const claimUrl = typeof window !== "undefined" ? `${window.location.origin}/f1000` : "/f1000";

  const statsQuery = useQuery<F1000Stats>({
    queryKey: ["/api/f1000/stats"],
    queryFn: () => f1000Service.getStats().then((r) => r.data),
    refetchOnWindowFocus: false,
  });

  const stats = statsQuery.data;
  const remaining = stats?.remaining ?? F1000_LIMIT_FALLBACK;
  const limit = stats?.limit ?? F1000_LIMIT_FALLBACK;
  const claimedSeats = stats?.claimed ?? 0;
  const soldOut = remaining <= 0;

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-4">
      <div className="text-center space-y-4">
        <div
          className="inline-flex items-center gap-2 rounded-full border border-secondary/50 bg-secondary/10 px-4 py-1.5 text-xs font-mono uppercase tracking-widest text-secondary"
          data-testid="badge-f1000-scarcity"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {soldOut ? (
            <span data-testid="text-f1000-remaining">All {limit} F1000 seats claimed</span>
          ) : (
            <>
              The First <span className="font-bold text-white">1000</span> ·{" "}
              <span className="font-bold text-white" data-testid="text-f1000-remaining">{remaining}</span>/{limit} seats left
            </>
          )}
        </div>
        <h1 className="text-4xl font-display font-black text-white tracking-tight" data-testid="text-f1000-title">
          F1000 <span className="text-primary neon-text">Free</span> with this QR code
        </h1>
        <p className="max-w-2xl mx-auto text-muted-foreground leading-relaxed">
          The first 1,000 readers get an <span className="text-primary font-semibold">Individual Explorer</span> account —
          free, forever — with Training Providers unlocked. Each QR scan reserves one of 1,000 single-use codes, bound to
          your account the moment you sign in.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* QR — shared on landing + printed in the book */}
        <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-5" data-testid="card-f1000-qr">
          <F1000QrCard url={claimUrl} size={200} showDownload caption="Scan to claim · or share the code" />
          <div className="text-center text-xs font-mono text-muted-foreground">
            {claimedSeats.toLocaleString()} of {limit.toLocaleString()} claimed
          </div>
        </div>

        {/* QR-scan landing — fetch a single-use code, copy it, claim it */}
        <F1000RandomCodePanel onClaimed={() => queryClient.invalidateQueries({ queryKey: ["/api/f1000/me"] })} />
      </div>
    </div>
  );
}

const F1000_LIMIT_FALLBACK = 1000;