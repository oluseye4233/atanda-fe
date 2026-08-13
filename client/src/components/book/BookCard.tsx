import { ArrowUpRight, BookOpen } from "lucide-react";
import type { Book } from "@/types/book";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <a
      href={book.url}
      target="_blank"
      rel="noopener noreferrer"
      data-testid={`card-book-${book.id}`}
      className="group glass-card rounded-xl border border-white/10 hover:border-primary/40 transition-all hover:scale-[1.02] flex flex-col overflow-hidden"
    >
      {book.bookBannerUrl ? (
        <div className="w-full h-40 overflow-hidden bg-black/40">
          <img
            src={book.bookBannerUrl}
            alt={`${book.title} banner`}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="w-full h-40 flex items-center justify-center bg-black/40 border-b border-white/5">
          <BookOpen className="h-12 w-12 text-primary/60" />
        </div>
      )}

      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3
          className="font-display font-bold text-lg text-white leading-tight group-hover:text-primary transition-colors"
          data-testid={`text-book-title-${book.id}`}
        >
          {book.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3">
          {book.description || "No description available."}
        </p>
        <span className="inline-flex items-center gap-1.5 text-primary font-mono text-xs uppercase tracking-wider mt-auto">
          Read <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </a>
  );
}
