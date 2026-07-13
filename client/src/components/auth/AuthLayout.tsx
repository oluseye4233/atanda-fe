import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface BrandBullet {
  label: string;
}

interface AuthLayoutProps {
  /** Small eyebrow pill on the brand panel (e.g. "Free to start") */
  eyebrow?: string;
  /** Brand-panel headline (supports JSX for colored spans) */
  headline: ReactNode;
  /** Brand-panel supporting copy */
  blurb: string;
  /** Optional bulleted proof points under the blurb */
  bullets?: BrandBullet[];
  /** Accent color for the ambient glow — cyan (primary) or emerald (secondary) */
  accent?: "primary" | "secondary";
  /** The form column */
  children: ReactNode;
}

/**
 * Shared two-panel shell for every auth screen (login, signup, OTP, reset).
 * Left = brand story (hidden on mobile). Right = the form, animated in.
 */
export function AuthLayout({
  eyebrow,
  headline,
  blurb,
  bullets,
  accent = "primary",
  children,
}: AuthLayoutProps) {
  const glow =
    accent === "secondary"
      ? "hsl(152 69% 31% / 0.10)"
      : "hsl(188 86% 53% / 0.10)";
  const formGlow =
    accent === "secondary"
      ? "hsl(188 86% 53% / 0.06)"
      : "hsl(152 69% 31% / 0.07)";

  return (
    <div className="min-h-screen w-full flex bg-[#0d1117] overflow-hidden" data-testid="auth-layout">
      {/* ── Brand panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] px-14 py-12 relative overflow-hidden border-r border-white/6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse 80% 60% at 20% 50%, ${glow}, transparent 70%)` }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10">
          <Link
            to="/"
            className="font-display font-bold text-primary text-xl tracking-widest hover:text-primary/80 transition-colors"
          >
            ARK
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1.5 text-xs font-mono tracking-widest text-primary uppercase">
              {eyebrow}
            </div>
          )}
          <h2 className="font-display font-black text-3xl text-white leading-tight tracking-tight">
            {headline}
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed max-w-sm">
            {blurb}
          </p>
        </div>

        {bullets && bullets.length > 0 ? (
          <div className="relative z-10 space-y-3">
            {bullets.map((b) => (
              <div key={b.label} className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-secondary shrink-0" />
                <span className="text-sm text-muted-foreground">{b.label}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative z-10" />
        )}
      </div>

      {/* ── Form panel ── */}
      <div className="flex flex-1 items-center justify-center px-6 sm:px-12 py-16 relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(ellipse 70% 50% at 80% 20%, ${formGlow}, transparent 65%)` }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-sm"
        >
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="font-display font-bold text-primary text-2xl tracking-widest">
              ARK
            </Link>
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
