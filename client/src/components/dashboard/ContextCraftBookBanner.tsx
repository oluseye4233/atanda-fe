import { BookOpen, ArrowUpRight, Lock } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { useSubscription } from "@/lib/useSubscription";

// Google Drive "preview" embed URL for context-craft-ebook.pdf.
// Opens in a new tab on click via the Read button below. Hosted on Drive so
// the file is NOT shipped in the client bundle / public dir — it's only ever
// fetched when a subscriber (or an admin) actually clicks Read.
const CONTEXT_CRAFT_BOOK_URL =
  "https://drive.google.com/file/d/1tBbaVwOi5HeyaChR7ZCihkUMXnKt1Gwi/preview";

/**
 * "Context Craft: The Rise of Cognitive Engineering" banner for the
 * Intelligence Hub dashboard. Rendered only for paying subscribers (any tier,
 * just not free) and admins. Matches a paying tier using the same live
 * /v1/plans/public catalog lookup the subscription page uses — a user is
 * "paying" when their matched plan has a non-zero price.
 */
export function ContextCraftBookBanner() {
  const { user } = useAuth();
  const { planData, isLoading } = useSubscription();

  const isAdmin = user?.role === "admin";
  // planData comes back undefined while the plan catalog is loading and for
  // free/matched-none users — only treat a matched non-free plan as paying.
  const isPaying = isAdmin || (!!planData && planData.monthlyPrice !== "0.00");

  // Wait for the plan catalog before concluding the user isn't paying, so we
  // don't flash the banner away for a subscriber whose plan is still loading.
  // Admins bypass — we can render immediately for them.
  if (isLoading && !isAdmin) return null;
  if (!isPaying) return null;

  return (
    <div
      className="glass-card rounded-xl border border-primary/20 overflow-hidden"
      data-testid="banner-context-craft-book"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5">
        <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Context Craft
          </p>
          <h3 className="font-display font-bold text-lg text-white leading-snug">
            The Rise of Cognitive Engineering
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" /> Full digital edition included with your plan.
          </p>
        </div>

        <a
          href={CONTEXT_CRAFT_BOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="button-read-context-craft-book"
          className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-lg bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest hover:bg-primary/90 transition-all hover:-translate-y-0.5 shrink-0"
        >
          Read book <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}