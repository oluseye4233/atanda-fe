import { Link } from "wouter";
import {
  ArrowRight, ShieldAlert, Target, Zap, Crown, GraduationCap,
  User, Building2, Check, Upload, BarChart3, Compass, LogIn,
} from "lucide-react";
import { SUBSCRIPTION_PLANS } from "@shared/schema";
import { FEATURES } from "@shared/featureFlags";
import { useAuth } from "@/lib/useAuth";

// ─── TopNav ───────────────────────────────────────────────────────────────────

function TopNav({ user, isLoading }: {
  user: ReturnType<typeof useAuth>["user"];
  isLoading: boolean;
}) {
  return (
    <nav
      className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-6 sm:px-10 h-14 border-b border-white/6 bg-background/90 backdrop-blur-md"
      data-testid="home-topnav"
    >
      <div className="flex items-center gap-3">
        <span className="font-display font-bold text-primary text-base tracking-widest">ARK</span>
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
              className="h-8 px-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              data-testid="button-landing-signup"
              className="h-8 px-4 inline-flex items-center rounded-md border border-white/20 text-sm text-foreground hover:border-white/35 hover:bg-white/5 transition-all"
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
            className="h-8 px-4 inline-flex items-center rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
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
      className="relative flex flex-col items-center justify-center text-center min-h-screen px-6 sm:px-10 pt-14 pb-20 bg-background overflow-hidden"
      data-testid="section-hero"
    >
      {/* Centered radial spotlight — light source aimed at the headline */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* Full-bleed ambient photo — dark tinted */}
        <img
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1800&q=60&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.06]"
          loading="eager"
          aria-hidden="true"
        />
        {/* Primary spotlight: centered ellipse from the top */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 90% 55% at 50% 0%, hsl(188 86% 53% / 0.13), transparent 70%)",
          }}
        />
        {/* Grain texture */}
        <div className="hero-grain absolute w-[calc(100%+200px)] h-[calc(100%+200px)] top-[-100px] left-[-100px]" />
        {/* Subtle ambient fill — very dim, bottom half only */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 70% 40% at 50% 100%, hsl(152 69% 31% / 0.05), transparent 65%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-8">

        {/* h1 — original copy, pure white, no accent colors */}
        <h1
          className="font-display font-black leading-[1.06] tracking-tight text-4xl sm:text-5xl md:text-[3.75rem] text-white"
          data-testid="hero-heading"
        >
          KNOW YOUR WORTH.<br />
          KNOW YOUR RISK.<br />
          KNOW YOUR NEXT MOVE.
        </h1>

        {/* Subtext */}
        <p className="text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed">
          Upload your CV and, in under 60 seconds, see how marketable you are
          today, where AI puts you at risk, and the smartest next move you can make.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/upload"
            data-testid="button-hero-upload"
            className="inline-flex items-center gap-2 h-11 px-7 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all"
            style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 0 20px hsl(188 86% 53% / 0.25)" }}
          >
            <Upload className="h-4 w-4" />
            Analyze My CV
          </Link>
          <Link
            href="/demo-tour"
            data-testid="button-hero-demo"
            className="inline-flex items-center gap-2 h-11 px-7 rounded-md border border-white/20 text-sm text-muted-foreground hover:border-white/35 hover:text-foreground transition-all"
          >
            See the Demo Tour
            <ArrowRight className="h-4 w-4" />
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

// ─── How It Works (light) ─────────────────────────────────────────────────────

function HowItWorksSection() {
  const steps = [
    { step: "1", icon: Upload, title: "Upload your CV",       body: "PDF, DOCX or paste text — takes 10 seconds." },
    { step: "2", icon: BarChart3, title: "Get your JST score", body: "Your career capital, benchmarked vs the live market." },
    { step: "3", icon: Compass, title: "See your next move",   body: "Pivot paths and skills ranked by ROI." },
  ];

  return (
    <section id="how-it-works" className="section-light px-6 sm:px-10 py-20" data-testid="section-how-it-works">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-sans font-bold text-2xl sm:text-3xl text-[#0f1623] mb-3 tracking-tight">
            How it works
          </h2>
          <p className="text-[#6b7280] text-sm max-w-xs mx-auto leading-relaxed">
            Three steps. Under a minute.
          </p>
        </div>

        {/* Two-column layout: photo left, steps right on lg+ */}
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          {/* Photo */}
          <div className="w-full lg:w-2/5 shrink-0">
            <div className="rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.12)]">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&q=75&auto=format&fit=crop"
                alt="Professional reviewing career assessment on laptop"
                className="w-full h-64 lg:h-80 object-cover object-top"
                loading="lazy"
              />
            </div>
          </div>

          {/* Steps */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
            {steps.map(({ step, icon: Icon, title, body }) => (
              <div
                key={step}
                className="relative rounded-2xl border border-slate-200/80 bg-white px-6 pt-7 pb-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.09)] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                data-testid={`landing-step-${step}`}
              >
                <span className="absolute -top-2 right-4 font-display font-black text-[5.5rem] leading-none select-none text-slate-100 pointer-events-none">
                  {step}
                </span>
                <div className="relative z-10 flex items-start gap-4">
                  <div className="inline-flex items-center justify-center h-9 w-9 shrink-0 rounded-lg bg-primary/8 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-sans font-semibold text-[#0f1623] text-base mb-1">{title}</h3>
                    <p className="text-sm text-[#6b7280] leading-relaxed">{body}</p>
                  </div>
                </div>
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
      title: "JST Index Valuation",
      body: "Computes a tri-dimensional career capital score calibrated against live labor market data.",
    },
    {
      icon: ShieldAlert,
      iconClass: "text-destructive bg-destructive/10",
      title: "AI Vulnerability",
      body: "5-level vulnerability classification with task-level automation risk scoring.",
    },
    {
      icon: Target,
      iconClass: "text-secondary bg-secondary/10",
      title: "12-Vector Mobility",
      body: "Maps career mobility across 12 orthogonal dimensions to generate optimal pivot pathways.",
    },
  ];

  return (
    <section className="bg-background px-6 sm:px-10 py-20" data-testid="section-features">
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
          <div className="rounded-2xl overflow-hidden mb-8 shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=70&auto=format&fit=crop"
              alt="Career data analytics dashboard"
              className="w-full h-44 sm:h-56 object-cover opacity-70"
              loading="lazy"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, iconClass, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/6 bg-white/3 p-6 flex flex-col gap-4 hover:-translate-y-0.5 transition-all duration-200"
                style={{
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 1px 3px rgba(0,0,0,0.4)",
                }}
              >
                <div className={`inline-flex items-center justify-center h-9 w-9 rounded-lg ${iconClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-sans font-semibold text-white text-base mb-1.5">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
  );
}

// ─── Pricing (light) ──────────────────────────────────────────────────────────

function PricingSection() {
  const plans = [
    { key: "INDIVIDUAL_FREE",  icon: User },
    { key: "INDIVIDUAL_PRO",   icon: Crown },
    { key: "SCHOOL_STUDENT",   icon: GraduationCap },
    { key: "ENTERPRISE",       icon: Building2 },
  ] as const;

  return (
    <section className="section-light px-6 sm:px-10 py-20" data-testid="section-pricing">
      <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-sans font-bold text-2xl sm:text-3xl text-[#0f1623] mb-3 tracking-tight">
              Access Tiers
            </h2>
            <p className="text-[#6b7280] text-sm">
              Individual & School Plans Available
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map(({ key, icon: Icon }) => {
              const plan = SUBSCRIPTION_PLANS[key];
              const isPopular = key === "INDIVIDUAL_PRO";
              return (
                <div
                  key={key}
                  className={`relative rounded-2xl bg-white px-5 py-6 flex flex-col shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.09)] hover:-translate-y-0.5 transition-all duration-200 border ${
                    isPopular ? "border-slate-200 border-l-[3px] border-l-primary" : "border-slate-200"
                  }`}
                  data-testid={`card-home-plan-${key.toLowerCase()}`}
                >
                  {isPopular && (
                    <span className="absolute -top-2.5 left-5 bg-primary text-primary-foreground text-[9px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full whitespace-nowrap">
                      Popular
                    </span>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: plan.color }} />
                    <span className="font-sans font-medium text-xs text-[#374151] tracking-wide">{plan.label}</span>
                  </div>

                  <div className="mb-4">
                    {plan.price === 0 ? (
                      <span className="font-sans font-bold text-2xl text-[#0f1623]">
                        {key === "ENTERPRISE" ? "Custom" : "Free"}
                      </span>
                    ) : (
                      <span className="font-sans font-bold text-2xl text-[#0f1623]">
                        ${plan.price}
                        <span className="text-xs text-[#9ca3af] font-normal ml-0.5">/{plan.period}</span>
                      </span>
                    )}
                  </div>

                  <ul className="space-y-2 flex-1">
                    {plan.features.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="h-3 w-3 mt-0.5 shrink-0 text-[#9ca3af]" />
                        <span className="text-xs text-[#6b7280] leading-snug">{f}</span>
                      </li>
                    ))}
                    {plan.features.length > 4 && (
                      <li className="text-xs text-[#d1d5db] pl-4">
                        +{plan.features.length - 4} more
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/subscription"
              data-testid="link-view-plans"
              className="inline-flex items-center gap-1.5 text-[#374151] text-sm hover:text-primary transition-colors"
            >
              View All Plans & Features <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
  );
}

// ─── CTA (dark) ───────────────────────────────────────────────────────────────

function CtaSection() {
  return (
    <section className="bg-background px-6 sm:px-10 py-24" data-testid="section-cta">
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
              className="inline-flex items-center gap-2 h-11 px-7 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all"
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 0 20px hsl(188 86% 53% / 0.2)" }}
            >
              <Upload className="h-4 w-4" /> Get Started Free
            </Link>
            <Link
              href="/login"
              data-testid="button-cta-login"
              className="inline-flex items-center gap-2 h-11 px-7 rounded-md border border-white/15 text-muted-foreground text-sm hover:border-white/30 hover:text-foreground transition-all"
            >
              <LogIn className="h-4 w-4" /> Already have an account
            </Link>
          </div>
        </div>
      </section>
  );
}

// ─── Footer (deep dark) ───────────────────────────────────────────────────────

function HomeFooter() {
  return (
    <footer className="bg-[hsl(222,47%,7%)] border-t border-white/5 px-6 sm:px-10 py-8" data-testid="home-footer">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground/40">
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-primary/80 text-sm tracking-widest">ARK</span>
          <span className="text-muted-foreground/20">·</span>
          <span>Powered by Junglenomics</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/privacy" className="hover:text-muted-foreground transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-muted-foreground transition-colors">Terms</Link>
          {FEATURES.investorDemo && (
            <Link href="/demo" className="hover:text-muted-foreground transition-colors">Demo</Link>
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
        <PricingSection />
        <CtaSection />
      </main>
      <HomeFooter />
    </div>
  );
}
