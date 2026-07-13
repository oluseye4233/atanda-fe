import { useNavigate, useLocation, Link } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { OtpVerify } from "@/components/auth/OtpVerify";
import { authService } from "@/services/auth.service";

interface LocationState {
  email?: string;
}

export default function VerifyResetPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as LocationState | null)?.email;

  const handleVerify = async (otp: string) => {
    await authService.verifyRequestReset({ otp });
    // Code accepted — proceed to set a new password.
    navigate("/reset-password", { replace: true });
  };

  const handleResend = async () => {
    // Re-requesting a reset re-sends the code and refreshes the rsid cookie.
    if (!email) return;
    const { data } = await authService.requestReset({ email });
    return data.expiresInSeconds;
  };

  return (
    <AuthLayout
      headline={
        <>
          Check your inbox
          <br />
          <span className="text-primary">for the reset code.</span>
        </>
      }
      blurb="Enter the 6-digit code we just emailed you to continue resetting your password."
    >
      <div className="mb-8">
        <h1 className="font-sans font-bold text-2xl text-white mb-1.5 tracking-tight">
          Enter reset code
        </h1>
        <p className="text-sm text-muted-foreground">
          The code expires shortly, so enter it soon.
        </p>
      </div>

      <OtpVerify
        email={email}
        onVerify={handleVerify}
        onResend={email ? handleResend : undefined}
        submitLabel="Confirm code"
      />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link to="/forgot-password" className="text-primary hover:text-primary/80 transition-colors font-medium">
          Use a different email
        </Link>
      </p>
    </AuthLayout>
  );
}
