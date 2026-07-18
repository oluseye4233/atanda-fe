import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Lock, ArrowRight, Mail } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthField } from "@/components/auth/AuthField";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/contexts/AuthContext";
import { getApiErrorMessage } from "@/lib/apiError";

interface LocationState {
  from?: { pathname: string };
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const redirectTo =
    (location.state as LocationState | null)?.from?.pathname ?? "/dashboard";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError("");
    try {
      const { data: user } = await authService.login({ email, password });
      login(user);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Invalid email or password."));
      setIsLoading(false); // preserve entered input for retry
    }
  };

  return (
    <AuthLayout
      headline={
        <>
          KNOW YOUR WORTH.
          <br />
          <span className="text-destructive">KNOW YOUR RISK.</span>
          <br />
          <span className="text-primary">KNOW YOUR NEXT MOVE.</span>
        </>
      }
      blurb="Career intelligence that turns your CV into a strategy — in under 60 seconds."
    >
      <div className="mb-8">
        <h1 className="font-sans font-bold text-2xl text-white mb-1.5 tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your ARK account to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate data-testid="page-login">
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
          data-testid="input-username"
        />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="sr-only">Password</span>
            <Link
              to="/forgot-password"
              className="ml-auto text-[11px] text-primary/70 hover:text-primary transition-colors font-mono"
              data-testid="link-forgot-password"
            >
              Forgot password?
            </Link>
          </div>
          <AuthField
            label="Password"
            icon={Lock}
            isPassword
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            data-testid="input-password"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          data-testid="button-login"
          className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 mt-2 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 0 20px hsl(188 86% 53% / 0.2)" }}
        >
          {isLoading ? (
            <span className="font-mono text-xs tracking-wider animate-pulse">Authenticating…</span>
          ) : (
            <>
              Sign In
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link
          to="/signup"
          data-testid="link-toggle-auth-mode"
          className="text-primary hover:text-primary/80 transition-colors font-medium"
        >
          Sign up free
        </Link>
      </p>
    </AuthLayout>
  );
}
