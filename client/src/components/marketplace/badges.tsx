import type { ElementType } from "react";
import { Crown, Star, Award, Tag } from "lucide-react";
import {
  hiveToTierBadge,
  hiveToLetterGrade,
  pillarToCategory,
} from "@/lib/sphinx";

export const TIER_VISUALS: Record<
  string,
  { label: string; color: string; icon: ElementType; bg: string; border: string }
> = {
  ULTRA: {
    label: "ULTRA",
    color: "#AA44FF",
    icon: Crown,
    bg: "bg-purple-500/10",
    border: "border-purple-400/40",
  },
  PREMIUM: {
    label: "PREMIUM",
    color: "#FFC857",
    icon: Star,
    bg: "bg-amber-400/10",
    border: "border-amber-400/40",
  },
  STANDARD: {
    label: "STANDARD",
    color: "#9BB7C7",
    icon: Award,
    bg: "bg-slate-300/10",
    border: "border-slate-300/30",
  },
};

export function TierBadge({
  hive,
  size = "sm",
}: {
  hive: number;
  size?: "sm" | "lg";
}) {
  const tier = hiveToTierBadge(hive);
  if (!tier) return null;
  const v = TIER_VISUALS[tier];
  const Icon = v.icon;
  const pad = size === "lg" ? "px-3 py-1.5 text-xs" : "px-2 py-0.5 text-[10px]";
  return (
    <span
      data-testid={`badge-tier-${tier.toLowerCase()}`}
      className={`inline-flex items-center gap-1 rounded font-mono uppercase tracking-wider border ${v.bg} ${v.border} ${pad}`}
      style={{ color: v.color }}
    >
      <Icon className={size === "lg" ? "h-3.5 w-3.5" : "h-3 w-3"} /> {v.label}
    </span>
  );
}

export function GradeChip({
  hive,
  size = "md",
}: {
  hive: number;
  size?: "md" | "lg";
}) {
  const { grade, color } = hiveToLetterGrade(hive);
  const dim = size === "lg" ? "h-14 w-14 text-3xl" : "h-10 w-10 text-xl";
  return (
    <div
      data-testid={`text-letter-grade-${grade.toLowerCase()}`}
      className={`flex items-center justify-center rounded-md font-display font-bold border ${dim}`}
      style={{
        color,
        borderColor: `${color}55`,
        backgroundColor: `${color}15`,
      }}
    >
      {grade}
    </div>
  );
}

export function CategoryChip({ pillar }: { pillar: string }) {
  const cat = pillarToCategory(pillar);
  if (!cat) return null;
  return (
    <span
      data-testid={`chip-category-${cat.toLowerCase()}`}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-primary/5 text-primary/80 border border-primary/20"
    >
      <Tag className="h-2.5 w-2.5" /> {cat}
    </span>
  );
}

export function PillarBadge({ pillar }: { pillar: string }) {
  return (
    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-white/5 text-muted-foreground border border-white/10">
      {pillar}
    </span>
  );
}
