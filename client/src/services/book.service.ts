import { apiBookClient } from "./api";
import type {
  BookJourneyResponse,
  BookProgressResponse,
  FinalizeResponse,
} from "@/types/book";

export const bookService = {
  /** GET /api/book/journey — full journey map with earned flags. */
  getJourney: () => apiBookClient.get<BookJourneyResponse>("/book/journey"),

  /** GET /api/book/progress — reader's badges + Ledger snapshots. */
  getProgress: () => apiBookClient.get<BookProgressResponse>("/book/progress"),

  /** POST /api/book/finalize — capture final Ledger + Epilogue badge. */
  finalizeJourney: () =>
    apiBookClient.post<FinalizeResponse>("/book/finalize"),
};
