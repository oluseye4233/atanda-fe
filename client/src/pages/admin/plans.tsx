import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { plansService } from "@/services/plans.service";
import type { Plan, PlanRule } from "@/types/plans";
import { ErrorAlert } from "@/components/admin/ErrorAlert";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PaginationControls } from "@/components/admin/PaginationControls";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const PAGE_SIZE = 10;

export const RULE_FIELDS: { key: keyof PlanRule; label: string }[] = [
  { key: "jstScore", label: "JST Score" },
  { key: "fullDashboard", label: "Full Dashboard" },
  { key: "careerPathways", label: "Career Pathways" },
  { key: "forgeCards", label: "Forge Cards" },
  { key: "executiveReport", label: "Executive Report" },
  { key: "contextCraft", label: "Context Craft" },
  { key: "workforceIntel", label: "Workforce Intel" },
  { key: "institutionDashboard", label: "Institution Dashboard" },
  { key: "prioritySupport", label: "Priority Support" },
];

interface PlanFormState {
  title: string;
  description: string;
  freeTrial: boolean;
  features: string[];
  monthlyPrice: string;
  yearlyPrice: string;
  stripeMonthlyId: string;
  stripeYearlyId: string;
  resumeUploadsUnlimited: boolean;
  resumeUploads: number;
  rules: Record<string, boolean>;
}

const EMPTY_FORM: PlanFormState = {
  title: "",
  description: "",
  freeTrial: false,
  features: [],
  monthlyPrice: "",
  yearlyPrice: "",
  stripeMonthlyId: "",
  stripeYearlyId: "",
  resumeUploadsUnlimited: false,
  resumeUploads: 1,
  rules: Object.fromEntries(RULE_FIELDS.map((f) => [f.key, false])),
};

function FeatureTagInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (features: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (!value.includes(trimmed)) onChange([...value, trimmed]);
    setDraft("");
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={draft}
          placeholder="Add a feature and press Enter"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={add}>
          Add
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((feature) => (
            <span
              key={feature}
              className="inline-flex items-center gap-1 rounded border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-mono text-white"
            >
              {feature}
              <button
                type="button"
                aria-label={`Remove ${feature}`}
                onClick={() => onChange(value.filter((f) => f !== feature))}
                className="text-muted-foreground hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function toForm(plan: Plan): PlanFormState {
  const rule = plan.planRule;
  return {
    title: plan.title,
    description: plan.description ?? "",
    freeTrial: plan.freeTrial,
    features: plan.features,
    monthlyPrice: plan.monthlyPrice,
    yearlyPrice: plan.yearlyPrice,
    stripeMonthlyId: plan.stripeMonthlyId ?? "",
    stripeYearlyId: plan.stripeYearlyId ?? "",
    resumeUploadsUnlimited: rule.resumeUploads === "unlimited",
    resumeUploads: typeof rule.resumeUploads === "number" ? rule.resumeUploads : 1,
    rules: Object.fromEntries(
      RULE_FIELDS.map((f) => [f.key, Boolean(rule[f.key])]),
    ),
  };
}

export default function AdminPlans() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PlanFormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "plans", { page }],
    queryFn: async () => (await plansService.list({ page, pageSize: PAGE_SIZE })).data,
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setEditorOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setEditingId(plan.id);
    setForm(toForm(plan));
    setEditorOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) {
      toast({ title: "Missing title", description: "A plan title is required.", variant: "destructive" });
      return;
    }
    const rule: PlanRule = {
      resumeUploads: form.resumeUploadsUnlimited ? "unlimited" : form.resumeUploads,
      jstScore: form.rules.jstScore,
      fullDashboard: form.rules.fullDashboard,
      careerPathways: form.rules.careerPathways,
      forgeCards: form.rules.forgeCards,
      executiveReport: form.rules.executiveReport,
      contextCraft: form.rules.contextCraft,
      workforceIntel: form.rules.workforceIntel,
      institutionDashboard: form.rules.institutionDashboard,
      prioritySupport: form.rules.prioritySupport,
    };
    const body = {
      title: form.title,
      description: form.description || undefined,
      freeTrial: form.freeTrial,
      features: form.features,
      planRule: rule,
      monthlyPrice: form.monthlyPrice,
      yearlyPrice: form.yearlyPrice,
      stripeMonthlyId: form.stripeMonthlyId || undefined,
      stripeYearlyId: form.stripeYearlyId || undefined,
    };
    setIsSaving(true);
    try {
      if (editingId) {
        await plansService.update(editingId, body);
        toast({ title: "Plan updated", description: form.title });
      } else {
        await plansService.create(body);
        toast({ title: "Plan created", description: form.title });
      }
      setEditorOpen(false);
      qc.invalidateQueries({ queryKey: ["admin", "plans"] });
    } catch (err) {
      toast({ title: "Save failed", description: String(err), variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await plansService.remove(deleteTarget.id);
      toast({ title: "Plan deleted", description: deleteTarget.title });
      qc.invalidateQueries({ queryKey: ["admin", "plans"] });
      setDeleteTarget(null);
    } catch (err) {
      toast({ title: "Delete failed", description: String(err), variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Plans</h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            Pricing plans and their entitlements.
          </p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" /> New plan
        </Button>
      </header>

      <ErrorAlert message={error ? String(error) : undefined} />

      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            All plans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Monthly</TableHead>
                <TableHead>Yearly</TableHead>
                <TableHead>Trial</TableHead>
                <TableHead>Features</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground font-mono">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground font-mono">
                    No plans found.
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((plan) => (
                  <TableRow
                    key={plan.id}
                    className="cursor-pointer hover:bg-primary/5"
                    onClick={() => navigate(`/plans/${plan.id}`)}
                  >
                    <TableCell className="font-medium text-white">{plan.title}</TableCell>
                    <TableCell className="font-mono text-xs">${plan.monthlyPrice}</TableCell>
                    <TableCell className="font-mono text-xs">${plan.yearlyPrice}</TableCell>
                    <TableCell>
                      <StatusBadge status={plan.freeTrial ? "active" : "inactive"} />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{plan.features.length}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(plan);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(plan);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {data && (
            <PaginationControls
              className="mt-4"
              page={page}
              pageSize={PAGE_SIZE}
              total={data.total}
              onPageChange={setPage}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit plan" : "Create plan"}</DialogTitle>
            <DialogDescription className="font-mono text-xs">
              Configure pricing and entitlements.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="plan-title">Title</Label>
                <Input
                  id="plan-title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="plan-desc">Description</Label>
                <Input
                  id="plan-desc"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Features</Label>
              <FeatureTagInput
                value={form.features}
                onChange={(features) => setForm((f) => ({ ...f, features }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="plan-monthly">Monthly price</Label>
                <Input
                  id="plan-monthly"
                  value={form.monthlyPrice}
                  onChange={(e) => setForm((f) => ({ ...f, monthlyPrice: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="plan-yearly">Yearly price</Label>
                <Input
                  id="plan-yearly"
                  value={form.yearlyPrice}
                  onChange={(e) => setForm((f) => ({ ...f, yearlyPrice: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="plan-stripe-m">Stripe monthly ID</Label>
                <Input
                  id="plan-stripe-m"
                  value={form.stripeMonthlyId}
                  onChange={(e) => setForm((f) => ({ ...f, stripeMonthlyId: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="plan-stripe-y">Stripe yearly ID</Label>
                <Input
                  id="plan-stripe-y"
                  value={form.stripeYearlyId}
                  onChange={(e) => setForm((f) => ({ ...f, stripeYearlyId: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="plan-trial"
                checked={form.freeTrial}
                onCheckedChange={(v) => setForm((f) => ({ ...f, freeTrial: Boolean(v) }))}
              />
              <Label htmlFor="plan-trial">Free trial available</Label>
            </div>

            <div className="space-y-1.5">
              <Label>Resume uploads</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="plan-uploads-unlimited"
                    checked={form.resumeUploadsUnlimited}
                    onCheckedChange={(v) =>
                      setForm((f) => ({ ...f, resumeUploadsUnlimited: Boolean(v) }))
                    }
                  />
                  <Label htmlFor="plan-uploads-unlimited">Unlimited</Label>
                </div>
                {!form.resumeUploadsUnlimited && (
                  <Input
                    type="number"
                    min={0}
                    className="w-24"
                    value={form.resumeUploads}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, resumeUploads: Number(e.target.value) }))
                    }
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Entitlements</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {RULE_FIELDS.map((field) => (
                  <div key={field.key} className="flex items-center gap-2">
                    <Checkbox
                      id={`rule-${field.key}`}
                      checked={form.rules[field.key]}
                      onCheckedChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          rules: { ...f.rules, [field.key]: Boolean(v) },
                        }))
                      }
                    />
                    <Label htmlFor={`rule-${field.key}`}>{field.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving…" : editingId ? "Save changes" : "Create plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete plan"
        description={`This permanently deletes ${deleteTarget?.title ?? "this plan"}.`}
        confirmText="Delete"
        destructive
        isConfirming={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
