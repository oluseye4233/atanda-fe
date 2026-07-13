import { apiClient } from "./api";
import type {
  SphinxListing,
  CreateListingBody,
  HivePrecheckBody,
  HiveAnalysis,
  PurchaseResponse,
} from "@/types/sphinx";

export const sphinxService = {
  /**
   * POST /v1/sphinx/hive-precheck
   * Analyzes a draft listing before publishing. Pro+ plan required.
   */
  hivePrecheck: (body: HivePrecheckBody) =>
    apiClient.post<HiveAnalysis>("/sphinx/hive-precheck", body),

  /**
   * POST /v1/sphinx/listings
   * Publishes a Super Prompt Card. Requires CC_400 cert + HIVE score ≥ 80.
   */
  createListing: (body: CreateListingBody) =>
    apiClient.post<SphinxListing>("/sphinx/listings", body),

  /** GET /v1/sphinx/listings */
  listListings: () =>
    apiClient.get<{ data: SphinxListing[] }>("/sphinx/listings"),

  /** POST /v1/sphinx/listings/:id/analyze */
  analyzeListing: (id: string) =>
    apiClient.post<HiveAnalysis>(`/sphinx/listings/${id}/analyze`),

  purchaseListing: (id: string) =>
    apiClient.post<PurchaseResponse>(`/sphinx/listings/${id}/purchase`),
};
