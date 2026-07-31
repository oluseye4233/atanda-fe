import { FileText, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ArkResumeEmptyStateProps {
  error: string | null;
  hasCv: boolean | null;
  onRetry: () => void;
}

export function ArkResumeEmptyState({ error, hasCv, onRetry }: ArkResumeEmptyStateProps) {
  const canOfferUpload = hasCv === false;
  const title = canOfferUpload ? "Build your ARK Resume" : "Couldn’t load your ARK Resume";
  const message =
    error ||
    (canOfferUpload
      ? "We couldn’t load your ARK Resume yet. Upload your CV so we can generate it."
      : "We found your CV, but we couldn’t compile your ARK Resume right now. Try again in a moment.");

  return (
    <div
      className="w-full max-w-2xl mx-auto min-h-[60vh] flex flex-col items-center justify-center text-center px-6"
      data-testid="ark-resume-needs-resume"
    >
      <FileText className="w-12 h-12 text-primary mb-4" />
      <h2 className="text-2xl font-display font-bold text-white mb-2">{title}</h2>
      <p className="font-mono text-sm text-muted-foreground mb-6 max-w-lg">{message}</p>
      <div className="flex flex-wrap gap-3 justify-center">
        {canOfferUpload && (
          <Link
            to="/upload"
            className="inline-flex items-center justify-center bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest h-10 px-4 rounded-md"
            data-testid="link-upload-resume"
          >
            Upload CV
          </Link>
        )}
        <Button
          variant="outline"
          onClick={onRetry}
          className="font-mono text-xs uppercase tracking-widest h-10 px-4"
          data-testid="button-retry-arkresume"
        >
          <RotateCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    </div>
  );
}
