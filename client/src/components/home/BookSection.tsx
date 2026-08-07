import { motion } from "framer-motion";
import { BookOpen, ArrowUpRight } from "lucide-react";
import bookCover from "@/assets/atanda-book.png";

const AMAZON_SAMPLE_URL =
  "https://read.amazon.com/sample/B0H6TMDB43?clientId=share";

export function BookSection() {
  return (
    <section
      id="book"
      className="relative bg-[#0d1117] px-6 sm:px-10 py-24 lg:py-32 overflow-hidden"
      data-testid="section-book"
    >
      {/* Subtle section divider glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, hsl(188 86% 53% / 0.3), transparent)",
        }}
      />

      {/* Background radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, hsl(188 86% 53% / 0.06), transparent 70%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Book cover - left side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex justify-center lg:justify-end"
          >
            <div
              className="relative rounded-xl overflow-hidden"
              style={{
                boxShadow:
                  "0 24px 60px rgba(0,0,0,0.6), 0 0 40px hsl(188 86% 53% / 0.15)",
              }}
            >
              <img
                src={bookCover}
                alt="Context Craft: The Rise of Cognitive Engineering by Shay Amusa"
                className="w-full max-w-sm h-auto object-cover"
              />
            </div>
          </motion.div>

          {/* Text content - right side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="text-center lg:text-left"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/3 px-3 py-1 text-[11px] font-mono tracking-widest text-muted-foreground uppercase mb-4">
              <BookOpen className="h-3.5 w-3.5" />
              From the Author
            </span>
            <h2 className="font-sans font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-4 leading-[1.1]">
              Context Craft: The Rise of Cognitive Engineering
            </h2>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-2">
              by <span className="text-white">Shay Amusa</span>
            </p>
            <p className="text-muted-foreground text-sm font-mono mb-8">
              First Edition · 2026
            </p>

            <a
              href={AMAZON_SAMPLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="button-book-sample"
              className="group inline-flex items-center justify-center gap-2 h-12 px-8 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200"
              style={{
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.15), 0 0 30px hsl(188 86% 53% / 0.25)",
              }}
            >
              Read a sample
              <ArrowUpRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
