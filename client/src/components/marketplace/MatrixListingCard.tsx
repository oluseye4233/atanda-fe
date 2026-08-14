import { Link } from "react-router-dom";
import { Coins } from "lucide-react";
import { formatPriceUsd, hiveToTierBadge } from "@/lib/sphinx";
import { TierBadge, CategoryChip, PillarBadge, GradeChip } from "./badges";
import type { SpcListing } from "@/types/sphinx";

export function MatrixListingCard({ listing }: { listing: SpcListing }) {
  const tier = hiveToTierBadge(listing.hiveScore);
  return (
    <Link
      to={`/marketplace/${listing.id}`}
      data-testid={`card-listing-${listing.id}`}
      className={`group glass-card rounded-xl border transition-all hover:scale-[1.02] flex flex-col p-5 gap-3 ${
        tier === "ULTRA"
          ? "border-purple-400/30 hover:border-purple-400/60"
          : tier === "PREMIUM"
            ? "border-amber-400/30 hover:border-amber-400/60"
            : "border-white/10 hover:border-primary/40"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <TierBadge hive={listing.hiveScore} />
          <CategoryChip pillar={listing.pillar ?? ""} />
        </div>
        <GradeChip hive={listing.hiveScore} />
      </div>

      <h3
        className="font-display font-bold text-base text-white leading-tight line-clamp-2 group-hover:text-primary transition-colors"
        data-testid={`text-title-${listing.id}`}
      >
        {listing.title}
      </h3>
      <p
        className="text-sm text-muted-foreground line-clamp-2"
        data-testid={`text-desc-${listing.id}`}
      >
        {listing.description}
      </p>

      <div className="flex items-center justify-between pt-3 mt-auto border-t border-white/5">
        <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
          <PillarBadge pillar={listing.pillar ?? ""} />
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-amber-400/10 border border-amber-400/30">
          <Coins className="h-3.5 w-3.5 text-amber-400" />
          <span
            className="font-mono text-xs font-bold text-amber-400"
            data-testid={`text-price-${listing.id}`}
          >
            {formatPriceUsd(listing.price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
