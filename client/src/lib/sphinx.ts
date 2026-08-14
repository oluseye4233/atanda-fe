// ── SPHINX marketplace — client-side constants & helpers ─────────────────────
// Self-contained: no imports from @shared. Values mirror the API contract.

export const CREDITS_TO_USD = 0.01; // 1 credit = $0.01

export const SPC_CREATOR_SHARE_PCT = 70;
export const SPC_PLATFORM_SHARE_PCT = 30;
export const SPC_MIN_CERT_TO_PUBLISH = "CC_400" as const;
export const SPC_PRICE_MIN = 5;
export const SPC_PRICE_MAX = 500;

export const SPC_FEEDBACK_BONUS_BY_STARS: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 0,
  2: 0,
  3: 2,
  4: 6,
  5: 10,
};

export const CONTEXT_CRAFT_LEVELS = {
  NONE: { key: "NONE", label: "No Certification", multiplier: 0.5, color: "#FF4444" },
  CC_100: { key: "CC_100", label: "CC-100 Foundational", multiplier: 1.0, color: "#FFA500" },
  CC_200: { key: "CC_200", label: "CC-200 Practitioner", multiplier: 1.1, color: "#FFDD00" },
  CC_300: { key: "CC_300", label: "CC-300 Specialist", multiplier: 1.2, color: "#4488FF" },
  CC_400: { key: "CC_400", label: "CC-400 Expert", multiplier: 1.35, color: "#44AA44" },
  CC_500: { key: "CC_500", label: "CC-500 Master Architect", multiplier: 1.5, color: "#AA44FF" },
} as const;

export type ContextCraftLevel = keyof typeof CONTEXT_CRAFT_LEVELS;

export const CERT_LEVEL_RANK: Record<ContextCraftLevel, number> = {
  NONE: 0,
  CC_100: 1,
  CC_200: 2,
  CC_300: 3,
  CC_400: 4,
  CC_500: 5,
};

export const CC_PILLARS = [
  "System",
  "Role",
  "Instruction",
  "Example",
  "Constraint",
  "Format",
  "Data",
] as const;

export const ALL_CARD_PILLARS = [...CC_PILLARS, "SuperPrompt"] as const;

export const MARKETPLACE_CATEGORIES = [
  "All",
  "System",
  "Role",
  "Instruction",
  "Example",
  "Constraint",
  "Format",
  "Data",
  "SuperPrompt",
] as const;

/** Grade pricing matrix — suggested credit prices per HIVE band */
export const GRADE_PRICING_MATRIX = [
  { tier: "Platinum", minHive: 90, maxHive: 100, suggestedMin: 200, suggestedMax: 500, label: "Platinum" },
  { tier: "Gold", minHive: 80, maxHive: 89, suggestedMin: 100, suggestedMax: 199, label: "Gold" },
  { tier: "Silver", minHive: 70, maxHive: 79, suggestedMin: 50, suggestedMax: 99, label: "Silver" },
  { tier: "Bronze", minHive: 60, maxHive: 69, suggestedMin: 20, suggestedMax: 49, label: "Bronze" },
] as const;

/** Format a credit amount as a USD price string, e.g. "100 cr ($1.00)" */
export function formatPriceUsd(credits: number): string {
  const usd = (credits * CREDITS_TO_USD).toFixed(2);
  return `${credits} cr ($${usd})`;
}

/** Map a HIVE score (0-100) to a tier badge label */
export function hiveToTierBadge(hive: number): string {
  if (hive >= 90) return "Platinum";
  if (hive >= 80) return "Gold";
  if (hive >= 70) return "Silver";
  if (hive >= 60) return "Bronze";
  return "Ungraded";
}

/** Map a HIVE score to a letter grade */
export function hiveToLetterGrade(hive: number): { grade: string; color: string } {
  if (hive >= 95) return { grade: "A+", color: "#AA44FF" };
  if (hive >= 90) return { grade: "A", color: "#AA44FF" };
  if (hive >= 85) return { grade: "A-", color: "#44AA44" };
  if (hive >= 80) return { grade: "B+", color: "#44AA44" };
  if (hive >= 75) return { grade: "B", color: "#4488FF" };
  if (hive >= 70) return { grade: "B-", color: "#4488FF" };
  if (hive >= 65) return { grade: "C+", color: "#FFDD00" };
  if (hive >= 60) return { grade: "C", color: "#FFDD00" };
  return { grade: "F", color: "#FF4444" };
}

/** Map a CC pillar name to its marketplace category */
export function pillarToCategory(pillar: string): string {
  return pillar; // pillar names are the categories
}

/** Suggest a credit price band based on a HIVE score */
export function suggestedPriceForHive(hive: number): {
  suggestedMin: number;
  suggestedMax: number;
  label: string;
} {
  if (hive >= 90) return { suggestedMin: 200, suggestedMax: 500, label: "Platinum" };
  if (hive >= 80) return { suggestedMin: 100, suggestedMax: 199, label: "Gold" };
  if (hive >= 70) return { suggestedMin: 50, suggestedMax: 99, label: "Silver" };
  if (hive >= 60) return { suggestedMin: 20, suggestedMax: 49, label: "Bronze" };
  return { suggestedMin: SPC_PRICE_MIN, suggestedMax: 19, label: "Ungraded" };
}

/** Derive performance bars from listing metrics for visual display */
export function derivePerfBars(opts: {
  hiveScore: number;
  kcseScore: number;
  bodyLength: number;
}): { speed: number; efficiency: number; innovation: number; reliability: number } {
  const { hiveScore, kcseScore, bodyLength } = opts;
  const lengthFactor = Math.min(100, Math.round((bodyLength / 800) * 100));
  return {
    speed: Math.round(kcseScore * 2),
    efficiency: Math.round(hiveScore * 0.9),
    innovation: Math.round(hiveScore * 0.6 + lengthFactor * 0.4),
    reliability: Math.round(hiveScore * 0.95),
  };
}
