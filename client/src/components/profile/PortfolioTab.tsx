import { JnomicsCardList } from "@/components/dashboard/JnomicsCardList";
import { GuinProfileView } from "@/pages/guin-public";
import { Link } from "react-router-dom";
import type { GuinProfile } from "@/types/guin";

interface PortfolioTabProps {
  matchedCardIds: string[] | null;
  guin: GuinProfile | null;
  onLoadGuin: () => Promise<void>;
}

export function PortfolioTab({ matchedCardIds, guin, onLoadGuin: loadGuin }: PortfolioTabProps) {
  return (
    <div className="space-y-6">
      {matchedCardIds !== null && (
        <div className="pt-4 border-t border-white/5" data-testid="section-card-portfolio">
          <div className="mb-4">
            <h2 className="text-xl font-display font-bold text-white uppercase tracking-widest">
              My Junglenomics Card Portfolio
            </h2>
            <p className="text-xs font-mono text-muted-foreground mt-1">
              Your detected skillsets, mapped to FORGE Library cards. Flip any card to see its tier rationale.
            </p>
          </div>
          {matchedCardIds.length === 0 ? (
            <div className="glass-card p-8 rounded-xl text-center" data-testid="text-no-portfolio">
              <p className="font-mono text-sm text-muted-foreground uppercase">
                No card portfolio yet.
              </p>
              <p className="text-xs font-mono text-muted-foreground mt-2">
                Upload your CV or run an assessment to map your skills to Junglenomics cards.
              </p>
              <Link
                to="/upload"
                className="inline-block mt-4 px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-colors"
                data-testid="link-upload-cv"
              >
                Upload CV →
              </Link>
            </div>
          ) : (
            <JnomicsCardList matchedCardIds={matchedCardIds} />
          )}
        </div>
      )}
      {guin && (
        <div className="pt-4 border-t border-white/5">
          <GuinProfileView profile={guin} viewerCanEndorse={false} onEndorse={loadGuin} />
        </div>
      )}
    </div>
  );
}