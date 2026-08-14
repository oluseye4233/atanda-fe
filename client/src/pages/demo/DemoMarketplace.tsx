import React, { useState } from "react";
import { Coins, Search, Building2, Star, Store, Lock, X, Crown, Award } from "lucide-react";
import { formatPriceUsd } from "@/lib/sphinx";
import { DemoHelperCallout } from "@/components/demo/DemoHelperCallout";
import { Button } from "@/components/ui/button";

// Safe local tier helpers — avoids the TIER_VISUALS key mismatch in the shared badges component
function tierFromHive(hive: number): { label: string; color: string; border: string; bg: string } {
  if (hive >= 90) return { label: "Platinum", color: "#AA44FF", border: "border-purple-400/40", bg: "bg-purple-500/10" };
  if (hive >= 80) return { label: "Gold",     color: "#FFC857", border: "border-amber-400/40",  bg: "bg-amber-400/10"  };
  if (hive >= 70) return { label: "Silver",   color: "#9BB7C7", border: "border-slate-300/30",   bg: "bg-slate-300/10"  };
  if (hive >= 60) return { label: "Bronze",   color: "#CD7F32", border: "border-orange-400/30",  bg: "bg-orange-400/10" };
  return           { label: "Ungraded",        color: "#888",    border: "border-white/10",       bg: "bg-white/5"       };
}

function gradeFromHive(hive: number): { grade: string; color: string } {
  if (hive >= 95) return { grade: "A+", color: "#AA44FF" };
  if (hive >= 90) return { grade: "A",  color: "#AA44FF" };
  if (hive >= 85) return { grade: "A-", color: "#44AA44" };
  if (hive >= 80) return { grade: "B+", color: "#44AA44" };
  if (hive >= 75) return { grade: "B",  color: "#4488FF" };
  if (hive >= 70) return { grade: "B-", color: "#4488FF" };
  if (hive >= 65) return { grade: "C+", color: "#FFDD00" };
  if (hive >= 60) return { grade: "C",  color: "#FFDD00" };
  return           { grade: "F",        color: "#FF4444" };
}

function DemoTierBadge({ hive }: { hive: number }) {
  const t = tierFromHive(hive);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-mono uppercase tracking-wider border px-2 py-0.5 text-[10px] ${t.bg} ${t.border}`}
      style={{ color: t.color }}
    >
      <Crown className="h-3 w-3" /> {t.label}
    </span>
  );
}

function DemoGradeChip({ hive }: { hive: number }) {
  const { grade, color } = gradeFromHive(hive);
  return (
    <div
      className="h-10 w-10 flex items-center justify-center rounded-md font-display font-bold border text-xl"
      style={{ color, borderColor: `${color}55`, backgroundColor: `${color}15` }}
    >
      {grade}
    </div>
  );
}

function DemoPillarBadge({ pillar }: { pillar: string }) {
  return (
    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-white/5 text-muted-foreground border border-white/10">
      {pillar}
    </span>
  );
}

const MOCK_LISTINGS = [
  {
    id: "spc-1",
    title: "Investor Update — Series A Operator's Template",
    description: "Battle-tested monthly update structure used by 30+ portfolio cos. Hits MRR, runway, key risks, hiring, and product updates.",
    price: 2500, // in credits (2500 cr = $25.00)
    hiveScore: 92,
    pillar: "SuperPrompt",
    creator: "@elena_vc",
    rating: 4.9,
    purchases: 412,
  },
  {
    id: "spc-2",
    title: "Cardiology Discharge Note Synthesizer",
    description: "Converts EHR fragments into a patient-friendly discharge summary. HIPAA-aware guardrails baked in to protect sensitive records.",
    price: 1800,
    hiveScore: 84,
    pillar: "Constraint",
    creator: "@dr_amir",
    rating: 4.7,
    purchases: 287,
  },
  {
    id: "spc-3",
    title: "Enterprise RFP Decomposer",
    description: "Breaks a 60-page RFP into a structured response plan with owner suggestions and risk flags automatically tagged.",
    price: 2000,
    hiveScore: 86,
    pillar: "Format",
    creator: "@rfp_killer",
    rating: 4.8,
    purchases: 356,
  },
  {
    id: "spc-4",
    title: "Legal Contract Clausifier",
    description: "Extracts indemnification and termination clauses into structured key-value pairs for quick paralegal reviews.",
    price: 1500,
    hiveScore: 78,
    pillar: "Data",
    creator: "@legal_eagle",
    rating: 4.5,
    purchases: 198,
  },
];

const MOCK_CORPORATE = [
  { id: "corp-1", title: "Atlas Logistics — Q3 OKR Synthesizer", scope: "CORPORATE", price: 0, stars: 4.8, feedbackCount: 27 },
  { id: "corp-2", title: "Atlas — Vendor Security Review Drafter", scope: "CORPORATE", price: 0, stars: 4.6, feedbackCount: 14 },
  { id: "corp-3", title: "Atlas — Incident Post-Mortem Template", scope: "BOTH", price: 800, stars: 4.9, feedbackCount: 41 },
];

function SectionExplanation({ text }: { text: string }) {
  return (
    <div className="p-3 bg-primary/5 border-l-2 border-primary text-xs text-muted-foreground font-mono leading-relaxed mt-3 rounded-r">
      <span className="text-primary font-bold uppercase tracking-wider">Guide · </span>{text}
    </div>
  );
}

export default function DemoMarketplace() {
  const [selectedListing, setSelectedListing] = useState<typeof MOCK_LISTINGS[0] | null>(null);
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [credits, setCredits] = useState(5000); // 5000 cr baseline

  const handleBuy = (listing: typeof MOCK_LISTINGS[0]) => {
    if (credits >= listing.price) {
      setCredits(credits - listing.price);
      setPurchasedIds([...purchasedIds, listing.id]);
      setSelectedListing(null);
      alert(`Success! You purchased "${listing.title}" for ${listing.price} cr.`);
    } else {
      alert("Insufficient credits in demo mode!");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Top Helper Callout */}
      <DemoHelperCallout
        stepLabel="Step 3 of 7 · SPHINX Marketplace"
        title="SPHINX Marketplace"
        subtitle="SUPER PROMPT CARDS // CREATOR/PLATFORM SPLIT 70/30"
        description="A decentralized repository for verified prompt templates (Super Prompt Cards). Once certified at CC-400 (Gold) or above, creators can publish templates with a server-side check. Buyers spend ARK credits; creators receive a 70% share of transaction values."
        takeaways={[
          "Enforces a HIVE quality score check prior to public release",
          "Includes organizational private shelves for enterprise security",
          "Quality ratings above 3★ reward creators with bonus minted credits"
        ]}
      />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Store className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-display font-bold text-primary tracking-widest uppercase">SPHINX Marketplace</h1>
          </div>
          <p className="text-muted-foreground font-mono text-xs">
            SUPER PROMPT CARDS // ACTIVE BALANCE: <span className="text-amber-400 font-bold">{credits} cr</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-3 rounded-lg font-mono text-xs uppercase tracking-wider bg-white/5 border border-white/10 text-muted-foreground cursor-not-allowed select-none">
            <Lock className="h-4 w-4" /> Publish SPC
          </button>
        </div>
      </div>

      {/* Mock Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
        <input
          disabled
          placeholder="Search listings... (Disabled in demo)"
          className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-3 py-3 text-white font-mono text-sm placeholder:text-muted-foreground/40 cursor-not-allowed select-none"
        />
      </div>

      {/* Grid of Listings */}
      <div>
        <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-300 mb-4 flex items-center gap-1.5">
          <Store className="h-4.5 w-4.5" /> Public Marketplace Shelf
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MOCK_LISTINGS.map((l) => {
            const tier = tierFromHive(l.hiveScore);
            const isOwned = purchasedIds.includes(l.id);
            return (
              <div
                key={l.id}
                onClick={() => setSelectedListing(l)}
                className={`group glass-card rounded-xl border transition-all hover:scale-[1.02] flex flex-col p-5 gap-3 cursor-pointer ${tier.border} hover:border-primary/45`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <DemoTierBadge hive={l.hiveScore} />
                    <DemoPillarBadge pillar={l.pillar} />
                  </div>
                  <DemoGradeChip hive={l.hiveScore} />
                </div>

                <h3 className="font-display font-bold text-base text-white leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {l.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {l.description}
                </p>

                <div className="flex items-center justify-between pt-3 mt-auto border-t border-white/5">
                  <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                    <DemoPillarBadge pillar={l.pillar} />
                    <span>by {l.creator}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-400/10 border border-amber-400/30">
                    <Coins className="h-3.5 w-3.5 text-amber-400" />
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {isOwned ? "OWNED" : formatPriceUsd(l.price)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <SectionExplanation text="Marketplace listings have letter grades (A+, A, B...) representing their HIVE score calculated from past evaluation. Click on a listing to inspect its performance scores." />
      </div>

      {/* Corporate private shelf (Atlas Logistics) */}
      <div className="glass-card rounded-xl border-2 border-fuchsia-400/30 p-6 bg-black/40">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <Building2 className="h-5 w-5 text-fuchsia-300" />
            <div>
              <h3 className="font-display text-sm uppercase tracking-widest text-white font-bold">Atlas Logistics · Private Corporate Shelf</h3>
              <p className="text-[10px] font-mono text-muted-foreground leading-none mt-1">Visible only to verified Atlas Logistics team members.</p>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded border border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-200">CLASS C · flag-gated</span>
        </div>

        <div className="space-y-3">
          {MOCK_CORPORATE.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border ${c.scope === "CORPORATE" ? "border-fuchsia-400/40 text-fuchsia-200" : "border-cyan-400/40 text-cyan-200"}`}>{c.scope}</span>
                  <span className="text-sm text-white font-medium truncate">{c.title}</span>
                </div>
                <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1.5">
                  <Star className="w-3 h-3 text-amber-300 fill-amber-300" /> {c.stars} · {c.feedbackCount} ratings
                </div>
              </div>
              <span className="font-display text-sm text-secondary shrink-0 font-bold">{c.price === 0 ? "Internal Use" : `${c.price} cr`}</span>
            </div>
          ))}
        </div>
        <SectionExplanation text="Private corporate shelves let organizations share proprietary prompt configurations securely within their intranet domain boundaries." />
      </div>

      {/* Listing inspect modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card max-w-lg w-full rounded-xl border border-primary/30 p-6 relative bg-[#0d1117] space-y-6">
            <button
              onClick={() => setSelectedListing(null)}
              className="absolute top-4 right-4 p-1 rounded-md border border-white/10 text-muted-foreground hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-4 justify-between pr-8">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <DemoTierBadge hive={selectedListing.hiveScore} />
                  <DemoPillarBadge pillar={selectedListing.pillar} />
                </div>
                <h2 className="text-xl font-display font-bold text-white leading-tight">{selectedListing.title}</h2>
                <p className="text-xs font-mono text-muted-foreground mt-1">by {selectedListing.creator}</p>
              </div>
              <DemoGradeChip hive={selectedListing.hiveScore} />
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">{selectedListing.description}</p>

            {/* Performance bars */}
            <div className="space-y-3 border-t border-white/5 pt-4">
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Performance Signatures</h4>
              {[
                { label: "Reliability", value: 92 },
                { label: "Efficiency", value: 85 },
                { label: "Execution Speed", value: 88 },
              ].map((bar) => (
                <div key={bar.label}>
                  <div className="flex justify-between text-xs font-mono text-muted-foreground">
                    <span>{bar.label}</span>
                    <span>{bar.value}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-primary" style={{ width: `${bar.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4 border-t border-white/5">
              <Button variant="outline" onClick={() => setSelectedListing(null)} className="flex-1 font-mono uppercase text-xs">
                Cancel
              </Button>
              <Button
                onClick={() => handleBuy(selectedListing)}
                disabled={purchasedIds.includes(selectedListing.id)}
                className="flex-1 font-mono uppercase text-xs bg-primary text-background"
              >
                {purchasedIds.includes(selectedListing.id)
                  ? "Purchased"
                  : `Purchase (${selectedListing.price} cr)`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
