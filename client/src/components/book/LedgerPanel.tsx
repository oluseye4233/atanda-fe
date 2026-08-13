import { Trophy, Loader2, CheckCircle2 } from "lucide-react";
import type { LedgerView } from "@/types/book";
import { DeltaPill } from "@/components/book/ChapterCard";

interface LedgerPanelProps {
  ledger: LedgerView;
  capturing: boolean;
  onCaptureFinal: () => void;
}

const LEDGER_ROWS = [
  { key: "jstIndex", label: "JST Index" },
  { key: "ccmi", label: "CCMI" },
  { key: "arkScore", label: "ARK Score" },
] as const;

export function LedgerPanel({ ledger, capturing, onCaptureFinal }: LedgerPanelProps) {
  return (
    <div className="glass-card border border-primary/40 rounded-xl p-6" data-testid="panel-ledger">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-primary" />
        <h3 className="font-display font-bold text-lg text-white uppercase tracking-widest">Digital Ledger</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {LEDGER_ROWS.map((row) => (
          <div key={row.key} className="border border-white/10 rounded-lg p-4" data-testid={`ledger-${row.key}`}>
            <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">{row.label}</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-2xl font-black text-primary">{ledger.current[row.key]}</span>
              {ledger.delta && <DeltaPill value={ledger.delta[row.key]} />}
            </div>
            <div className="text-[11px] font-mono text-muted-foreground mt-2">
              Baseline: {ledger.baseline ? ledger.baseline[row.key] : "—"} · Final: {ledger.final ? ledger.final[row.key] : "—"}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-5">
        <p className="text-sm text-muted-foreground">
          {ledger.baseline
            ? "Your baseline was captured at your first assessment. Close the loop by capturing your final snapshot."
            : "Run your résumé assessment first to capture an immutable baseline."}
        </p>
        <button
          onClick={onCaptureFinal}
          disabled={capturing || !ledger.baseline}
          className="inline-flex items-center justify-center gap-2 border border-secondary/50 text-secondary hover:bg-secondary/10 disabled:opacity-40 disabled:cursor-not-allowed font-mono text-xs uppercase tracking-widest h-10 px-4 rounded-md"
          data-testid="button-capture-final"
        >
          {capturing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Capture Final Snapshot
        </button>
      </div>
    </div>
  );
}
