import { apiClient } from "./api";
import type {
  SpcListing,
  CreateListingBody,
  HivePrecheckBody,
  HiveAnalysis,
  PurchaseResponse,
} from "@/types/sphinx";

export const sphinxService = {
  /** POST /v1/sphinx/hive-precheck — analyze a draft listing */
  hivePrecheck: (body: HivePrecheckBody) =>
    apiClient.post<HiveAnalysis>("/sphinx/hive-precheck", body),

  /** POST /v1/sphinx/listings — publish a Super Prompt Card */
  createListing: (body: CreateListingBody) =>
    apiClient.post<SpcListing>("/sphinx/listings", body),

  /** GET /v1/sphinx/listings — listing grid */
  listListings: () =>
    apiClient.get<{ data: SpcListing[] }>("/sphinx/listings"),

  /** POST /v1/sphinx/listings/:id/analyze — AI analysis */
  analyzeListing: (id: string) =>
    apiClient.post<HiveAnalysis>(`/sphinx/listings/${id}/analyze`),

  /** POST /v1/sphinx/listings/:id/purchase — atomic purchase */
  purchaseListing: (id: string) =>
    apiClient.post<PurchaseResponse>(`/sphinx/listings/${id}/purchase`),
};
