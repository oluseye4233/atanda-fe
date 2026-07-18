import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, ArrowRight, Mail, User } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthField } from "@/components/auth/AuthField";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { authService } from "@/services/auth.service";
import { getApiErrorMessage } from "@/lib/apiError";

// Password policy mirrors the backend: ≥8 chars, upper + lower + number.
function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(pw)) return "Password needs an uppercase letter.";
  if (!/[a-z]/.test(pw)) return "Password needs a lowercase letter.";
  if (!/[0-9]/.test(pw)) return "Password needs a number.";
  return null;
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    const pwError = validatePassword(password);
    if (pwError) {
      setError(pwError);
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      await authService.signup({ name, email, password });
      // Account created + OTP emailed (vsid cookie set). Move to verification.
      navigate("/verify-account", { state: { email } });
    } catch (err) {
      if (err && typeof err === "object" && "response" in err && err.response && typeof err.response === "object" && "status" in err.response && err.response.status === 409) {
        setError("An account with this email already exists. Please sign in instead.");
      } else {
        setError(getApiErrorMessage(err, "Couldn't create your account. Please try again."));
      }
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Free to start"
      accent="secondary"
      headline={
        <>
          Your career,
          <br />
          <span className="text-primary">intelligently mapped.</span>
        </>
      }
      blurb="Upload your CV, get your JST Index score, see where AI threatens your role, and discover your highest-ROI next move — all in under a minute."
      bullets={[
        { label: "Full CV analysis & JST score" },
        { label: "AI vulnerability classification" },
        { label: "3 pivot pathway suggestions" },
      ]}
    >
      <div className="mb-8">
        <h1 className="font-sans font-bold text-2xl text-white mb-1.5 tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Free forever. No credit card required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate data-testid="page-signup">
        {error && <AuthAlert message={error} />}

        <AuthField
          label="Full name"
          icon={User}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Smith"
          autoComplete="name"
          required
          data-testid="input-name"
        />

        <AuthField
          label="Email"
          icon={Mail}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          autoComplete="email"
          required
          data-testid="input-username"
        />

        <AuthField
          label="Password"
          icon={Lock}
          isPassword
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 8 chars, 1 upper, 1 number"
          autoComplete="new-password"
          minLength={8}
          required
          data-testid="input-password"
        />

        <p className="text-[11px] text-muted-foreground/50 leading-relaxed">
          By signing up you agree to our{" "}
          <Link to="/terms" className="text-primary/70 hover:text-primary transition-colors">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-primary/70 hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          .
        </p>

        <button
          type="submit"
          disabled={isLoading}
          data-testid="button-register"
          className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 0 20px hsl(188 86% 53% / 0.2)" }}
        >
          {isLoading ? (
            <span className="font-mono text-xs tracking-wider animate-pulse">Creating account…</span>
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
          to="/login"
          data-testid="link-toggle-auth-mode"
          className="text-primary hover:text-primary/80 transition-colors font-medium"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
