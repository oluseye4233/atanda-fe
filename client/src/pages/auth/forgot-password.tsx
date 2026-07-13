import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthField } from "@/components/auth/AuthField";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { authService } from "@/services/auth.service";
import { getApiErrorMessage } from "@/lib/apiError";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError("");
    try {
      await authService.requestReset({ email });
      // Reset code emailed (rsid cookie set). Move to verification.
      navigate("/verify-reset", { state: { email } });
    } catch (err) {
      setError(getApiErrorMessage(err, "We couldn't find an account with that email."));
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      headline={
        <>
          Forgot your
          <br />
          <span className="text-primary">password?</span>
        </>
      }
      blurb="No problem. Enter your account email and we'll send you a code to reset it."
    >
      <div className="mb-8">
        <h1 className="font-sans font-bold text-2xl text-white mb-1.5 tracking-tight">
          Reset your password
        </h1>
        <p className="text-sm text-muted-foreground">
          We'll email you a 6-digit reset code.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate data-testid="page-forgot-password">
        {error && <AuthAlert message={error} />}

        <AuthField
          label="Email"
          icon={Mail}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          autoComplete="email"
          required
          data-testid="input-email"
        />

        <button
          type="submit"
          disabled={isLoading}
          data-testid="button-request-reset"
          className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 0 20px hsl(188 86% 53% / 0.2)" }}
        >
          {isLoading ? (
            <span className="font-mono text-xs tracking-wider animate-pulse">Sending code…</span>
          ) : (
            <>
              Send reset code
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
