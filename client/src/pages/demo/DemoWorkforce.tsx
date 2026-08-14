import { Users, TrendingUp, ShieldAlert, Lock, Building2 } from "lucide-react";
import { DemoHelperCallout } from "@/components/demo/DemoHelperCallout";
import { cn } from "@/lib/utils";

const WORKFORCE_DEPTS = [
  { dept: "Engineering", headcount: 142, avgJst: 218, vuln: "Resilient", color: "text-emerald-400" },
  { dept: "Product", headcount: 38, avgJst: 234, vuln: "Flourishing", color: "text-cyan-400" },
  { dept: "Marketing", headcount: 67, avgJst: 162, vuln: "Exposed", color: "text-amber-400" },
  { dept: "Operations", headcount: 91, avgJst: 138, vuln: "Critical", color: "text-rose-400" },
  { dept: "Sales", headcount: 124, avgJst: 174, vuln: "Vulnerable", color: "text-orange-400" },
  { dept: "Finance", headcount: 29, avgJst: 191, vuln: "Resilient", color: "text-emerald-400" },
];

const WORKFORCE_VULN_MIX = [
  { label: "Flourishing", pct: 14, color: "bg-cyan-400" },
  { label: "Resilient", pct: 31, color: "bg-emerald-400" },
  { label: "Exposed", pct: 28, color: "bg-amber-400" },
  { label: "Vulnerable", pct: 19, color: "bg-orange-400" },
  { label: "Critical", pct: 8, color: "bg-rose-400" },
];

export default function DemoWorkforce() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
      {/* Top Helper Callout */}
      <DemoHelperCallout
        stepLabel="Step 5 of 7 · Enterprise Analytics (Skipped)"
        title="Workforce Intelligence"
        subtitle="Enterprise Dashboard — org-wide AI vulnerability rollups"
        description="Monitor aggregated skills, average JST scores, and AI vulnerability classifications across departments. Spot roles and teams that are close to automation displacement, and optimize upskilling resources where ROI is highest."
        takeaways={[
          "Aggregates all employee JST and CCMI profiles in one place",
          "Surfaces concentrated department-level AI exposure risk heatmaps",
          "Connects directly with cohorts and team learning challenges"
        ]}
      />

      {/* Locked Overlay */}
      <div className="absolute inset-x-0 bottom-0 top-[220px] z-20 flex flex-col items-center justify-center p-6 bg-background/60 backdrop-blur-md border border-white/10 rounded-xl">
        <div className="glass-card max-w-md p-6 text-center border border-primary/30 shadow-[0_0_50px_rgba(68,136,255,0.15)] bg-black/80">
          <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-display font-bold text-lg text-white mb-2 uppercase tracking-wide">Enterprise Module Preview</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-5">
            Workforce Intelligence is a premium enterprise feature designed for HR, Operations, and Cohort Administrators. It is skipped in the individual guided tour.
          </p>
          <a
            href="/signup"
            className="inline-block w-full text-center px-4 py-2.5 rounded-lg bg-primary text-background hover:bg-primary/90 font-mono text-xs uppercase tracking-widest transition-all"
          >
            Create Sandbox Account
          </a>
        </div>
      </div>

      {/* Mock Page Content (Grayed/Locked visual) */}
      <div className="opacity-30 pointer-events-none select-none space-y-6">
        <div className="border-b border-white/10 pb-6">
          <h2 className="text-3xl font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Building2 className="h-7 w-7 text-primary" /> Workforce Analytics
          </h2>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            Enterprise rollups for Atlas Logistics.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="glass-card p-4 rounded-xl border border-white/10">
            <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Total Headcount</div>
            <div className="text-2xl font-display font-bold text-white">491</div>
          </div>
          <div className="glass-card p-4 rounded-xl border border-white/10">
            <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Org Avg JST</div>
            <div className="text-2xl font-display font-bold text-white">186/300</div>
          </div>
          <div className="glass-card p-4 rounded-xl border border-white/10">
            <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Vulnerable Ratio</div>
            <div className="text-2xl font-display font-bold text-rose-400">27%</div>
          </div>
        </div>

        <div className="glass-card rounded-xl border border-white/10 p-5">
          <h3 className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-4">Department Heatmap</h3>
          <div className="space-y-3">
            {WORKFORCE_DEPTS.map((d) => {
              const pct = Math.round((d.avgJst / 300) * 100);
              return (
                <div key={d.dept} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-3 font-display text-sm text-white">{d.dept}</div>
                  <div className="col-span-7 h-4 bg-background/40 rounded overflow-hidden border border-white/10">
                    <div
                      className={cn(
                        "h-full",
                        pct >= 70 ? "bg-emerald-400" : pct >= 55 ? "bg-amber-400" : "bg-rose-400"
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="col-span-2 text-right font-mono text-xs">
                    <span className="text-white">{d.avgJst}</span>{" "}
                    <span className={d.color}>· {d.vuln}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card rounded-xl border border-white/10 p-5">
          <h3 className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-4">
            Vulnerability Mix (org-wide)
          </h3>
          <div className="flex h-6 rounded overflow-hidden border border-white/10">
            {WORKFORCE_VULN_MIX.map((v) => (
              <div key={v.label} className={cn("h-full", v.color)} style={{ width: `${v.pct}%` }} />
            ))}
          </div>
          <div className="grid grid-cols-5 gap-2 mt-3">
            {WORKFORCE_VULN_MIX.map((v) => (
              <div key={v.label} className="flex items-center gap-2 text-[11px]">
                <span className={cn("w-3 h-3 rounded", v.color)} />
                <span className="text-muted-foreground">{v.label}</span>
                <span className="text-white font-mono">{v.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
