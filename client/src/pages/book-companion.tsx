import { BookOpen } from "lucide-react";
import { BookList } from "@/components/book/BookList";

export default function BookCompanionPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-white/10 pb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white uppercase tracking-wider">
            Book Library
          </h2>
        </div>
        <p className="text-muted-foreground font-mono text-sm mt-1">
          Explore the books in the ATANDA library.
        </p>
      </div>

      {/* Public book library — no auth required */}
      <BookList />
    </div>
  );
}