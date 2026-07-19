import { useState, useEffect } from "react";
import { Cpu, CheckCircle2 } from "lucide-react";
import { getApiErrorMessage } from "@/lib/apiError";
import { aiService } from "@/services/ai.service";
import type { AiModel } from "@/types/ai";

interface AiModelExtended extends AiModel {
  label: string;
  blurb: string;
  costTier: "economy" | "premium";
  allowedForPlan: boolean;
}

interface AITabProps {
  userId: string;
}

export function AITab({ userId }: AITabProps) {
  const [aiModels, setAiModels] = useState<AiModelExtended[] | null>(null);
  const [aiPreferred, setAiPreferred] = useState<string | null>(null);
  const [aiSaving, setAiSaving] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSaved, setAiSaved] = useState(false);

  const loadModels = async () => {
    try {
      const { data } = await aiService.getModels();
      setAiModels(data.models.map((model) => ({
        ...model,
        label: model.id,
        blurb: "",
        costTier: model.costTier === "economy" ? "economy" : "premium",
        allowedForPlan: true,
      })));
      setAiPreferred(data.preferred);
    } catch {
      setAiModels([]);
    }
  };

  useEffect(() => {
    loadModels();
  }, [userId]);

  const handleAiModelChange = async (value: string) => {
    const model = value === "" ? null : value;
    setAiError(null);
    setAiSaving(true);
    const prev = aiPreferred;
    setAiPreferred(model);
    try {
      await aiService.setModelPreference(model);
      setAiSaved(true);
      setTimeout(() => setAiSaved(false), 2500);
    } catch (error: unknown) {
      setAiPreferred(prev);
      setAiError(getApiErrorMessage(error, "Couldn't save the AI model preference."));
    } finally {
      setAiSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-5 rounded-xl border border-transparent" data-testid="card-ai-engine">
        <div className="flex items-center gap-3 mb-3">
          <Cpu className="h-5 w-5 text-primary" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">AI Engine</span>
          {aiSaved && <CheckCircle2 className="h-4 w-4 text-secondary ml-auto" data-testid="icon-ai-model-saved" />}
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Pick the model powering your AI features. Economy models cost fewer tokens; if your pick is ever unavailable, ARK auto-falls back so nothing breaks.
        </p>
        {aiModels === null ? (
          <p className="text-xs font-mono text-muted-foreground">Loading models…</p>
        ) : (
          <select
            value={aiPreferred ?? ""}
            onChange={(e) => handleAiModelChange(e.target.value)}
            disabled={aiSaving}
            className="w-full bg-background/60 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-primary/50 disabled:opacity-60"
            data-testid="select-ai-model"
          >
            <option value="">Auto (platform default)</option>
            <optgroup label="Economy — lowest token cost">
              {aiModels.filter(m => m.costTier === "economy").map(m => (
                <option key={m.id} value={m.id} disabled={!m.available || !m.allowedForPlan} data-testid={`option-ai-model-${m.id}`}>
                  {m.label}{!m.available ? " (offline)" : !m.allowedForPlan ? " (upgrade)" : ""}
                </option>
              ))}
            </optgroup>
            <optgroup label="Premium — deeper reasoning">
              {aiModels.filter(m => m.costTier === "premium").map(m => (
                <option key={m.id} value={m.id} disabled={!m.available || !m.allowedForPlan} data-testid={`option-ai-model-${m.id}`}>
                  {m.label}{!m.available ? " (offline)" : !m.allowedForPlan ? " (upgrade)" : ""}
                </option>
              ))}
            </optgroup>
          </select>
        )}
        {aiPreferred && aiModels && (
          <p className="text-[11px] text-muted-foreground mt-2 font-mono" data-testid="text-ai-model-blurb">
            {aiModels.find(m => m.id === aiPreferred)?.blurb}
          </p>
        )}
        {aiError && <p className="text-xs font-mono text-destructive mt-2" data-testid="text-ai-model-error">{aiError}</p>}
      </div>
    </div>
  );
}