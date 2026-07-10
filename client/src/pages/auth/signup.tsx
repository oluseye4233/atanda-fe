import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Mail, User, Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 600));
    setError("Backend coming soon. The platform is under active development.");
    setIsLoading(false);
  };

  return (
    <div
      className="min-h-screen w-full flex bg-[#0d1117] overflow-hidden"
      data-testid="page-signup"
    >
      {/* ── Left panel: brand ── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] px-14 py-12 relative overflow-hidden border-r border-white/6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 20% 50%, hsl(152 69% 31% / 0.09), transparent 70%)",
          }}
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
            href="/"
            className="font-display font-bold text-primary text-xl tracking-widest hover:text-primary/80 transition-colors"
          >
            ARK
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/25 bg-secondary/8 px-3.5 py-1.5 text-xs font-mono tracking-widest text-secondary uppercase mb-2">
            Free to start
          </div>
          <h2 className="font-display font-black text-3xl text-white leading-tight tracking-tight">
            Your career,
            <br />
            <span className="text-primary">intelligently mapped.</span>
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed max-w-sm">
            Upload your CV, get your JST Index score, see where AI threatens
            your role, and discover your highest-ROI next move — all in under
            a minute.
          </p>
        </div>

        <div className="relative z-10 space-y-3">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground/50 mb-3">
            What you get on the free tier
          </p>
          {[
            "Full CV analysis & JST score",
            "AI vulnerability classification",
            "3 pivot pathway suggestions",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-secondary shrink-0" />
              <span className="text-sm text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex flex-1 items-center justify-center px-6 sm:px-12 py-16 relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 80% 20%, hsl(188 86% 53% / 0.06), transparent 65%)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link
              href="/"
              className="font-display font-bold text-primary text-2xl tracking-widest"
            >
              ARK
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="font-sans font-bold text-2xl text-white mb-1.5 tracking-tight">
              Create your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Free forever. No credit card required.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive font-mono"
                data-testid="text-auth-error"
              >
                {error}
              </motion.div>
            )}

            {/* Full name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                <input
                  data-testid="input-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/3 pl-10 pr-4 py-3 text-sm text-white placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all"
                  placeholder="Jane Smith"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                <input
                  data-testid="input-username"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/3 pl-10 pr-4 py-3 text-sm text-white placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                <input
                  data-testid="input-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/3 pl-10 pr-11 py-3 text-sm text-white placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all"
                  placeholder="Min. 8 characters"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground/50 leading-relaxed">
              By signing up you agree to our{" "}
              <Link href="/terms" className="text-primary/70 hover:text-primary transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary/70 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              .
            </p>

            <button
              data-testid="button-register"
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
              style={{
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.15), 0 0 20px hsl(188 86% 53% / 0.2)",
              }}
            >
              {isLoading ? (
                <span className="font-mono text-xs tracking-wider animate-pulse">
                  Creating account…
                </span>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              data-testid="link-toggle-auth-mode"
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Sign in
            </Link>
          </p>

          <p className="mt-8 text-center text-[11px] font-mono text-muted-foreground/30 uppercase tracking-widest">
            Protected by ARK · Junglenomics Governance
          </p>
        </motion.div>
      </div>
    </div>
  );
}
