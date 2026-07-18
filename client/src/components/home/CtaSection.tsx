import { Link } from "react-router-dom";
import { Upload, LogIn, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

function CtaIllustration() {
  return (
    <div className="relative w-full max-w-lg mx-auto" aria-hidden="true">
      <svg
        viewBox="0 0 400 400"
        className="w-full h-auto text-primary"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(188 86% 53%)" stopOpacity="0.4" />
            <stop offset="70%" stopColor="hsl(188 86% 53%)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(188 86% 53%)" stopOpacity="0.6" />
            <stop offset="50%" stopColor="hsl(152 69% 31%)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(188 86% 53%)" stopOpacity="0.6" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer orbit ring */}
        <motion.circle
          cx="200"
          cy="200"
          r="160"
          fill="none"
          stroke="url(#orbitGradient)"
          strokeWidth="1"
          strokeDasharray="8 12"
          style={{ filter: "url(#glow)" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />

        {/* Middle orbit ring */}
        <motion.circle
          cx="200"
          cy="200"
          r="120"
          fill="none"
          stroke="hsl(188 86% 53% / 0.2)"
          strokeWidth="0.5"
          strokeDasharray="4 8"
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* Inner orbit ring */}
        <motion.circle
          cx="200"
          cy="200"
          r="80"
          fill="none"
          stroke="hsl(152 69% 31% / 0.15)"
          strokeWidth="0.5"
          strokeDasharray="2 6"
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />

        {/* Orbiting particles - outer */}
        {[0, 90, 180, 270].map((angle, i) => (
          <motion.circle
            key={`outer-${i}`}
            cx="200"
            cy="40"
            r="6"
            fill="hsl(188 86% 53%)"
            style={{ filter: "url(#glow)" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: i * 3 }}
          />
        ))}

        {/* Orbiting particles - middle */}
        {[45, 135, 225, 315].map((angle, i) => (
          <motion.circle
            key={`middle-${i}`}
            cx="200"
            cy="80"
            r="4"
            fill="hsl(152 69% 31%)"
            style={{ filter: "url(#glow)" }}
            animate={{ rotate: -360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear", delay: i * 2.5 }}
          />
        ))}

        {/* Orbiting particles - inner */}
        {[0, 120, 240].map((angle, i) => (
          <motion.circle
            key={`inner-${i}`}
            cx="200"
            cy="120"
            r="3"
            fill="hsl(188 86% 53%)"
            style={{ filter: "url(#glow)" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: i * 2.6 }}
          />
        ))}

        {/* Central core - pulsing */}
        <motion.circle
          cx="200"
          cy="200"
          r="45"
          fill="url(#coreGlow)"
          animate={{ r: [45, 55, 45], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Core inner circle */}
        <motion.circle
          cx="200"
          cy="200"
          r="28"
          fill="hsl(188 86% 53% / 0.3)"
          style={{ filter: "url(#glow)" }}
          animate={{ r: [28, 32, 28], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />

        {/* Core center */}
        <circle cx="200" cy="200" r="14" fill="hsl(188 86% 53%)" />

        {/* Data points radiating from center */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <motion.line
            key={`ray-${i}`}
            x1="200"
            y1="200"
            x2={200 + Math.cos((angle * Math.PI) / 180) * 60}
            y2={200 + Math.sin((angle * Math.PI) / 180) * 60}
            stroke="hsl(188 86% 53% / 0.3)"
            strokeWidth="1.5"
            strokeLinecap="round"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
          />
        ))}

        {/* Floating data nodes around core */}
        {[30, 110, 190, 270, 350].map((angle, i) => (
          <motion.circle
            key={`node-${i}`}
            cx={200 + Math.cos((angle * Math.PI) / 180) * 75}
            cy={200 + Math.sin((angle * Math.PI) / 180) * 75}
            r="5"
            fill="hsl(152 69% 31%)"
            style={{ filter: "url(#glow)" }}
            animate={{
              r: [5, 8, 5],
              opacity: [0.6, 1, 0.6],
              x: [0, Math.cos((angle * Math.PI) / 180) * 10, 0],
              y: [0, Math.sin((angle * Math.PI) / 180) * 10, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
          />
        ))}

        {/* Small accent particles */}
        {[15, 75, 135, 195, 255, 315].map((angle, i) => (
          <motion.circle
            key={`accent-${i}`}
            cx={200 + Math.cos((angle * Math.PI) / 180) * 100}
            cy={200 + Math.sin((angle * Math.PI) / 180) * 100}
            r="2"
            fill="hsl(188 86% 53% / 0.6)"
            animate={{
              r: [2, 4, 2],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
          />
        ))}
      </svg>
    </div>
  );
}

export function CtaSection() {
  return (
    <section
      id="cta"
      className="relative bg-[#0d1117] px-6 sm:px-10 py-24 lg:py-32 overflow-hidden"
      data-testid="section-cta"
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
          {/* Text content - left side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/3 px-3 py-1 text-[11px] font-mono tracking-widest text-muted-foreground uppercase mb-4">
              Ready to begin?
            </span>
            <h2 className="font-sans font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-5 leading-[1.1]">
              Ready to know where you stand?
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl lg:mx-0 mx-auto leading-relaxed mb-8">
              It&apos;s free to start. Upload your CV and get your full career
              intelligence report in under a minute — JST score, AI vulnerability
              readout, and ROI-ranked pivot pathways.
            </p>

            <div className="flex flex-col sm:flex-row items-center sm:items-center lg:items-center justify-center lg:justify-start gap-4">
              <Link
                to="/signup"
                data-testid="button-cta-upload"
                className="group inline-flex items-center justify-center gap-2 h-12 px-8 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200"
                style={{
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.15), 0 0 30px hsl(188 86% 53% / 0.25)",
                }}
              >
                <motion.div
                  animate={{ rotate: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Upload className="h-5 w-5" />
                </motion.div>
                Get Started Free
                <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/login"
                data-testid="button-cta-login"
                className="group inline-flex items-center justify-center gap-2 h-12 px-8 rounded-md border border-white/15 text-muted-foreground text-sm hover:border-white/30 hover:text-foreground hover:bg-white/4 transition-all duration-200"
              >
                <LogIn className="h-5 w-5" />
                Already have an account
              </Link>
            </div>
          </motion.div>

          {/* Animated illustration - right side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="hidden lg:block"
          >
            <CtaIllustration />
          </motion.div>
        </div>
      </div>
    </section>
  );
}