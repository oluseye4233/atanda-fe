import { useEffect, useState } from "react";
import { Coins } from "lucide-react";
import { sphinxService } from "@/services/sphinx.service";
import { formatPriceUsd } from "@/lib/sphinx";
import type { UserCredits } from "@/types/sphinx";

export function CreditsHeader({ user }: { user: { id: string; name: string } }) {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  useEffect(() => {
    let active = true;
    sphinxService
      .getCredits(user.id)
      .then((r) => {
        if (active) setCredits(r.data);
      })
      .catch(() => null);
    return () => {
      active = false;
    };
  }, [user.id]);
  return (
    <div
      className="glass-card p-3 rounded-xl flex items-center gap-3"
      data-testid="card-credits"
    >
      <Coins className="h-5 w-5 text-amber-400" />
      <div className="flex flex-col">
        <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono">
          Credits
        </span>
        <span
          className="font-mono text-base font-bold text-amber-400"
          data-testid="text-credits-balance"
        >
          {credits ? formatPriceUsd(credits.balance) : "—"}
        </span>
      </div>
    </div>
  );
}
