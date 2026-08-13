import { apiClient } from "./api";
import type {
  Book,
  BookListResponse,
  ListBooksParams,
  CreateBookBody,
  UpdateBookBody,
} from "@/types/book";

export const bookService = {
  /** GET /v1/books — public, paginated, newest first */
  listBooks: (params?: ListBooksParams) =>
    apiClient.get<BookListResponse>("/books", { params }),

  /** GET /v1/books/:id — public */
  getBook: (id: string) =>
    apiClient.get<Book>(`/books/${id}`),

  /** POST /v1/books — admin/staff only */
  createBook: (body: CreateBookBody) =>
    apiClient.post<Book>("/books", body),

  /** PATCH /v1/books/:id — admin/staff only */
  updateBook: (id: string, body: UpdateBookBody) =>
    apiClient.patch<Book>(`/books/${id}`, body),

  /** DELETE /v1/books/:id — admin/staff only */
  deleteBook: (id: string) =>
    apiClient.delete<{ message: string }>(`/books/${id}`),
};