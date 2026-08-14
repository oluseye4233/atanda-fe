// ── Books — public book library ──────────────────────────────────────────────
// Matches the documented `/v1/books` contract.

export interface Book {
  id: string;
  title: string;
  url: string;
  description: string | null;
  bookBannerUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/** GET /v1/books — paginated, newest first */
export interface BookListResponse {
  page: number;
  pageSize: number;
  total: number;
  data: Book[];
}

/** Query params for GET /v1/books */
export interface ListBooksParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

/** POST /v1/books */
export interface CreateBookBody {
  title: string;
  url: string;
  description?: string | null;
  bookBannerUrl?: string | null;
}

/** PATCH /v1/books/:id — any subset of fields */
export type UpdateBookBody = Partial<CreateBookBody>;
