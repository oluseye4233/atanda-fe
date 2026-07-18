import { useNavigate, useLocation, Link } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { OtpVerify } from "@/components/auth/OtpVerify";
import { authService } from "@/services/auth.service";

interface LocationState {
  email?: string;
}

export default function VerifyAccountPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as LocationState | null)?.email;

  const handleVerify = async (otp: string) => {
    await authService.verifyAccount({ otp });
    // Verified — send them to dashboard.
    navigate("/dashboard", { replace: true });
  };

  const handleResend = async () => {
    const { data } = await authService.resendCode();
    return data.expiresInSeconds;
  };

  return (
    <AuthLayout
      accent="secondary"
      headline={
        <>
          One quick step
          <br />
          <span className="text-primary">to secure your account.</span>
        </>
      }
      blurb="We sent a 6-digit verification code to your email. Enter it to activate your ARK account."
    >
      <div className="mb-8">
        <h1 className="font-sans font-bold text-2xl text-white mb-1.5 tracking-tight">
          Verify your email
        </h1>
        <p className="text-sm text-muted-foreground">
          This keeps your career data safe.
        </p>
      </div>

      <OtpVerify
        email={email}
        onVerify={handleVerify}
        onResend={handleResend}
        submitLabel="Verify account"
      />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Wrong email?{" "}
        <Link to="/signup" className="text-primary hover:text-primary/80 transition-colors font-medium">
          Start over
        </Link>
      </p>
    </AuthLayout>
  );
}