import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Cpu, Check } from "lucide-react";
import { aiService } from "@/services/ai.service";
import type { GeneratedScenario } from "@/types/ai";
import { ErrorAlert } from "@/components/admin/ErrorAlert";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const TIERS = ["Bronze", "Silver", "Gold", "Platinum"] as const;

type Tier = (typeof TIERS)[number];

export default function AdminAi() {
  const qc = useQueryClient();
  const [brief, setBrief] = useState("");
  const [industry, setIndustry] = useState("");
  const [role, setRole] = useState("");
  const [tierHint, setTierHint] = useState<Tier | "">("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [scenario, setScenario] = useState<GeneratedScenario | null>(null);

  const status = useQuery({
    queryKey: ["admin", "ai", "status"],
    queryFn: async () => (await aiService.getStatus()).data,
  });

  const models = useQuery({
    queryKey: ["admin", "ai", "models"],
    queryFn: async () => (await aiService.getModels()).data,
  });

  const setPreferred = async (model: string) => {
    try {
      await aiService.setModelPreference(model);
      toast({ title: "Model preference updated", description: model });
      qc.invalidateQueries({ queryKey: ["admin", "ai", "models"] });
    } catch (err) {
      toast({ title: "Update failed", description: String(err), variant: "destructive" });
    }
  };

  const handleGenerate = async () => {
    if (!brief.trim()) {
      toast({ title: "Missing brief", description: "A scenario brief is required.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const res = await aiService.generateScenario({
        brief,
        industry: industry || undefined,
        role: role || undefined,
        tierHint: (tierHint as Tier) || undefined,
      });
      setScenario(res.data);
    } catch (err) {
      toast({ title: "Generation failed", description: String(err), variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">AI Tools</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          Budget, model preference, and scenario generation.
        </p>
      </header>

      <ErrorAlert message={status.error || models.error ? String(status.error || models.error) : undefined} />

      <Card className="glass-card border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            AI budget
          </CardTitle>
          <Sparkles className="h-4 w-4 text-primary/70" />
        </CardHeader>
        <CardContent>
          {status.isLoading ? (
            <Skeleton className="h-8 w-48" />
          ) : status.error ? (
            <p className="text-sm text-destructive font-mono">Could not load AI status.</p>
          ) : status.data ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-8">
                <div>
                  <p className="text-[10px] uppercase font-mono text-muted-foreground">Usage</p>
                  <p className="text-lg font-bold text-white">
                    ${(status.data.usage.costCents / 100).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono text-muted-foreground">Remaining</p>
                  <p className="text-lg font-bold text-white">
                    ${(status.data.remaining.costCents / 100).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-mono text-muted-foreground">Guardrail</p>
                  <p className="text-lg font-bold text-white">
                    {status.data.guardrailActive ? "Active" : "Off"}
                  </p>
                </div>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min(100, status.data.ratioPct)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                {status.data.ratioPct.toFixed(1)}% of monthly cap used
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="glass-card border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Available models
          </CardTitle>
          <Cpu className="h-4 w-4 text-primary/70" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Cost tier</TableHead>
                <TableHead>Available</TableHead>
                <TableHead className="text-right">Preferred</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground font-mono">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : (
                models.data?.models.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell className="font-mono text-xs text-white">{model.id}</TableCell>
                    <TableCell>{model.provider}</TableCell>
                    <TableCell className="font-mono text-xs">{model.costTier}</TableCell>
                    <TableCell>
                      <StatusBadge status={model.available ? "active" : "inactive"} />
                    </TableCell>
                    <TableCell className="text-right">
                      {models.data?.preferred === model.id ? (
                        <span className="inline-flex items-center gap-1 text-xs font-mono text-amber-300">
                          <Check className="h-3.5 w-3.5" /> Preferred
                        </span>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!model.available}
                          onClick={() => setPreferred(model.id)}
                        >
                          Set preferred
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Generate CCGE scenario
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ai-brief">Brief</Label>
            <Textarea
              id="ai-brief"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="Describe the scenario you want generated…"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ai-industry">Industry</Label>
              <Input
                id="ai-industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ai-role">Role</Label>
              <Input id="ai-role" value={role} onChange={(e) => setRole(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Tier hint</Label>
              <Select value={tierHint} onValueChange={(value) => setTierHint(value as Tier | "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  {TIERS.map((tier) => (
                    <SelectItem key={tier} value={tier}>
                      {tier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? "Generating…" : "Generate scenario"}
          </Button>

          {scenario && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-white">{scenario.title}</h3>
                <StatusBadge status={scenario.tier} />
                <span className="text-xs font-mono text-muted-foreground">
                  Difficulty {scenario.difficulty} · {scenario.tokenBudget} tokens
                </span>
              </div>
              {scenario.industry && (
                <p className="text-xs font-mono text-muted-foreground">Industry: {scenario.industry}</p>
              )}
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{scenario.prompt}</p>
              {scenario.targetPillars.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {scenario.targetPillars.map((pillar) => (
                    <span
                      key={pillar}
                      className="rounded border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-mono text-white"
                    >
                      {pillar}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
