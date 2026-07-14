import { useState } from "react";
import { LoaderCircle, MailCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/apiError";
import { authService } from "@/services/auth.service";

interface EmailVerificationBannerProps {
  email: string;
}

/** Prompts signed-in users to finish the email verification they deferred. */
export function EmailVerificationBanner({ email }: EmailVerificationBannerProps) {
  const navigate = useNavigate();
  const [isRequestingCode, setIsRequestingCode] = useState(false);

  const requestVerificationCode = async () => {
    if (isRequestingCode) return;

    setIsRequestingCode(true);
    try {
      const { data } = await authService.resendCode();
      toast.success("Verification code sent", { description: data.message });
      navigate("/verify-account", { state: { email } });
    } catch (error) {
      toast.error("Couldn't send a verification code", {
        description: getApiErrorMessage(error, "Check your connection and try again."),
      });
    } finally {
      setIsRequestingCode(false);
    }
  };

  return (
    <section
      data-testid="email-verification-banner"
      aria-labelledby="email-verification-heading"
      className="relative z-10 mx-4 mt-4 flex flex-col gap-3 rounded-xl border border-primary/25 bg-primary/8 px-4 py-3 text-sm sm:mx-6 sm:flex-row sm:items-center sm:justify-between md:mx-10"
    >
      <div className="flex min-w-0 items-start gap-3">
        <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <h2 id="email-verification-heading" className="font-sans font-semibold text-foreground">
            Verify your email to secure your ARK account
          </h2>
          <p className="mt-0.5 text-muted-foreground">
            We’ll send a six-digit code to {email}.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => void requestVerificationCode()}
        disabled={isRequestingCode}
        data-testid="button-request-verification-code"
        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-primary/30 px-4 font-semibold text-primary transition-colors hover:border-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isRequestingCode ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            Sending code…
          </>
        ) : (
          "Verify email"
        )}
      </button>
    </section>
  );
}
