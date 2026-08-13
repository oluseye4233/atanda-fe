import { useEffect, useState } from "react";
import { MessageSquare, Star } from "lucide-react";
import { sphinxService } from "@/services/sphinx.service";
import { getApiErrorMessage } from "@/lib/apiError";
import { SPC_FEEDBACK_BONUS_BY_STARS } from "@/lib/sphinx";
import type { AuthUser } from "@/types/auth";
import type { SpcListing, FeedbackSummary } from "@/types/sphinx";

export function SpcFeedbackPanel({
  listing,
  viewer,
}: {
  listing: SpcListing;
  viewer: AuthUser | null;
}) {
  const [data, setData] = useState<FeedbackSummary | null>(null);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isCreator = viewer && listing && viewer.id === listing.creatorId;
  const canSubmit = !!viewer && !isCreator && !listing.bodyLocked; // bodyLocked=false implies purchased
  const load = async () => {
    try {
      const res = await sphinxService.getFeedback(listing.id);
      setData(res.data);
    } catch {
      setData(null);
    }
  };
  useEffect(() => {
    load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [listing.id]);
  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await sphinxService.submitFeedback(listing.id, stars, comment);
      setComment("");
      load();
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, "Failed to submit feedback."));
    } finally {
      setBusy(false);
    }
  };
  const alreadyLeft = !!data?.mine;
  return (
    <div
      className="glass-card p-5 rounded-xl border border-primary/15 space-y-4"
      data-testid="panel-spc-feedback"
    >
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-primary" />
        <h3 className="font-display font-bold text-sm text-primary tracking-wider uppercase">
          Buyer Feedback
        </h3>
        {data && data.count > 0 && (
          <span className="font-mono text-[11px] text-muted-foreground">
            ★ {data.average.toFixed(1)} · {data.count} review
            {data.count === 1 ? "" : "s"}
          </span>
        )}
      </div>
      {!viewer && (
        <p className="font-mono text-[11px] text-muted-foreground">
          Sign in to view and leave feedback.
        </p>
      )}
      {viewer && !canSubmit && !alreadyLeft && (
        <p className="font-mono text-[11px] text-muted-foreground">
          {isCreator
            ? "You are the creator — feedback comes from your buyers."
            : "Purchase this SPC to leave feedback."}
        </p>
      )}
      {viewer && canSubmit && !alreadyLeft && (
        <div className="space-y-2">
          <div className="flex items-center gap-1" data-testid="row-star-input">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setStars(n)}
                data-testid={`button-star-${n}`}
                className={`p-1 transition-colors ${n <= stars ? "text-yellow-400" : "text-muted-foreground/40"}`}
              >
                <Star
                  className="h-5 w-5"
                  fill={n <= stars ? "currentColor" : "none"}
                />
              </button>
            ))}
            <span className="font-mono text-[11px] text-muted-foreground ml-2">
              Bonus to creator:{" "}
              {SPC_FEEDBACK_BONUS_BY_STARS[stars as 1 | 2 | 3 | 4 | 5]} credits
            </span>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="What worked, what could be sharper? (optional)"
            data-testid="input-feedback-comment"
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
          />
          {error && (
            <p
              className="font-mono text-[11px] text-destructive"
              data-testid="text-feedback-error"
            >
              {error}
            </p>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={submit}
            data-testid="button-submit-feedback"
            className="px-4 py-2 rounded-lg bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30 font-mono text-xs uppercase tracking-widest disabled:opacity-50"
          >
            {busy ? "Submitting…" : "Submit Feedback"}
          </button>
        </div>
      )}
      {alreadyLeft && data?.mine && (
        <div
          className="p-3 rounded-lg bg-primary/5 border border-primary/20"
          data-testid="row-feedback-mine"
        >
          <div className="flex items-center gap-1 mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${i < data.mine!.stars ? "text-yellow-400 fill-current" : "text-muted-foreground/30"}`}
              />
            ))}
            <span className="font-mono text-[10px] text-muted-foreground ml-2 uppercase tracking-wider">
              Your review
            </span>
          </div>
          {data.mine.comment && (
            <p className="font-mono text-xs text-muted-foreground">
              {data.mine.comment}
            </p>
          )}
        </div>
      )}
      {data && data.recent.length > 0 && (
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
            Recent reviews
          </p>
          {data.recent.map((r) => (
            <div
              key={r.id}
              className="p-3 rounded-lg bg-white/5 border border-white/10"
              data-testid={`row-feedback-${r.id}`}
            >
              <div className="flex items-center gap-1 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < r.stars ? "text-yellow-400 fill-current" : "text-muted-foreground/30"}`}
                  />
                ))}
                <span className="font-mono text-[10px] text-muted-foreground ml-2">
                  {r.buyerName || "Buyer"}
                </span>
              </div>
              {r.comment && (
                <p className="font-mono text-xs text-muted-foreground">
                  {r.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      {data && data.count === 0 && (
        <p className="font-mono text-[11px] text-muted-foreground/70">
          No feedback yet — be the first to review.
        </p>
      )}
    </div>
  );
}
