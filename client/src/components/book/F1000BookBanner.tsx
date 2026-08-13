import { Link } from "react-router-dom";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { F1000QrCard } from "@/components/f1000/F1000QrCard";

/**
 * F1000 soft-launch banner — the printed QR that ships in the book points here.
 * Rendered on the Book Companion page when the promo is live.
 */
export function F1000BookBanner() {
  const url = typeof window !== "undefined" ? `${window.location.origin}/f1000` : "/f1000";
  return (
    <div
      className="glass-card border border-primary/40 rounded-xl p-6 flex flex-col md:flex-row md:items-center gap-6"
      data-testid="banner-f1000-book"
    >
      <div className="shrink-0 mx-auto md:mx-0">
        <F1000QrCard url={url} size={150} caption="Scan to claim your free seat" />
      </div>
      <div className="flex-1 space-y-2 text-center md:text-left">
        <div className="inline-flex items-center gap-2 text-secondary font-mono text-xs uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" /> First 1000 readers — free forever
        </div>
        <p className="text-white font-display font-bold text-lg">
          F1000 free with this QR code
        </p>
        <p className="text-muted-foreground text-sm leading-relaxed">
          The first 1,000 readers get an Individual Explorer account — free, forever — with Training Providers
          unlocked. Scan the code (or open the link), sign in, and your single-use seat is reserved instantly.
        </p>
        <Link
          to="/f1000"
          data-testid="link-book-f1000"
          className="inline-flex items-center gap-1.5 text-primary font-mono text-xs uppercase tracking-wider hover:text-primary/80 transition-colors"
        >
          Claim your F1000 seat <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
