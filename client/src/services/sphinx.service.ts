import { apiClient } from "./api";
import type {
  SpcListing,
  SpcListingDetail,
  ListListingsParams,
  CreateListingBody,
  HivePrecheckBody,
  HivePrecheck,
  SpcAiAnalysis,
  PurchaseResult,
  UserCredits,
  FeedbackSummary,
  CorporateListings,
  ComplementaryRow,
  JngCardLite,
  SynergyResult,
  RoundtableSeat,
  ListingSyntheses,
  SynthSession,
  FinalizeResult,
  ForgeRunResult,
} from "@/types/sphinx";

export const sphinxService = {
  /** GET /v1/sphinx/listings — filtered listing grid */
  listListings: (params?: ListListingsParams) =>
    apiClient.get<{ data: SpcListing[] }>("/sphinx/listings", { params }),

  /** GET /v1/sphinx/listings/:id — detail (creator + purchase state) */
  getListing: (id: string, userId?: string) =>
    apiClient.get<SpcListingDetail>(`/sphinx/listings/${id}`, {
      params: userId ? { userId } : undefined,
    }),

  /** POST /v1/sphinx/hive-precheck — analyze a draft listing */
  hivePrecheck: (body: HivePrecheckBody) =>
    apiClient.post<HivePrecheck>("/sphinx/hive-precheck", body),

  /** POST /v1/sphinx/listings — publish a Super Prompt Card */
  createListing: (body: CreateListingBody) =>
    apiClient.post<{ listing: SpcListing }>("/sphinx/listings", body),

  /** POST /v1/sphinx/listings/:id/analyze — AI analysis */
  analyzeListing: (id: string) =>
    apiClient.post<SpcAiAnalysis>(`/sphinx/listings/${id}/analyze`),

  /** POST /v1/sphinx/listings/:id/purchase — atomic purchase */
  purchaseListing: (id: string, userId: string) =>
    apiClient.post<PurchaseResult>(`/sphinx/listings/${id}/purchase`, { userId }),

  /** GET /v1/sphinx/listings/:id/feedback */
  getFeedback: (id: string) =>
    apiClient.get<FeedbackSummary>(`/sphinx/listings/${id}/feedback`),

  /** POST /v1/sphinx/listings/:id/feedback */
  submitFeedback: (id: string, stars: number, comment: string) =>
    apiClient.post(`/sphinx/listings/${id}/feedback`, { stars, comment }),

  /** GET /v1/sphinx/corporate — institution-scoped listings */
  getCorporateListings: (pillar?: string) =>
    apiClient.get<CorporateListings>("/sphinx/corporate", {
      params: pillar && pillar !== "All" ? { pillar } : undefined,
    }),

  /** GET /v1/sphinx/listings/:id/complementary — cross-tag synergy pairs */
  getComplementary: (id: string) =>
    apiClient.get<ComplementaryRow[]>(`/sphinx/listings/${id}/complementary`),

  /** GET /v1/sphinx/jnomics/cards — Junglenomics card catalog */
  getJnomicsCards: () =>
    apiClient.get<JngCardLite[]>("/sphinx/jnomics/cards"),

  /** POST /v1/sphinx/synergy — calculate composite synergy */
  calculateSynergy: (cardIds: string[]) =>
    apiClient.post<SynergyResult>("/sphinx/synergy", { cardIds }),

  /** GET /v1/sphinx/roundtable — top-12 leaderboard */
  getRoundtable: () =>
    apiClient.get<RoundtableSeat[]>("/sphinx/roundtable"),

  /** GET /v1/sphinx/listings/:id/syntheses — synthesis activity */
  getListingSyntheses: (id: string) =>
    apiClient.get<ListingSyntheses>(`/sphinx/listings/${id}/syntheses`),

  /** POST /v1/sphinx/synthesis — create a preview session */
  createSynthesisSession: (listingIds: string[]) =>
    apiClient.post<SynthSession>("/sphinx/synthesis", { listingIds }),

  /** POST /v1/sphinx/synthesis/:id/finalize */
  finalizeSynthesisSession: (id: string) =>
    apiClient.post<FinalizeResult>(`/sphinx/synthesis/${id}/finalize`),

  /** GET /v1/users/:id/credits — buyer credit balance */
  getCredits: (userId: string) =>
    apiClient.get<UserCredits>(`/users/${userId}/credits`),

  /** POST /v1/sphinx/forge-lab/run — .docx ingest + HIVE pre-check */
  runForgeLab: (file: File, meta: { title: string; description: string; pillar: string }) => {
    const form = new FormData();
    form.append("file", file);
    form.append("title", meta.title);
    form.append("description", meta.description);
    form.append("pillar", meta.pillar);
    return apiClient.post<ForgeRunResult>("/sphinx/forge-lab/run", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
