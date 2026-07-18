import { apiClient } from "./api";
import type { JnomicsCard } from "@/types/jnomics";

export const jnomicsService = {
  getByIds: (cardIds: string[]) =>
    apiClient.get<JnomicsCard[]>("/jnomics/cards", {
      params: { ids: cardIds.join(",") },
    }),
};
