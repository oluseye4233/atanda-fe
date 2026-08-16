import { apiBookClient } from "./api";
import type {
  BookJourneyResponse,
  BookProgressResponse,
  FinalizeResponse,
} from "@/types/book";

/**
 * Normalizes the API response shape.
 * The docs show an unwrapped `{ title, totalNodes, stages, nodes }` payload,
 * but some deployed endpoints may wrap it as `{ data: { ... } }`. This helper
 * accepts either shape and returns the inner object, or `null` if the payload
 * isn't an object.
 */
function unwrapBookPayload<T>(payload: unknown): T | null {
  if (!payload || typeof payload !== "object") return null;

  const top = payload as Record<string, unknown>;
  if (top.data && typeof top.data === "object") {
    return top.data as T;
  }

  return top as T;
}

export const bookService = {
  /** GET /api/book/journey — full journey map with earned flags. */
  getJourney: async (): Promise<BookJourneyResponse | null> => {
    const { data } = await apiBookClient.get<unknown>("/book/journey");
    const payload = unwrapBookPayload<BookJourneyResponse>(data);
    if (!payload || !Array.isArray(payload.nodes)) return null;
    return payload;
  },

  /** GET /api/book/progress — reader's badges + Ledger snapshots. */
  getProgress: async (): Promise<BookProgressResponse | null> => {
    const { data } = await apiBookClient.get<unknown>("/book/progress");
    const payload = unwrapBookPayload<BookProgressResponse>(data);
    if (!payload) return null;
    return {
      badges: Array.isArray(payload.badges) ? payload.badges : [],
      ledger: payload.ledger ?? {
        baseline: null,
        final: null,
        delta: null,
      },
    };
  },

  /** POST /api/book/finalize — capture final Ledger + Epilogue badge. */
  finalizeJourney: async (): Promise<FinalizeResponse | null> => {
    const { data } = await apiBookClient.post<unknown>("/book/finalize");
    return unwrapBookPayload<FinalizeResponse>(data);
  },
};
