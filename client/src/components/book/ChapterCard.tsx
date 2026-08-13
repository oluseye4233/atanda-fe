import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, CheckCircle2, ArrowUpRight, TrendingUp, TrendingDown, Minus, BookOpen } from "lucide-react";
import type { JourneyNodeView } from "@/types/book";

const TIER_RING: Record<string, string> = {
  Bronze: "border-amber-600/60 shadow-[0_0_24px_rgba(201,123,58,0.35)]",
  Silver: "border-slate-300/50 shadow-[0_0_24px_rgba(184,198,214,0.3)]",
  Gold: "border-yellow-400/60 shadow-[0_0_28px_rgba(246,196,83,0.4)]",
  Platinum: "border-cyan-300/70 shadow-[0_0_32px_rgba(157,239,255,0.45)]",
};

export function DeltaPill({ value }: { value: number }) {
  const up = value > 0;
  const down = value < 0;
  const Icon = up ? TrendingUp : down ? TrendingDown : Minus;
  const color = up ? "text-secondary" : down ? "text-destructive" : "text-muted-foreground";
  const sign = up ? "+" : "";
  return (
    <span className={`inline-flex items-center gap-1 font-mono text-sm ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      {sign}
      {value}
    </span>
  );
}

export function ChapterCard({ node, highlight }: { node: JourneyNodeView; highlight: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card rounded-xl border p-5 flex flex-col gap-4 ${
        node.earned ? TIER_RING[node.tierArt] ?? "border-primary/40" : "border-white/10"
      } ${highlight ? "ring-2 ring-primary/70" : ""}`}
      data-testid={`card-chapter-${node.id}`}
    >
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          <div
            className={`w-20 h-20 rounded-lg flex items-center justify-center border ${
              node.earned
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-white/10 bg-black/40 text-muted-foreground/60"
            }`}
            data-testid={`img-badge-${node.id}`}
          >
            <BookOpen className="w-9 h-9" />
          </div>
          <div className="absolute -bottom-2 -right-2">
            {node.earned ? (
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-secondary text-black">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            ) : (
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-black/70 border border-white/20 text-muted-foreground">
                <Lock className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
              {node.chapterLabel}
            </span>
            {node.ccLevel && (
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary/80">
                {node.ccLevel.replace("_", "-")}
              </span>
            )}
            {node.pillar && (
              <span className="text-[10px] font-mono uppercase tracking-widest text-secondary/80">
                {node.pillar}
              </span>
            )}
          </div>
          <h4 className="font-display font-bold text-white text-lg leading-tight mt-1" data-testid={`text-title-${node.id}`}>
            {node.title}
          </h4>
          <p className="text-primary font-mono text-xs mt-1">{node.badge}</p>
        </div>
      </div>

      <ul className="space-y-1.5">
        {node.quest.map((q, i) => (
          <li key={i} className="flex gap-2 text-sm text-muted-foreground">
            <span className="text-primary/60 font-mono">{i + 1}.</span>
            <span>{q}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
          {node.earned ? `Earned via ${node.earnedVia ?? "flywheel"}` : `Tier: ${node.tierArt}`}
        </span>
        <Link
          to={`${node.deepLink}${node.deepLink.includes("?") ? "&" : "?"}book=${node.id}`}
          className="inline-flex items-center gap-1.5 border border-primary/50 text-primary hover:bg-primary/10 font-mono text-xs uppercase tracking-widest h-9 px-3 rounded-md"
          data-testid={`link-quest-${node.id}`}
        >
          {node.earned ? "Revisit" : "Start"} <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}
