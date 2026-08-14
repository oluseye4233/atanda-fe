import { Coins } from "lucide-react";
import {
  SPC_PRICE_MIN,
  SPC_PRICE_MAX,
  GRADE_PRICING_MATRIX,
  formatPriceUsd,
} from "@/lib/sphinx";
import { TierBadge } from "./badges";

export function PricingMatrixBanner() {
  return (
    <div
      className="glass-card rounded-xl border border-primary/20 p-5 space-y-3"
      data-testid="panel-pricing-matrix"
    >
      <div>
        <h3 className="font-display font-bold text-sm text-primary tracking-wider uppercase flex items-center gap-2">
          <Coins className="h-4 w-4" /> Grade-Based Pricing Matrix
        </h3>
        <p className="font-mono text-[11px] text-muted-foreground mt-1">
          Suggested price bands by tier. Final price is up to you (
          {SPC_PRICE_MIN}–{SPC_PRICE_MAX} credits).
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {GRADE_PRICING_MATRIX.map((band) => (
          <div
            key={band.tier}
            className="p-3 rounded-lg border border-white/10 bg-white/5 space-y-2"
            data-testid={`row-pricing-${band.tier.toLowerCase()}`}
          >
            <div className="flex items-center justify-between">
              <TierBadge hive={band.minHive} />
              <span className="font-mono text-[10px] text-muted-foreground">
                HIVE ≥ {band.minHive}
              </span>
            </div>
            <div className="font-mono text-sm text-white font-bold">
              {band.suggestedMin}–{band.suggestedMax}{" "}
              <span className="text-muted-foreground font-normal">cr</span>
            </div>
            <div className="font-mono text-[10px] text-muted-foreground">
              {formatPriceUsd(band.suggestedMin)} –{" "}
              {formatPriceUsd(band.suggestedMax)}
            </div>
            <p className="font-mono text-[10px] text-muted-foreground/80">
              {band.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
