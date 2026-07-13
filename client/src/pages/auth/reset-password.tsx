import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthField } from "@/components/auth/AuthField";
import { AuthAlert } from "@/components/auth/AuthAlert";
import { authService } from "@/services/auth.service";
import { getApiErrorMessage } from "@/lib/apiError";

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(pw)) return "Password needs an uppercase letter.";
  if (!/[a-z]/.test(pw)) return "Password needs a lowercase letter.";
  if (!/[0-9]/.test(pw)) return "Password needs a number.";
  return null;
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    const pwError = validatePassword(password);
    if (pwError) return setError(pwError);
    if (password !== confirm) return setError("Passwords don't match.");

    setIsLoading(true);
    setError("");
    try {
      await authService.resetPassword({ password });
      setDone(true);
      setTimeout(() => navigate("/login", { replace: true }), 1600);
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't reset your password. The code may have expired."));
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      accent="secondary"
      headline={
        <>
          Set a new
          <br />
          <span className="text-primary">password.</span>
        </>
      }
      blurb="Choose a strong password you haven't used before. You'll use it to sign in from now on."
    >
      <div className="mb-8">
        <h1 className="font-sans font-bold text-2xl text-white mb-1.5 tracking-tight">
          Create new password
        </h1>
        <p className="text-sm text-muted-foreground">
          At least 8 characters with an uppercase letter and a number.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate data-testid="page-reset-password">
        {error && <AuthAlert message={error} />}
        {done && <AuthAlert variant="success" message="Password updated. Redirecting to sign in…" />}

        <AuthField
          label="New password"
          icon={Lock}
          isPassword
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 8 chars, 1 upper, 1 number"
          autoComplete="new-password"
          minLength={8}
          required
          disabled={done}
          data-testid="input-password"
        />

        <AuthField
          label="Confirm password"
          icon={Lock}
          isPassword
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          minLength={8}
          required
          disabled={done}
          data-testid="input-confirm-password"
        />

        <button
          type="submit"
          disabled={isLoading || done}
          data-testid="button-reset-password"
          className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 0 20px hsl(188 86% 53% / 0.2)" }}
        >
          {isLoading ? (
            <span className="font-mono text-xs tracking-wider animate-pulse">Updating…</span>
          ) : (
            <>
              Update password
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
