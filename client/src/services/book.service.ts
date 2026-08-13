import { apiClient } from "./api";
import type {
  BookJourney,
  LedgerView,
  CaptureSnapshotBody,
  CaptureSnapshotResponse,
} from "@/types/book";

export const bookService = {
  /** GET /v1/book/journey — reader's earned journey nodes */
  getJourney: () =>
    apiClient.get<BookJourney>("/book/journey"),

  /** GET /v1/book/ledger — reader's digital ledger */
  getLedger: () =>
    apiClient.get<LedgerView>("/book/ledger"),

  /** POST /v1/book/ledger/capture — capture a baseline or final snapshot */
  captureSnapshot: (body: CaptureSnapshotBody) =>
    apiClient.post<CaptureSnapshotResponse>("/book/ledger/capture", body),
};
