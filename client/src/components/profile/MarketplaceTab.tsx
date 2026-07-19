import { Link } from "react-router-dom";
import { ShoppingBag, Coins } from "lucide-react";
import { formatPriceUsd as formatPriceDual } from "@shared/schema";
import type { ProfileCredits, SpcSalesSummary } from "@/types/profile";

interface MarketplaceTabProps {
  credits: ProfileCredits | null;
  sales: SpcSalesSummary | null;
}

export function MarketplaceTab({ credits, sales }: MarketplaceTabProps) {
  return (
    <div className="space-y-6">
      <Link to="/marketplace" className="block" data-testid="link-profile-marketplace">
        <div className="glass-card p-5 rounded-xl hover:border-primary/30 transition-all hover:scale-[1.02] cursor-pointer border border-transparent space-y-3">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">SPHINX Marketplace</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[9px] uppercase font-mono tracking-widest text-muted-foreground">Credits</div>
              <div className="flex items-center gap-1.5">
                <Coins className="h-4 w-4 text-amber-400" />
                <span className="font-display font-bold text-base text-amber-400" data-testid="text-profile-credits">
                  {credits ? formatPriceDual(credits.balance) : "—"}
                </span>
              </div>
            </div>
            <div>
              <div className="text-[9px] uppercase font-mono tracking-widest text-muted-foreground">Earned</div>
              <div className="font-display font-bold text-base text-secondary" data-testid="text-profile-earned">
                {sales ? formatPriceDual(sales.totalEarned) : "—"}
              </div>
            </div>
            <div>
              <div className="text-[9px] uppercase font-mono tracking-widest text-muted-foreground">Sales</div>
              <div className="font-display font-bold text-xl text-white" data-testid="text-profile-sales">
                {sales ? sales.salesCount : "—"}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}