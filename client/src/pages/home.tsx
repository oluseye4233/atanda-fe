import { Link } from "wouter";
import {
  ArrowRight,
  ShieldAlert,
  Target,
  Zap,
  Upload,
  BarChart3,
  Compass,
  LogIn,
  FileText,
} from "lucide-react";
import { FEATURES } from "@shared/featureFlags";
import { useAuth } from "@/lib/useAuth";

// ─── TopNav ───────────────────────────────────────────────────────────────────

function TopNav({
  user,
  isLoading,
}: {
  user: ReturnType<typeof useAuth>["user"];
  isLoading: boolean;
}) {
  return (
    <nav
      className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-6 sm:px-10 h-14 border-b border-white/[0.07] bg-[#0d1117]/80 backdrop-blur-xl"
      data-testid="home-topnav"
    >
      <div className="flex items-center gap-3">
        <span className="font-display font-bold text-primary text-base tracking-widest">
          ARK
        </span>
        <span className="hidden sm:block h-3.5 w-px bg-white/15" />
        <span className="hidden sm:block text-xs text-muted-foreground/60">
          Career Intelligence
        </span>
      </div>

      <div className="flex items-center gap-1">
        {!isLoading && !user && (
          <>
            <Link
              href="/login"
              data-testid="button-landing-login"
              className="h-8 px-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all duration-150 rounded-md"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              data-testid="button-landing-signup"
              className="h-8 px-4 inline-flex items-center rounded-md border border-white/15 text-sm text-foreground hover:border-white/30 hover:bg-white/[0.06] hover:-translate-y-px transition-all duration-150"
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}
            >
              Sign up
            </Link>
          </>
        )}
        {!isLoading && user && (
          <Link
            href="/dashboard"
            data-testid="button-go-to-dashboard"
            className="h-8 px-4 inline-flex items-center rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 hover:-translate-y-px hover:shadow-[0_4px_16px_hsl(188_86%_53%/0.35)] transition-all duration-150"
            style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)" }}
          >
            Dashboard
          </Link>
        )}
      </div>
    </nav>
  );
}

// ─── Hero (dark) ──────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section
      className="relative flex flex-col items-center justify-center text-center min-h-screen px-6 sm:px-10 pt-14 pb-20 bg-[#0d1117] overflow-hidden"
      data-testid="section-hero"
    >
      {/* Centered radial spotlight — light source aimed at the headline */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* Full-bleed ambient photo — dark tinted */}
        <img
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1800&q=60&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.05]"
          loading="eager"
          aria-hidden="true"
        />
        {/* Primary spotlight: centered ellipse from the top */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 55% at 50% 0%, hsl(188 86% 53% / 0.14), transparent 70%)",
          }}
        />
        {/* Grain texture */}
        <div className="hero-grain absolute w-[calc(100%+200px)] h-[calc(100%+200px)] top-[-100px] left-[-100px]" />
        {/* Subtle ambient fill — very dim, bottom half only */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 40% at 50% 100%, hsl(152 69% 31% / 0.05), transparent 65%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-8">
        {/* h1 — original copy, pure white, no accent colors, sized down from previous pass */}
        <h1
          className="font-display font-black leading-[1.1] tracking-tight text-3xl sm:text-4xl md:text-[3rem] text-white"
          data-testid="hero-heading"
        >
          KNOW YOUR WORTH.
          <br />
          KNOW YOUR RISK.
          <br />
          KNOW YOUR NEXT MOVE.
        </h1>

        {/* Subtext */}
        <p className="text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed">
          Upload your CV and, in under 60 seconds, see how marketable you are
          today, where AI puts you at risk, and the smartest next move you can
          make.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/upload"
            data-testid="button-hero-upload"
            className="group inline-flex items-center gap-2 h-11 px-7 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200"
            style={{
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.15), 0 0 20px hsl(188 86% 53% / 0.25)",
            }}
          >
            <Upload className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
            Analyze My CV
          </Link>
          <Link
            href="/demo-tour"
            data-testid="button-hero-demo"
            className="group inline-flex items-center gap-2 h-11 px-7 rounded-md border border-white/20 text-sm text-muted-foreground hover:border-white/35 hover:text-foreground hover:bg-white/[0.04] transition-all duration-200"
          >
            See the Demo Tour
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Proof line */}
        <p className="text-xs text-muted-foreground/35 tracking-wider">
          No credit card · Results in 60 seconds · Free tier available
        </p>
      </div>
    </section>
  );
}

// ─── How It Works (light) — redesigned as a connected timeline ───────────────

function HowItWorksSection() {
  const steps = [
    {
      n: "01",
      icon: Upload,
      title: "Upload your CV",
      body: "PDF, DOCX or paste text — takes 10 seconds.",
      preview: (
        <div className="flex items-center gap-2.5 rounded-lg border border-dashed border-slate-300 bg-slate-50/80 px-3 py-2.5">
          <div className="h-7 w-7 shrink-0 rounded-md bg-white border border-slate-200 flex items-center justify-center">
            <FileText className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="h-1.5 rounded-full bg-slate-200 w-full" />
            <div className="h-1.5 rounded-full bg-slate-200 w-2/3" />
          </div>
        </div>
      ),
    },
    {
      n: "02",
      icon: BarChart3,
      title: "Get your JST score",
      body: "Your career capital, benchmarked vs the live market.",
      preview: (
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5">
          <div
            className="relative h-10 w-10 shrink-0 rounded-full grid place-items-center"
            style={{
              background:
                "conic-gradient(hsl(188 86% 53%) 0% 78%, hsl(214 15% 89%) 78% 100%)",
            }}
          >
            <div className="h-7 w-7 rounded-full bg-slate-50 grid place-items-center">
              <span className="font-mono font-bold text-[10px] text-[#0f1623]">
                78
              </span>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-[11px] font-medium text-[#374151]">
              JST Index
            </div>
            <div className="text-[10px] text-[#9ca3af]">
              Above market median
            </div>
          </div>
        </div>
      ),
    },
    {
      n: "03",
      icon: Compass,
      title: "See your next move",
      body: "Pivot paths and skills ranked by ROI.",
      preview: (
        <div className="flex items-end gap-1.5 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 h-[52px]">
          <div className="w-3.5 rounded-sm bg-primary/70 h-full" />
          <div
            className="w-3.5 rounded-sm bg-primary/45"
            style={{ height: "70%" }}
          />
          <div
            className="w-3.5 rounded-sm bg-primary/25"
            style={{ height: "45%" }}
          />
          <div className="flex-1 pl-2 self-center">
            <div className="text-[10px] text-[#9ca3af]">Ranked by ROI</div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section
      id="how-it-works"
      className="section-light px-6 sm:px-10 py-24"
      data-testid="section-how-it-works"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-sans font-bold text-2xl sm:text-3xl text-[#0f1623] mb-3 tracking-tight">
            How it works
          </h2>
          <p className="text-[#6b7280] text-sm max-w-xs mx-auto leading-relaxed">
            Three steps. Under a minute.
          </p>
        </div>

        <div className="relative">
          {/* Connector line spanning between node centers, desktop only */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-8 left-[16.6%] right-[16.6%] h-px bg-gradient-to-r from-slate-200 via-primary/40 to-slate-200 z-0"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 relative z-10">
            {steps.map(({ n, icon: Icon, title, body, preview }) => (
              <div
                key={n}
                className="group flex flex-col items-center text-center"
                data-testid={`landing-step-${n}`}
              >
                {/* Node */}
                <div className="relative mb-6">
                  <div className="h-16 w-16 rounded-full bg-white border-2 border-slate-200 grid place-items-center shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-all duration-300 group-hover:border-primary group-hover:shadow-[0_6px_24px_hsl(188_86%_53%/0.25)]">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-[#0f1623] text-white text-[10px] font-mono font-semibold grid place-items-center">
                    {n}
                  </span>
                </div>

                <h3 className="font-sans font-semibold text-[#0f1623] text-base mb-1.5">
                  {title}
                </h3>
                <p className="text-sm text-[#6b7280] leading-relaxed mb-5 max-w-[240px]">
                  {body}
                </p>

                <div className="w-full max-w-[260px]">{preview}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Features (dark) ──────────────────────────────────────────────────────────

function FeaturesSection() {
  const features = [
    {
      icon: Zap,
      iconClass: "text-primary bg-primary/10",
      glow: "hsl(188 86% 53% / 0.18)",
      title: "JST Index Valuation",
      body: "Computes a tri-dimensional career capital score calibrated against live labor market data.",
    },
    {
      icon: ShieldAlert,
      iconClass: "text-destructive bg-destructive/10",
      glow: "hsl(0 72% 51% / 0.16)",
      title: "AI Vulnerability",
      body: "5-level vulnerability classification with task-level automation risk scoring.",
    },
    {
      icon: Target,
      iconClass: "text-secondary bg-secondary/10",
      glow: "hsl(152 69% 31% / 0.18)",
      title: "12-Vector Mobility",
      body: "Maps career mobility across 12 orthogonal dimensions to generate optimal pivot pathways.",
    },
  ];

  return (
    <section
      className="bg-[#0d1117] px-6 sm:px-10 py-20"
      data-testid="section-features"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-sans font-bold text-2xl sm:text-3xl text-white mb-3 tracking-tight">
            What ARK gives you
          </h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
            Three intelligence layers most career tools miss entirely.
          </p>
        </div>

        {/* Wide photo strip */}
        <div className="rounded-2xl overflow-hidden mb-8 shadow-[0_2px_20px_rgba(0,0,0,0.5)] border border-white/[0.06]">
          <img
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=70&auto=format&fit=crop"
            alt="Career data analytics dashboard"
            className="w-full h-44 sm:h-56 object-cover opacity-70"
            loading="lazy"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, iconClass, glow, title, body }) => (
            <div
              key={title}
              className="group relative rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl p-6 flex flex-col gap-4 hover:bg-white/[0.055] hover:border-white/[0.14] hover:-translate-y-1 transition-all duration-300"
              style={{
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.06), 0 1px 3px rgba(0,0,0,0.4)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  `inset 0 1px 0 rgba(255,255,255,0.08), 0 12px 32px rgba(0,0,0,0.45), 0 0 0 1px ${glow}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "inset 0 1px 0 rgba(255,255,255,0.06), 0 1px 3px rgba(0,0,0,0.4)";
              }}
            >
              <div
                className={`inline-flex items-center justify-center h-9 w-9 rounded-lg ${iconClass} transition-transform duration-300 group-hover:scale-110`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-sans font-semibold text-white text-base mb-1.5">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA (dark) ───────────────────────────────────────────────────────────────

function CtaSection() {
  return (
    <section
      className="bg-[#0d1117] px-6 sm:px-10 py-24"
      data-testid="section-cta"
    >
      <div className="max-w-lg mx-auto text-center flex flex-col items-center gap-5">
        <h2 className="font-sans font-bold text-2xl sm:text-3xl text-white tracking-tight">
          Ready to know where you stand?
        </h2>
        <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
          It's free to start. Upload your CV and get your full career
          intelligence report in under a minute.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <Link
            href="/upload"
            data-testid="button-cta-upload"
            className="group inline-flex items-center gap-2 h-11 px-7 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200"
            style={{
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.15), 0 0 20px hsl(188 86% 53% / 0.2)",
            }}
          >
            <Upload className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
            Get Started Free
          </Link>
          <Link
            href="/login"
            data-testid="button-cta-login"
            className="group inline-flex items-center gap-2 h-11 px-7 rounded-md border border-white/15 text-muted-foreground text-sm hover:border-white/30 hover:text-foreground hover:bg-white/[0.04] transition-all duration-200"
          >
            <LogIn className="h-4 w-4" />
            Already have an account
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Footer (deep dark) ───────────────────────────────────────────────────────

function HomeFooter() {
  return (
    <footer
      className="bg-[#0a0d12] border-t border-white/[0.06] px-6 sm:px-10 py-8"
      data-testid="home-footer"
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground/40">
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-primary/80 text-sm tracking-widest">
            ARK
          </span>
          <span className="text-muted-foreground/20">·</span>
          <span>Powered by Junglenomics</span>
        </div>
        <div className="flex items-center gap-5">
          <Link
            href="/privacy"
            className="hover:text-muted-foreground transition-colors duration-150"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="hover:text-muted-foreground transition-colors duration-150"
          >
            Terms
          </Link>
          {FEATURES.investorDemo && (
            <Link
              href="/demo"
              className="hover:text-muted-foreground transition-colors duration-150"
            >
              Demo
            </Link>
          )}
        </div>
        <span>© 2026 ARK Platform</span>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const { user, isLoading } = useAuth();
  return (
    <div className="min-h-screen" data-testid="page-home">
      <TopNav user={user} isLoading={isLoading} />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <CtaSection />
      </main>
      <HomeFooter />
    </div>
  );
}
