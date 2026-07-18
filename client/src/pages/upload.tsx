import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { FileText, ClipboardList, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { ResumeDropzone } from "@/components/upload/ResumeDropzone";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { resumeService } from "@/services/resume.service";
import { getApiErrorMessage } from "@/lib/apiError";
import { useToast } from "@/hooks/use-toast";

type Mode = "file" | "text";

const MODES: Array<{ key: Mode; label: string; sub: string; icon: React.ElementType }> = [
  { key: "file", label: "Upload File", sub: "PDF · DOCX · TXT", icon: FileText },
  { key: "text", label: "Paste Text", sub: "Copy from anywhere", icon: ClipboardList },
];

const MIN_TEXT = 40;

export default function UploadPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [mode, setMode] = useState<Mode>("file");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = mode === "file" ? !!file : text.trim().length >= MIN_TEXT;

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    try {
      if (mode === "file" && file) {
        await resumeService.upload(file);
      } else {
        await resumeService.analyzeText(text.trim());
      }
      // Fresh assessment + identity — invalidate the dashboard cache.
      await queryClient.invalidateQueries({ queryKey: ["ark"] });
      await queryClient.invalidateQueries({ queryKey: ["assessment"] });
      toast({
        title: "Analysis complete",
        description: "Your ARK intelligence has been updated.",
      });
      navigate("/dashboard");
    } catch (err) {
      setError(getApiErrorMessage(err, "We couldn't analyze that. Please try again."));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto min-h-[80vh] flex flex-col justify-center py-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-[11px] font-mono tracking-widest text-primary uppercase mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          Career Assessment
        </div>
        <h1 className="text-3xl font-display font-bold text-white mb-2 tracking-tight">
          Analyze your CV
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Upload your résumé or paste its contents. In under a minute you'll get your
          JST score, AI-vulnerability profile, and your highest-leverage next moves.
        </p>
      </div>

      {/* Mode switch */}
      <div className="grid grid-cols-2 gap-2 mb-6" role="tablist" aria-label="Input mode">
        {MODES.map((m) => {
          const Icon = m.icon;
          const active = mode === m.key;
          return (
            <button
              key={m.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setMode(m.key);
                setError("");
              }}
              data-testid={`tab-mode-${m.key}`}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none ${
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-white/10 bg-white/2 text-muted-foreground hover:border-white/30 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <div className="min-w-0">
                <p className="font-display text-sm font-semibold tracking-wide truncate">{m.label}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest opacity-70 truncate">{m.sub}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="glass-card rounded-2xl p-6 border-white/10 space-y-5">
        {error && <AuthAlert message={error} />}

        {mode === "file" ? (
          <ResumeDropzone file={file} onFile={setFile} disabled={isSubmitting} />
        ) : (
          <div>
            <label htmlFor="resume-text" className="block text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
              Résumé text
            </label>
            <textarea
              id="resume-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isSubmitting}
              rows={12}
              placeholder="Paste your full résumé or profile summary here…"
              data-testid="textarea-resume"
              className="w-full rounded-xl border border-white/10 bg-white/2 px-4 py-3 text-sm text-white placeholder:text-muted-foreground/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus:border-primary/50 transition-all resize-y disabled:opacity-50"
            />
            <p className="mt-1.5 text-[11px] font-mono text-muted-foreground/60">
              {text.trim().length < MIN_TEXT
                ? `At least ${MIN_TEXT} characters (${text.trim().length}/${MIN_TEXT})`
                : `${text.trim().length} characters`}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          data-testid="button-analyze"
          className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 0 20px hsl(188 86% 53% / 0.2)" }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="font-mono text-xs tracking-wider">Analyzing…</span>
            </>
          ) : (
            <>
              Run analysis
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      <p className="mt-4 text-center text-[11px] font-mono text-muted-foreground/40 uppercase tracking-widest">
        Your data is analyzed securely · never shared
      </p>
    </div>
  );
}
