/**
 * shared/schema.ts — client-safe constants, types, and pure functions.
 * All drizzle-orm / drizzle-zod imports removed so this module can be
 * bundled by Vite without any server-side database packages.
 * DB table objects (pgTable) live in server/db/schema.ts (server-only).
 */

// ── Subscription Plans ────────────────────────────────────────
export const SUBSCRIPTION_PLANS = {
  INDIVIDUAL_FREE: {
    key: "INDIVIDUAL_FREE",
    label: "Individual Free",
    type: "individual",
    price: 0,
    period: "forever",
    color: "#888888",
    features: ["1 resume upload", "Basic JST Score", "Vulnerability Level"],
    limits: { uploadsPerMonth: 1, dashboardAccess: true, pathwaysAccess: false, enterpriseAccess: false, reportAccess: false, forgeCards: false, trainingProviderAccess: false },
  },
  INDIVIDUAL_EXPLORER: {
    key: "INDIVIDUAL_EXPLORER",
    label: "Explorer",
    type: "individual",
    price: 0,
    period: "forever",
    color: "#22C55E",
    features: ["1 resume upload", "Basic JST Score", "Vulnerability Level", "Suggested Training Providers", "JST-matched upskilling path"],
    limits: { uploadsPerMonth: 1, dashboardAccess: true, pathwaysAccess: false, enterpriseAccess: false, reportAccess: false, forgeCards: false, trainingProviderAccess: true },
  },
  INDIVIDUAL_PRO: {
    key: "INDIVIDUAL_PRO",
    label: "Individual Pro",
    type: "individual",
    price: 29,
    period: "month",
    color: "#00B4D8",
    features: ["Unlimited uploads", "Full JST Dashboard", "12-Vector Radar", "Career Pathways", "FORGE Cards", "Executive Report", "Context Craft Integration", "Suggested Training Providers"],
    limits: { uploadsPerMonth: -1, dashboardAccess: true, pathwaysAccess: true, enterpriseAccess: false, reportAccess: true, forgeCards: true, trainingProviderAccess: true },
  },
  SCHOOL_STUDENT: {
    key: "SCHOOL_STUDENT",
    label: "School / Student",
    type: "school",
    price: 9,
    period: "month",
    color: "#AA44FF",
    features: ["Unlimited uploads", "Full JST Dashboard", "12-Vector Radar", "Career Pathways", "FORGE Cards", "Executive Report", "Context Craft Integration", "Institution Dashboard", "Suggested Training Providers"],
    limits: { uploadsPerMonth: -1, dashboardAccess: true, pathwaysAccess: true, enterpriseAccess: false, reportAccess: true, forgeCards: true, trainingProviderAccess: true },
  },
  ENTERPRISE: {
    key: "ENTERPRISE",
    label: "Enterprise",
    type: "corporate",
    price: 0,
    period: "custom",
    color: "#44AA44",
    features: ["Everything in Pro", "Workforce Intelligence", "Department Analytics", "Bulk Assessment", "Custom Integrations", "Priority Support"],
    limits: { uploadsPerMonth: -1, dashboardAccess: true, pathwaysAccess: true, enterpriseAccess: true, reportAccess: true, forgeCards: true, trainingProviderAccess: true },
  },
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

export const CONTEXT_CRAFT_LEVELS = {
  NONE: { key: "NONE", label: "No Certification", multiplier: 0.5, color: "#FF4444" },
  CC_100: { key: "CC_100", label: "CC-100 Foundational", multiplier: 1.0, color: "#FFA500" },
  CC_200: { key: "CC_200", label: "CC-200 Practitioner", multiplier: 1.1, color: "#FFDD00" },
  CC_300: { key: "CC_300", label: "CC-300 Specialist", multiplier: 1.2, color: "#4488FF" },
  CC_400: { key: "CC_400", label: "CC-400 Expert", multiplier: 1.35, color: "#44AA44" },
  CC_500: { key: "CC_500", label: "CC-500 Master Architect", multiplier: 1.5, color: "#AA44FF" },
} as const;

export type ContextCraftLevel = keyof typeof CONTEXT_CRAFT_LEVELS;

export const CC_PILLARS = ["System", "Role", "Instruction", "Example", "Constraint", "Format", "Data"] as const;
export type CCPillar = typeof CC_PILLARS[number];
export const ALL_CARD_PILLARS = [...CC_PILLARS, "SuperPrompt"] as const;
export type CardPillar = typeof ALL_CARD_PILLARS[number];

export const CARD_TYPES = ["Standard", "Premium", "Ultra", "SuperPrompt"] as const;
export type CardType = typeof CARD_TYPES[number];

export const CCGE_TIERS = ["Bronze", "Silver", "Gold", "Platinum"] as const;
export type CcgeTier = typeof CCGE_TIERS[number];

export const JCSE_TIER_THRESHOLDS = { BRONZE: 30, SILVER: 36, GOLD: 43, PLATINUM: 48 } as const;
export const UPSKILL_NUDGE_COOLDOWN_DAYS = 7;

export function jcseToContextCraftLevel(jcse: number): ContextCraftLevel {
  if (jcse >= JCSE_TIER_THRESHOLDS.PLATINUM) return "CC_500";
  if (jcse >= JCSE_TIER_THRESHOLDS.GOLD) return "CC_400";
  if (jcse >= JCSE_TIER_THRESHOLDS.SILVER) return "CC_300";
  if (jcse >= JCSE_TIER_THRESHOLDS.BRONZE) return "CC_200";
  return "NONE";
}

export function jcseToTier(jcse: number): CcgeTier | null {
  if (jcse >= JCSE_TIER_THRESHOLDS.PLATINUM) return "Platinum";
  if (jcse >= JCSE_TIER_THRESHOLDS.GOLD) return "Gold";
  if (jcse >= JCSE_TIER_THRESHOLDS.SILVER) return "Silver";
  if (jcse >= JCSE_TIER_THRESHOLDS.BRONZE) return "Bronze";
  return null;
}

export const VERIFICATION_TIER_THRESHOLDS = { BRONZE: 60, SILVER: 70, GOLD: 80, PLATINUM: 90 } as const;

export function verificationScoreToTier(score: number): CcgeTier | null {
  if (score >= VERIFICATION_TIER_THRESHOLDS.PLATINUM) return "Platinum";
  if (score >= VERIFICATION_TIER_THRESHOLDS.GOLD) return "Gold";
  if (score >= VERIFICATION_TIER_THRESHOLDS.SILVER) return "Silver";
  if (score >= VERIFICATION_TIER_THRESHOLDS.BRONZE) return "Bronze";
  return null;
}

export const VERIFICATION_ARK_DELTAS = { BRONZE: 6, SILVER: 12, GOLD: 20, PLATINUM: 30 } as const;

export function verificationArkDelta(tier: CcgeTier | null): number {
  switch (tier) {
    case "Platinum": return VERIFICATION_ARK_DELTAS.PLATINUM;
    case "Gold":     return VERIFICATION_ARK_DELTAS.GOLD;
    case "Silver":   return VERIFICATION_ARK_DELTAS.SILVER;
    case "Bronze":   return VERIFICATION_ARK_DELTAS.BRONZE;
    default:         return 0;
  }
}

export const ARK_SCORE_DELTAS = {
  SESSION_BRONZE: 2, SESSION_SILVER: 4, SESSION_GOLD: 6, SESSION_PLATINUM: 9,
  CERT_UPGRADE_TO_CC_200: 4, CERT_UPGRADE_TO_CC_300: 7, CERT_UPGRADE_TO_CC_400: 10, CERT_UPGRADE_TO_CC_500: 15,
  SPC_PUBLISHED: 2, SPC_PURCHASED_AS_BUYER: 1, SPC_FIRST_SALE_AS_CREATOR: 8,
} as const;

export const SCORE_GLOSSARY = {
  ARK:  { range: [0, 600] as const, formula: "JST + CCMI", canon: "ARK MAXIMUS ULTRA SI", note: "Composite career-intelligence score. Max 600." },
  JST:  { range: [0, 300] as const, formula: "(Jobs·0.30 + Skills·0.40 + Talent·0.30) · 3", canon: "ARK SI — Jobs-Skills-Talent Career Assessment Agent", note: "Three-composite index." },
  CCMI: { range: [0, 300] as const, formula: "weighted P1-P7 sum · 3", canon: "Context Craft Mastery Index (ARK MAXIMUS)", note: "Per-pillar mastery 0-100 each → composite 0-300." },
  JCSE: { range: [0, 50] as const, formula: "Composite AI Agent Quality Score (canon Term 3)", canon: "General Technical Terms Registry v1.0 Term 3", note: "Session/agent quality." },
  KCSE_DIMENSIONS: { range: [0, 50] as const, formula: "Knowledge·0.30 + Clarity·0.30 + Specificity·0.20 + Efficiency·0.20", canon: "ARK-internal CCGE in-game rubric", note: "Four-dimension breakdown." },
  HIVE: { range: [0, 100] as const, formula: "14-dimensional cert framework", canon: "HIVE MATRIX LABS — General Technical Terms Registry Term 8", note: "Bronze 60 / Silver 70 / Gold 80 / Platinum 90." },
  CC_LEVELS: { range: ["NONE", "CC_100", "CC_200", "CC_300", "CC_400", "CC_500"] as const, canon: "ARK-internal ladder", note: "CC_200=Bronze, CC_300=Silver, CC_400=Gold, CC_500=Platinum." },
  KNIGHT_RANK: { canon: "ARK-internal GUIN+ contributor rank.", note: "Squire/Knight/Paladin/Champion/Legend keyed on cumulative JCSE." },
} as const;

export const JST_WEIGHTS = { jobs: 0.30, skills: 0.40, talent: 0.30 } as const;
export const CCMI_PILLAR_WEIGHTS = { P1: 0.18, P2: 0.14, P3: 0.18, P4: 0.12, P5: 0.10, P6: 0.10, P7: 0.18 } as const;
export type CcmiPillarKey = keyof typeof CCMI_PILLAR_WEIGHTS;
export const CCMI_PILLAR_LABELS: Record<CcmiPillarKey, string> = {
  P1: "System & Architecture", P2: "Role Clarity", P3: "Instruction Mastery",
  P4: "Example Curation", P5: "Constraint Discipline", P6: "Format Precision", P7: "Data Stewardship",
};

export const CCMI_TIER_BANDS = [
  { min: 270, max: 300, tier: "T5", label: "Master",       multiplier: 1.35 },
  { min: 240, max: 269, tier: "T4", label: "Expert",       multiplier: 1.30 },
  { min: 200, max: 239, tier: "T3", label: "Specialist",   multiplier: 1.20 },
  { min: 150, max: 199, tier: "T2", label: "Practitioner", multiplier: 1.10 },
  { min: 100, max: 149, tier: "T1", label: "Foundational", multiplier: 1.05 },
  { min: 0,   max: 99,  tier: "T0", label: "Unverified",   multiplier: 1.00 },
] as const;
export type CcmiTier = typeof CCMI_TIER_BANDS[number]["tier"];

export const ARK_TIERS = [
  { min: 540, max: 600, key: "Legendary",   color: "#AA44FF" },
  { min: 480, max: 539, key: "Exceptional", color: "#44AA44" },
  { min: 400, max: 479, key: "Strong",      color: "#4488FF" },
  { min: 300, max: 399, key: "Capable",     color: "#FFDD00" },
  { min: 200, max: 299, key: "Developing",  color: "#FFA500" },
  { min: 0,   max: 199, key: "Foundation",  color: "#FF4444" },
] as const;
export type ArkTierKey = typeof ARK_TIERS[number]["key"];

export const VMST_LEVELS = [
  { key: "L0", label: "Exposed",     min: 0,   color: "#FF4444" },
  { key: "L1", label: "At Risk",     min: 100, color: "#FFA500" },
  { key: "L2", label: "Stable",      min: 200, color: "#FFDD00" },
  { key: "L3", label: "Protected",   min: 350, color: "#4488FF" },
  { key: "L4", label: "Flourishing", min: 480, color: "#44AA44" },
] as const;
export type VmstLevel = typeof VMST_LEVELS[number]["key"];

export const TYPOLOGIES = ["A", "O", "C"] as const;
export type TypologyKey = typeof TYPOLOGIES[number];

export const LHCS_THRESHOLDS = { green: 70, amber: 40 } as const;
export const LHCS_WEIGHTS = { cpr: 0.35, mps: 0.35, lcis: 0.30 } as const;
export type LhcsLight = "green" | "amber" | "red";
export type LhcsStatus = LhcsLight;

export function lhcsLight(score: number): LhcsLight {
  if (score >= LHCS_THRESHOLDS.green) return "green";
  if (score >= LHCS_THRESHOLDS.amber) return "amber";
  return "red";
}
export function lhcsReadiness(cpr: number, mps: number, lcis: number): number {
  const c = Math.max(0, Math.min(100, cpr));
  const m = Math.max(0, Math.min(100, mps));
  const l = Math.max(0, Math.min(100, lcis));
  return Math.round(c * LHCS_WEIGHTS.cpr + m * LHCS_WEIGHTS.mps + l * LHCS_WEIGHTS.lcis);
}
export function lhcsStatusFromReadiness(readiness: number): LhcsStatus { return lhcsLight(readiness); }

export const FLYWHEEL_CAPS = { CCGE_PER_DAY: 15, SPHINX_PER_30D: 20, VERIFICATION_PER_DAY: 40 } as const;

export const ARK_TRIGGER_TYPES = [
  "assessment.completed", "ccge.session", "cert.upgraded", "spc.published",
  "spc.sold", "spc.purchased", "card.verified", "manual.recompute", "backfill",
] as const;
export type ArkTriggerType = typeof ARK_TRIGGER_TYPES[number];

// ── SPHINX Marketplace constants ──────────────────────────────
export const SPC_CREATOR_SHARE_PCT = 70;
export const SPC_PLATFORM_SHARE_PCT = 30;
export const SPC_STARTING_CREDITS = 100;
export const SPC_MIN_CERT_TO_PUBLISH: ContextCraftLevel = "CC_400";
export const SPC_PRICE_MIN = 5;
export const SPC_PRICE_MAX = 500;
export const SPC_HIVE_MIN_TO_PUBLISH = 80;
export const SPC_FIRST_SALE_TALENT_BOOST = 3;

export const SPC_STATUSES = ["draft", "active", "delisted"] as const;
export type SpcStatus = typeof SPC_STATUSES[number];

export const SPC_SCOPES = ["OPEN", "CORPORATE", "BOTH"] as const;
export type SpcScope = typeof SPC_SCOPES[number];

export const SPC_FEEDBACK_BONUS_BY_STARS: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 2, 4: 6, 5: 10 };

export const CERT_LEVEL_RANK: Record<ContextCraftLevel, number> = {
  NONE: 0, CC_100: 1, CC_200: 2, CC_300: 3, CC_400: 4, CC_500: 5,
};

// ── F1000 promo ───────────────────────────────────────────────
export const F1000_PROMO = {
  limit: 1000,
  defaultPlan: "INDIVIDUAL_EXPLORER" as SubscriptionPlan,
  priceUsd: { INDIVIDUAL_PRO: 10, SCHOOL_STUDENT: 9 } as Record<string, number>,
  aiCostBudgetCents: { INDIVIDUAL_PRO: 2900, SCHOOL_STUDENT: 900 } as Record<string, number>,
  aiMonthlyTokens: { INDIVIDUAL_PRO: 5_000_000, SCHOOL_STUDENT: 2_000_000 } as Record<string, number>,
} as const;

// ── CCGE industry presets ─────────────────────────────────────
export const CCGE_INDUSTRY_PRESETS = [
  "Finance & Banking", "Healthcare & Life Sciences", "Technology & Software",
  "Manufacturing & Industrial", "Retail & E-commerce", "Education & EdTech",
  "Legal & Compliance", "Marketing & Advertising", "Energy & Utilities",
  "Real Estate & Construction", "Media & Entertainment", "Government & Public Sector",
  "Non-profit & NGO", "Consulting & Professional Services", "Other",
] as const;
export type CcgeIndustryPreset = typeof CCGE_INDUSTRY_PRESETS[number];

// ── Plain TypeScript types (replace drizzle $inferSelect) ────
export interface WorkHistoryEntry {
  company: string;
  role?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  location?: string | null;
  highlights?: string[];
}

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role?: string | null;
  department?: string | null;
  seniority?: string | null;
  location?: string | null;
  contextCraftCertLevel?: string | null;
  subscriptionPlan?: string | null;
  subscriptionStatus?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  subscriptionCurrentPeriodEnd?: Date | null;
  subscriptionCanceledAt?: Date | null;
  institution?: string | null;
  uploadsThisMonth?: number | null;
  uploadResetDate?: Date | null;
  arkScore: number;
  jstIndex: number;
  ccmi: number;
  ccmiTier: string;
  vmstLevel: string;
  typology?: string | null;
  arkIdString?: string | null;
  cprScore: number;
  mpsScore: number;
  lcisScore: number;
  lhcsStatus: string;
  resumeReplacementPct: number;
  f1000Member: boolean;
  headshotDataUrl?: string | null;
  preferredAiModel?: string | null;
}
export type InsertUser = Omit<User, "id" | "subscriptionPlan" | "subscriptionStatus" | "institution" | "uploadsThisMonth" | "uploadResetDate" | "contextCraftCertLevel" | "stripeCustomerId" | "stripeSubscriptionId" | "arkScore" | "jstIndex" | "ccmi" | "ccmiTier" | "vmstLevel" | "typology" | "arkIdString" | "cprScore" | "mpsScore" | "lcisScore" | "lhcsStatus" | "resumeReplacementPct" | "f1000Member">;
export type UpdateUser = Partial<User>;

export interface F1000Invite {
  id: string; seq: number; code: string; userId: string; promoApplied: boolean; createdAt: Date;
}
export type InsertF1000Invite = Omit<F1000Invite, "id" | "createdAt">;

export interface Assessment {
  id: string; userId: string; jstTotal: number; jstJobs: number; jstSkills: number; jstTalent: number;
  vulnerabilityLevel: number; readinessProfile: string;
  riskModifiers?: Array<{ task: string; automatable: number }> | null;
  matchedCardIds?: string[] | null;
  archetypeArchitect: number; archetypeOrchestrator: number; archetypeConductor: number;
  automationMilestones?: Array<{ year: number; event: string; automationPct: number; impact: string }> | null;
  contextCraftLevel?: string | null; contextCraftMultiplier?: number | null;
  jstRawTotal?: number | null; jstRawJobs?: number | null; jstRawSkills?: number | null; jstRawTalent?: number | null;
  sourcesUsed?: string[] | null; completeness: number;
  candidateName?: string | null; currentEmployer?: string | null; currentRole?: string | null;
  professionalQuals?: string[] | null; academicQuals?: string[] | null;
  contactEmail?: string | null; contactPhone?: string | null;
  linkLinkedin?: string | null; linkGithub?: string | null; linkPortfolio?: string | null;
  workHistory?: WorkHistoryEntry[] | null; createdAt?: Date | null;
}
export type InsertAssessment = Omit<Assessment, "id" | "createdAt">;

export interface AssessmentSource {
  id: string; userId: string; source: string; content: string; updatedAt?: Date | null;
}
export type InsertAssessmentSource = Omit<AssessmentSource, "id" | "updatedAt">;

export const ASSESSMENT_SOURCES = ["resume", "self", "linkedin", "quiz"] as const;
export type AssessmentSourceKey = typeof ASSESSMENT_SOURCES[number];
export const PRIMARY_ASSESSMENT_SOURCES = ["resume", "self", "linkedin"] as const;
export const ASSESSMENT_SOURCE_LABELS: Record<AssessmentSourceKey, string> = {
  resume: "Resume", self: "Self-Assessment", linkedin: "LinkedIn", quiz: "Archetype Quiz",
};

export interface UpskillingPlan {
  id: string; assessmentId: string; phase: string; type: string; title: string; description: string; hours: number;
}
export type InsertUpskillingPlan = Omit<UpskillingPlan, "id">;

export interface PivotOpportunity {
  id: string; assessmentId: string; role: string; feasibility: number; gapCost: string; time: string;
}
export type InsertPivotOpportunity = Omit<PivotOpportunity, "id">;

export interface TransferabilityVector { id: string; assessmentId: string; subject: string; score: number; }
export type InsertTransferabilityVector = Omit<TransferabilityVector, "id">;

export interface JnomicsCard {
  id: string; name: string; tier: string; type: string; emoji: string;
  description: string; basePts: number;
  disc?: string | null; rarity?: string | null; version?: string | null; category?: string | null;
}
export type InsertJnomicsCard = JnomicsCard;

export interface Department { id: string; name: string; risk: number; headcount: number; seniority: string; location: string; }
export type InsertDepartment = Omit<Department, "id">;

export interface CcgeCard {
  id: string; name: string; pillar: string; type: string; baseKcse: number;
  tokenCost: number; emoji: string; description: string; body: string;
}
export type InsertCcgeCard = CcgeCard;

export interface CcgeScenario {
  id: string; tier: string; title: string; prompt: string; targetPillars: string[];
  tokenBudget: number; difficulty: number; creatorUserId?: string | null;
  industry?: string | null; isCustom: boolean;
}
export type InsertCcgeScenario = CcgeScenario;

export type KcseBreakdown = {
  knowledge: number; clarity: number; specificity: number; efficiency: number;
  pillarsCovered: string[];
  synergies: { name: string; multiplier: number }[];
  tokenUsed: number; tokenBudget: number; base: number; final: number;
  craft?: number; craftSignals?: string[];
};

export type VerificationSubmission = {
  challengeId: string; standard: string; prompt: string; craft: number; signals: string[];
};

export interface GameSession {
  id: string; userId: string; scenarioId: string; hand: string[]; played: string[];
  status: string; kcseScore?: number | null; kcseBreakdown?: KcseBreakdown | null;
  customCardName?: string | null; customCardBody?: string | null; craftScore?: number | null;
  certTierEarned?: string | null; arkScoreDelta: number;
  certUpgradedFrom?: string | null; certUpgradedTo?: string | null;
  startedAt: Date; finishedAt?: Date | null;
}
export type InsertGameSession = Omit<GameSession, "id" | "startedAt" | "finishedAt">;

export const VERIFICATION_DOC_KINDS = ["DOCUMENT", "CERTIFICATION"] as const;
export type VerificationDocKind = typeof VERIFICATION_DOC_KINDS[number];

export interface CardVerification {
  id: string; userId: string; cardId: string; score: number; tier?: string | null;
  status: string; submissions: VerificationSubmission[]; arkAwarded: number;
  attempts: number; createdAt: Date; updatedAt: Date;
}
export type InsertCardVerification = Omit<CardVerification, "id" | "createdAt" | "updatedAt">;

export interface VerificationDocument {
  id: string; userId: string; cardId: string; kind: string; fileName: string;
  mimeType: string; label?: string | null; dataUrl: string; createdAt: Date;
}
export type InsertVerificationDocument = Omit<VerificationDocument, "id" | "createdAt">;

// ── Matchmaking Engine ────────────────────────────────────────
export const OPPORTUNITY_TYPES = ["JOB", "PROJECT"] as const;
export type OpportunityType = typeof OPPORTUNITY_TYPES[number];
export const OPPORTUNITY_STATUSES = ["OPEN", "CLOSED"] as const;
export type OpportunityStatus = typeof OPPORTUNITY_STATUSES[number];
export const ARCHETYPES = ["ARCHITECT", "ORCHESTRATOR", "CONDUCTOR"] as const;
export type Archetype = typeof ARCHETYPES[number];
export const TIER_RANK: Record<string, number> = { Bronze: 1, Silver: 2, Gold: 3, Platinum: 4 };

export interface Opportunity {
  id: string; type: string; title: string; organization: string; description: string;
  location?: string | null; remote: boolean; archetypePreference?: string | null;
  jstFloor: number; status: string; createdBy: string; createdAt: Date;
}
export type InsertOpportunity = Omit<Opportunity, "id" | "createdAt">;

export interface OpportunityRequirement {
  id: string; opportunityId: string; cardId: string; minTier: string; weight: number; roleLabel?: string | null;
}
export type InsertOpportunityRequirement = Omit<OpportunityRequirement, "id">;

export interface OpportunityApplication {
  id: string; opportunityId: string; userId: string; matchScore: number; status: string; createdAt: Date;
}
export type InsertOpportunityApplication = Omit<OpportunityApplication, "id" | "createdAt">;

// ── SPHINX Marketplace types ──────────────────────────────────
export interface SpcListing {
  id: string; creatorId: string; title: string; description: string; body: string;
  pillar: string; priceCredits: number; kcseScore: number; hiveScore: number;
  status: string; salesCount: number; totalEarned: number;
  synergyTagIds?: string[] | null; scope: string; institution?: string | null; createdAt: Date;
  bodyLocked?: boolean; bodyLength?: number;
}
export type InsertSpcListing = Omit<SpcListing, "id" | "kcseScore" | "hiveScore" | "status" | "salesCount" | "totalEarned" | "scope" | "institution" | "createdAt" | "bodyLocked" | "bodyLength">;

export interface SpcPurchase {
  id: string; buyerId: string; listingId: string; creatorId: string; priceCredits: number;
  creatorShare: number; platformShare: number; isFirstSaleForCreator: boolean; purchasedAt: Date;
}
export type InsertSpcPurchase = Omit<SpcPurchase, "id" | "purchasedAt">;

export interface SpcFeedback {
  id: string; listingId: string; buyerId: string; creatorId: string; stars: number;
  comment?: string | null; bonusAwarded: number; createdAt: Date;
}
export type InsertSpcFeedback = Omit<SpcFeedback, "id" | "bonusAwarded" | "createdAt">;

// ── GUIN+ Identity Layer ──────────────────────────────────────
export interface Endorsement {
  id: string; endorserId: string; recipientId: string; sessionId: string; message: string; createdAt: Date;
}
export type InsertEndorsement = Omit<Endorsement, "id" | "createdAt">;

export const KNIGHT_RANKS = [
  { key: "Squire",   label: "Squire",   min: 0,   color: "#888888", icon: "🛡" },
  { key: "Knight",   label: "Knight",   min: 50,  color: "#FFA500", icon: "⚔" },
  { key: "Paladin",  label: "Paladin",  min: 150, color: "#FFDD00", icon: "🏆" },
  { key: "Champion", label: "Champion", min: 350, color: "#4488FF", icon: "👑" },
  { key: "Legend",   label: "Legend",   min: 650, color: "#AA44FF", icon: "🐉" },
] as const;
export type KnightRankKey = typeof KNIGHT_RANKS[number]["key"];

export function computeKnightRank(totalKcseEarned: number) {
  let current: (typeof KNIGHT_RANKS)[number] = KNIGHT_RANKS[0];
  for (const r of KNIGHT_RANKS) { if (totalKcseEarned >= r.min) current = r; }
  const idx = KNIGHT_RANKS.findIndex((r) => r.key === current.key);
  const next = idx < KNIGHT_RANKS.length - 1 ? KNIGHT_RANKS[idx + 1] : null;
  const progress = next
    ? Math.max(0, Math.min(1, (totalKcseEarned - current.min) / (next.min - current.min)))
    : 1;
  return { current: { ...current }, next: next ? { ...next } : null, progress, totalKcseEarned };
}

export const ENDORSEMENT_MAX_LEN = 240;

export interface UserCredits {
  userId: string; balance: number; lifetimeEarned: number; lifetimeSpent: number; updatedAt: Date;
}

export const ARK_EVENT_TYPES = [
  "assessment.completed", "game.session.finished", "cert.upgraded", "spc.published",
  "spc.purchased", "billing.checkout.completed", "billing.subscription.canceled",
  "billing.payment.failed", "synergy.awarded", "card.verified",
] as const;
export type ArkEventType = typeof ARK_EVENT_TYPES[number];

export const CHECKOUT_STATUSES = ["pending", "completed", "failed", "canceled"] as const;
export type CheckoutStatus = typeof CHECKOUT_STATUSES[number];

export const BILLING_EVENT_TYPES = [
  "checkout.created", "checkout.completed", "checkout.failed", "subscription.upgraded",
  "subscription.downgraded", "subscription.canceled", "payment.succeeded", "payment.failed",
] as const;
export type BillingEventType = typeof BILLING_EVENT_TYPES[number];

export interface CheckoutSession {
  id: string; userId: string; plan: string; amountCents: number; status: string;
  institution?: string | null; externalSessionId?: string | null; createdAt: Date; completedAt?: Date | null;
}
export type InsertCheckoutSession = Omit<CheckoutSession, "id" | "createdAt" | "completedAt">;

export interface BillingEvent {
  id: string; userId: string; type: string; fromPlan?: string | null; toPlan?: string | null;
  amountCents?: number | null; externalId?: string | null; payload: Record<string, unknown>; createdAt: Date;
}
export type InsertBillingEvent = Omit<BillingEvent, "id" | "createdAt">;

export const ARK_EVENT_SOURCES = ["system", "flywheel", "ccge", "sphinx", "synergy", "billing", "admin"] as const;
export type ArkEventSource = typeof ARK_EVENT_SOURCES[number];

export interface ArkEvent {
  id: string; userId: string; type: string; source?: ArkEventSource | null;
  payload: Record<string, unknown>; scoreDelta: number; createdAt: Date;
}
export type InsertArkEvent = Omit<ArkEvent, "id" | "createdAt">;

// ── AI constants and types ────────────────────────────────────
export const AI_KINDS = ["kcse", "narrative", "scenario_gen", "job_role_guide"] as const;
export type AiKind = typeof AI_KINDS[number];

export const AI_MODELS = { HAIKU: "claude-haiku-4-5", SONNET: "claude-sonnet-4-6" } as const;

export const AI_PROVIDERS = ["anthropic", "openai", "gemini"] as const;
export type AiProvider = typeof AI_PROVIDERS[number];

export type SelectableAiModel = {
  id: string; provider: AiProvider; label: string; costTier: "economy" | "premium"; blurb: string;
};

export const SELECTABLE_AI_MODELS: readonly SelectableAiModel[] = [
  { id: "claude-haiku-4-5",   provider: "anthropic", label: "Claude Haiku 4.5",  costTier: "economy",  blurb: "Fast + lowest Claude cost. Platform default for scoring." },
  { id: "claude-sonnet-4-6",  provider: "anthropic", label: "Claude Sonnet 4.6", costTier: "premium",  blurb: "Deep reasoning. Platform default for narratives." },
  { id: "gpt-5-mini",         provider: "openai",    label: "GPT-5 Mini",        costTier: "economy",  blurb: "OpenAI economy model. Lowest token cost on the roster." },
  { id: "gpt-5.4",            provider: "openai",    label: "GPT-5.4",           costTier: "premium",  blurb: "OpenAI flagship. Premium reasoning quality." },
  { id: "gemini-2.5-flash",   provider: "gemini",    label: "Gemini 2.5 Flash",  costTier: "economy",  blurb: "Google economy model. Very fast, very cheap." },
  { id: "gemini-2.5-pro",     provider: "gemini",    label: "Gemini 2.5 Pro",    costTier: "premium",  blurb: "Google flagship. Premium long-context reasoning." },
] as const;

export const SELECTABLE_AI_MODEL_IDS = SELECTABLE_AI_MODELS.map(m => m.id) as readonly string[];
export const AI_PREMIUM_MODELS: readonly string[] = SELECTABLE_AI_MODELS.filter(m => m.costTier === "premium").map(m => m.id);
export const AI_ECONOMY_MODELS: readonly string[] = SELECTABLE_AI_MODELS.filter(m => m.costTier === "economy").map(m => m.id);

export const AI_PRICING_PER_MTOK = {
  "claude-haiku-4-5":  { in: 80,  out: 400  },
  "claude-sonnet-4-6": { in: 300, out: 1500 },
  "gpt-5-mini":        { in: 25,  out: 200  },
  "gpt-5.4":           { in: 125, out: 1000 },
  "gemini-2.5-flash":  { in: 30,  out: 250  },
  "gemini-2.5-pro":    { in: 125, out: 1000 },
} as const;

export const AI_TIER_MONTHLY_TOKENS = {
  INDIVIDUAL_FREE: 20000, INDIVIDUAL_PRO: 500000, SCHOOL_STUDENT: 200000, ENTERPRISE: 2000000,
} as const;
export const AI_TIER_DAILY_QUOTA = {
  INDIVIDUAL_FREE: { kcse: 5,   narrative: 0,   scenario_gen: 0  },
  INDIVIDUAL_PRO:  { kcse: 50,  narrative: 30,  scenario_gen: 10 },
  SCHOOL_STUDENT:  { kcse: 20,  narrative: 10,  scenario_gen: 5  },
  ENTERPRISE:      { kcse: 200, narrative: 100, scenario_gen: 50 },
} as const;
export const AI_TIER_COST_BUDGET_CENTS = {
  INDIVIDUAL_FREE: 30, SCHOOL_STUDENT: 90, INDIVIDUAL_PRO: 290, ENTERPRISE: 2000,
} as const;
export const AI_TIER_MONTHLY_TOKENS_V2 = {
  INDIVIDUAL_FREE: 20000, INDIVIDUAL_PRO: 580000, SCHOOL_STUDENT: 180000, ENTERPRISE: 2000000,
} as const;
export const AI_TIER_DAILY_QUOTA_V2 = {
  INDIVIDUAL_FREE: { kcse: 1,   narrative: 0,   scenario_gen: 0  },
  INDIVIDUAL_PRO:  { kcse: 60,  narrative: 35,  scenario_gen: 12 },
  SCHOOL_STUDENT:  { kcse: 15,  narrative: 8,   scenario_gen: 4  },
  ENTERPRISE:      { kcse: 200, narrative: 100, scenario_gen: 50 },
} as const;
export const AI_TIER_MODEL_POLICY = {
  INDIVIDUAL_FREE: { allowedModels: AI_ECONOMY_MODELS, allowUseClaude: false, sonnetKindsAllowed: [] as readonly AiKind[] },
  SCHOOL_STUDENT:  { allowedModels: SELECTABLE_AI_MODEL_IDS, allowUseClaude: true, sonnetKindsAllowed: ["narrative"] as readonly AiKind[] },
  INDIVIDUAL_PRO:  { allowedModels: SELECTABLE_AI_MODEL_IDS, allowUseClaude: true, sonnetKindsAllowed: ["narrative", "kcse", "scenario_gen"] as readonly AiKind[] },
  ENTERPRISE:      { allowedModels: SELECTABLE_AI_MODEL_IDS, allowUseClaude: true, sonnetKindsAllowed: ["narrative", "kcse", "scenario_gen"] as readonly AiKind[] },
} as const;

export interface AiUsage {
  id: string; userId: string; kind: string; model: string;
  tokensIn: number; tokensOut: number; costCents: number; createdAt: Date;
}
export type InsertAiUsage = Omit<AiUsage, "id" | "createdAt">;

export interface AiCache {
  cacheKey: string; kind: string; value: Record<string, unknown>; expiresAt: Date; createdAt: Date;
}

export type HivePrecheck = {
  hiveScore: number; kcseScore: number; passes: boolean; reasons: string[]; warnings: string[];
};

export type SpcAiAnalysis = {
  hiveScore: number;
  kcseScore: number;
  letterGrade: string;
  letterGradeColor: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  pillarSuggestions: Array<{ pillar: string; suggestion: string; currentStrength: number }>;
  overallScore: number;
  cached?: boolean;
};

// ── Training Providers ────────────────────────────────────────
export const TRAINING_CATEGORIES = [
  "AI & Machine Learning", "Data Science", "Cloud Computing", "Cybersecurity",
  "Leadership & Management", "Communication", "Project Management",
  "Software Development", "Design", "Other",
] as const;
export type TrainingCategory = typeof TRAINING_CATEGORIES[number];
export const TRAINING_CATEGORY_LABELS: Record<TrainingCategory, string> = Object.fromEntries(
  TRAINING_CATEGORIES.map(c => [c, c])
) as Record<TrainingCategory, string>;
export const TRAINING_DELIVERY_MODES = ["Online", "In-Person", "Hybrid", "Self-Paced"] as const;
export type TrainingDeliveryMode = typeof TRAINING_DELIVERY_MODES[number];

// ── Utility helpers ───────────────────────────────────────────
/** Format a plan price as a short string, e.g. "Free", "$29/mo", "Custom" */
export function formatPriceDual(plan: SubscriptionPlan): string {
  const p = SUBSCRIPTION_PLANS[plan];
  if (p.price === 0) return plan === "ENTERPRISE" ? "Custom" : "Free";
  return `$${p.price}/${p.period}`;
}

// ── Marketplace helpers (SPHINX) ──────────────────────────────
export const CREDITS_TO_USD = 0.01; // 1 credit = $0.01

export const MARKETPLACE_CATEGORIES = [
  "All", "System", "Role", "Instruction", "Example", "Constraint", "Format", "Data", "SuperPrompt",
] as const;

/** Grade pricing matrix — suggested credit prices per HIVE band */
export const GRADE_PRICING_MATRIX = [
  { tier: "Platinum", minHive: 90, maxHive: 100, suggestedMin: 200, suggestedMax: 500, label: "Platinum" },
  { tier: "Gold",     minHive: 80, maxHive: 89,  suggestedMin: 100, suggestedMax: 199, label: "Gold"     },
  { tier: "Silver",   minHive: 70, maxHive: 79,  suggestedMin: 50,  suggestedMax: 99,  label: "Silver"   },
  { tier: "Bronze",   minHive: 60, maxHive: 69,  suggestedMin: 20,  suggestedMax: 49,  label: "Bronze"   },
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
  if (hive >= 90) return { grade: "A",  color: "#AA44FF" };
  if (hive >= 85) return { grade: "A-", color: "#44AA44" };
  if (hive >= 80) return { grade: "B+", color: "#44AA44" };
  if (hive >= 75) return { grade: "B",  color: "#4488FF" };
  if (hive >= 70) return { grade: "B-", color: "#4488FF" };
  if (hive >= 65) return { grade: "C+", color: "#FFDD00" };
  if (hive >= 60) return { grade: "C",  color: "#FFDD00" };
  return { grade: "F", color: "#FF4444" };
}

/** Map a CC pillar name to its marketplace category */
export function pillarToCategory(pillar: string): string {
  return pillar; // pillar names are the categories
}

/** Suggest a credit price band based on a HIVE score */
export function suggestedPriceForHive(hive: number): { suggestedMin: number; suggestedMax: number; label: string } {
  if (hive >= 90) return { suggestedMin: 200, suggestedMax: 500, label: "Platinum" };
  if (hive >= 80) return { suggestedMin: 100, suggestedMax: 199, label: "Gold" };
  if (hive >= 70) return { suggestedMin: 50,  suggestedMax: 99,  label: "Silver" };
  if (hive >= 60) return { suggestedMin: 20,  suggestedMax: 49,  label: "Bronze" };
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
    speed:       Math.round(kcseScore * 2),
    efficiency:  Math.round(hiveScore * 0.9),
    innovation:  Math.round((hiveScore * 0.6 + lengthFactor * 0.4)),
    reliability: Math.round(hiveScore * 0.95),
  };
}
