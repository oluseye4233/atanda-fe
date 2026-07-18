import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Upload, LogIn } from "lucide-react";
import { AsciiField } from "./AsciiField";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

export function HeroSection() {
  return (
    <section
      className="relative flex flex-col min-h-screen bg-[#0d1117] overflow-hidden"
      data-testid="section-hero"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 45% at 30% 12%, hsl(188 86% 53% / 0.12), transparent 65%)",
          }}
        />
        <div className="hero-grain absolute w-[calc(100%+200px)] h-[calc(100%+200px)] top-[-100px] left-[-100px] opacity-50" />
      </div>

      {/* ── Copy block (top) ── */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-6xl mx-auto flex flex-col gap-8 px-6 sm:px-10 pt-28"
      >
        <motion.span
          variants={fadeUp}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/25 bg-primary/7 px-3.5 py-1.5 text-xs font-mono tracking-widest text-primary uppercase"
        >
          {/* <Sparkles className="h-3.5 w-3.5" /> */}
          ARK Career Intelligence Engine
        </motion.span>

        {/* Headline left, CTAs right */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <motion.h1
            variants={fadeUp}
            className="font-display font-black leading-[1.05] tracking-tight text-4xl sm:text-5xl md:text-[3.55rem] text-white"
            data-testid="hero-heading"
          >
            KNOW YOUR WORTH.
            <br />
            KNOW YOUR <span className="text-destructive">RISK</span>.
            <br />
            KNOW YOUR <span className="text-primary">NEXT MOVE</span>.
          </motion.h1>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 shrink-0"
          >
            <Link
              to="/signup"
              data-testid="button-hero-upload"
              className="group inline-flex items-center justify-center gap-2 h-11 px-7 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200"
              style={{
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.15), 0 0 20px hsl(188 86% 53% / 0.25)",
              }}
            >
              <Upload className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
              Analyze My CV
            </Link>
            <Link
              to="/login"
              data-testid="button-hero-login"
              className="group inline-flex items-center justify-center gap-2 h-11 px-7 rounded-md border border-white/20 text-sm text-muted-foreground hover:border-white/35 hover:text-foreground hover:bg-white/4 transition-all duration-200"
            >
              <LogIn className="h-4 w-4" />
              Sign In
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div
          variants={fadeUp}
          className="h-px w-full bg-linear-to-r from-white/10 via-white/6 to-transparent"
        />

        {/* Subtext + proof */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
        >
          <p className="text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed">
            Upload your CV and, in under 60 seconds, see how marketable you are
            today, where AI puts you at risk, and the smartest next move you can
            make.
          </p>
        </motion.div>
      </motion.div>

      {/* ── ASCII field — full bleed, grows to fill remaining height ── */}
      <div className="relative flex-1 min-h-[260px] sm:min-h-[340px] w-full mt-6">
        <AsciiField />
      </div>
    </section>
  );
}
