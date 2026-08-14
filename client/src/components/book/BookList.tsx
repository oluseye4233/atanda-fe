import { useEffect, useState } from "react";
import { BookOpen, Loader2, Search } from "lucide-react";
import { bookService } from "@/services/book.service";
import { getApiErrorMessage } from "@/lib/apiError";
import { BookCard } from "./BookCard";
import type { Book } from "@/types/book";

const PAGE_SIZE = 12;

export function BookList() {
  const [books, setBooks] = useState<Book[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce free-text search.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 whenever the search changes.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    bookService
      .listBooks({ page, pageSize: PAGE_SIZE, search: debouncedSearch || undefined })
      .then((r) => {
        if (!active) return;
        setBooks(r.data.data);
        setTotal(r.data.total);
      })
      .catch((e: unknown) => {
        if (active) setError(getApiErrorMessage(e, "Failed to load books."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          data-testid="input-search-books"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search books…"
          className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-3 py-3 text-white font-mono text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50"
        />
      </div>

      {error && (
        <div className="glass-card p-4 rounded-xl border border-destructive/30 bg-destructive/5 font-mono text-sm text-destructive">
          {error}
        </div>
      )}

      {loading && books === null && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      )}

      {!loading && books && books.length === 0 && (
        <div className="glass-card p-8 rounded-xl text-center" data-testid="text-empty-books">
          <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="font-mono text-sm text-muted-foreground uppercase">
            No books found{search ? ` for "${search}"` : " yet"}.
          </p>
        </div>
      )}

      {books && books.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="grid-books">
            {books.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                data-testid="button-books-prev"
                className="px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider bg-white/5 text-muted-foreground border border-white/10 hover:text-primary hover:border-primary/40 disabled:opacity-40 transition-all"
              >
                Prev
              </button>
              <span className="font-mono text-sm text-muted-foreground" data-testid="text-books-page">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                data-testid="button-books-next"
                className="px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider bg-white/5 text-muted-foreground border border-white/10 hover:text-primary hover:border-primary/40 disabled:opacity-40 transition-all"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
