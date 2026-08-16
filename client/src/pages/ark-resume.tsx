import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Lock, FileText, FileImage, FileType2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/useAuth";
import { useSubscription } from "@/lib/useSubscription";
import { getApiErrorMessage } from "@/lib/apiError";
import { arkResumeService, type ArkResume } from "@/services/ark-resume.service";
import { featureFlagsService } from "@/services/feature-flags.service";
import { Link } from "react-router-dom";
import { resumeFileStamp, exportResumePdf, exportResumeImage } from "@/lib/arkResumeExport";
import { ResumeSheet, ArkResumeEmptyState, toExportData } from "@/components/ark-resume";

export default function ArkResumePage() {
  const { user } = useAuth();
  const { canAccessArkResume } = useSubscription();

  const flags = useQuery({
    queryKey: ["feature-flags"],
    queryFn: async () => (await featureFlagsService.getAll()).data,
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const [resume, setResume] = useState<{
    data: ArkResume | null;
    loading: boolean;
    error: string | null;
  }>({ data: null, loading: true, error: null });
  const [exporting, setExporting] = useState<null | "pdf" | "png" | "jpeg">(null);

  const sheetRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setResume((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { data: arkResume } = await arkResumeService.getResume();
      setResume({ data: arkResume, loading: false, error: null });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const fallback =
        status === 404
          ? "ARK Résumé is currently disabled (feature flag off)."
          : "Unable to load your ARK Resume.";
      setResume({
        data: null,
        loading: false,
        error: getApiErrorMessage(err, fallback),
      });
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    if (flags.data?.ark_resume === false) return;
    load();
  }, [user, flags.data, load]);

  const handleExportPdf = async () => {
    if (!resume.data) return;
    setExporting("pdf");
    try {
      await exportResumePdf(toExportData(resume.data), resumeFileStamp(resume.data.user.name));
    } catch {
      /* ignored */
    } finally {
      setExporting(null);
    }
  };

  const handleExportImage = async (type: "png" | "jpeg") => {
    const el = sheetRef.current;
    if (!el || !resume.data) return;
    setExporting(type);
    try {
      await exportResumeImage(el, type, resumeFileStamp(resume.data.user.name));
    } catch {
      /* ignored */
    } finally {
      setExporting(null);
    }
  };

  if (flags.isLoading || (!flags.data && flags.isFetching)) {
    return (
      <div className="w-full max-w-4xl mx-auto min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="font-mono text-sm text-muted-foreground uppercase">Loading…</p>
      </div>
    );
  }

  if (flags.data && !flags.data.ark_resume) {
    return (
      <div
        className="w-full max-w-2xl mx-auto min-h-[60vh] flex flex-col items-center justify-center text-center px-6"
        data-testid="ark-resume-disabled"
      >
        <Lock className="w-12 h-12 text-primary mb-4" />
        <h2 className="text-2xl font-display font-bold text-white mb-2">ARK Résumé is disabled</h2>
        <p className="font-mono text-sm text-muted-foreground mb-6 max-w-lg">
          The <code className="text-primary">ark_resume</code> feature flag is off. Enable it to use
          this surface.
        </p>
      </div>
    );
  }

  if (resume.loading) {
    return (
      <div className="w-full max-w-4xl mx-auto min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="font-mono text-sm text-muted-foreground uppercase">Compiling ARK Resume…</p>
      </div>
    );
  }

  if (resume.error || !resume.data) {
    if (!canAccessArkResume) {
      return (
        <div
          className="w-full max-w-2xl mx-auto min-h-[60vh] flex flex-col items-center justify-center text-center px-6"
          data-testid="ark-resume-locked"
        >
          <Lock className="w-12 h-12 text-primary mb-4" />
          <h2 className="text-2xl font-display font-bold text-white mb-2">ARK RESUME is locked</h2>
          <p className="font-mono text-sm text-muted-foreground mb-6 max-w-lg">
            Upgrade to Pro (or higher) to unlock your ARK Resume.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/subscription"
              className="inline-flex items-center justify-center bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest h-10 px-4 rounded-md"
              data-testid="link-upgrade"
            >
              Upgrade Plan
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center border border-primary/50 text-primary hover:bg-primary/10 font-mono text-xs uppercase tracking-widest h-10 px-4 rounded-md"
              data-testid="link-verify-cards"
            >
              Verify a Primitive Card
            </Link>
          </div>
        </div>
      );
    }

    return <ArkResumeEmptyState error={resume.error} hasCv={null} onRetry={load} />;
  }

  return (
    <div className="w-full max-w-5xl mx-auto pb-16">
      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">ARK RESUME</h1>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            ATS-optimized · verified-skill resume
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={handleExportPdf}
            disabled={!!exporting}
            data-testid="button-export-pdf"
          >
            {exporting === "pdf" ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <FileText className="w-4 h-4 mr-1" />
            )}
            PDF (text)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportImage("png")}
            disabled={!!exporting}
            data-testid="button-export-png"
          >
            {exporting === "png" ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <FileImage className="w-4 h-4 mr-1" />
            )}
            PNG
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportImage("jpeg")}
            disabled={!!exporting}
            data-testid="button-export-jpeg"
          >
            {exporting === "jpeg" ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <FileType2 className="w-4 h-4 mr-1" />
            )}
            JPEG
          </Button>
        </div>
      </div>

      <ResumeSheet ref={sheetRef} data={resume.data} />
    </div>
  );
}
