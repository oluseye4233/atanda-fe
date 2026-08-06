import { apiClient } from "./api";
import type { FeatureFlags } from "@/types/feature-flags";

export const featureFlagsService = {
  /** GET /v1/feature-flags — authenticated snapshot of all flags */
  getAll: () =>
    apiClient.get<FeatureFlags>("/feature-flags"),
};
