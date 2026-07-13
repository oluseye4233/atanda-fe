import { useState, useEffect, useCallback } from "react";
import { ArrowRight } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { AuthAlert } from "./AuthAlert";
import { getApiErrorMessage } from "@/lib/apiError";

interface OtpVerifyProps {
  /** Email the code was sent to, shown in the helper copy */
  email?: string;
  /** Verify the 6-digit code. Throw to surface an error. */
  onVerify: (otp: string) => Promise<void>;
  /** Optional resend handler; returns seconds until the next allowed resend. */
  onResend?: () => Promise<number | void>;
  submitLabel?: string;
}

const RESEND_COOLDOWN = 30;

/** Shared 6-digit OTP form used by account verification and password reset. */
export function OtpVerify({ email, onVerify, onResend, submitLabel = "Verify" }: OtpVerifyProps) {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  const submit = useCallback(
    async (code: string) => {
      if (isVerifying) return;
      setIsVerifying(true);
      setError("");
      try {
        await onVerify(code);
      } catch (err) {
        setError(getApiErrorMessage(err, "That code didn't work. Try again."));
        setOtp("");
        setIsVerifying(false);
      }
    },
    [isVerifying, onVerify],
  );

  const handleChange = (value: string) => {
    setOtp(value);
    if (value.length === 6) void submit(value);
  };

  const handleResend = async () => {
    if (!onResend || cooldown > 0) return;
    setError("");
    setResent(false);
    try {
      const secs = await onResend();
      setCooldown(typeof secs === "number" && secs > 0 ? Math.min(secs, RESEND_COOLDOWN) : RESEND_COOLDOWN);
      setResent(true);
    } catch (err) {
      setError(getApiErrorMessage(err, "Couldn't resend the code."));
    }
  };

  return (
    <div className="space-y-5" data-testid="otp-verify">
      {error && <AuthAlert message={error} />}
      {resent && !error && <AuthAlert variant="success" message="A fresh code is on its way." />}

      <p className="text-sm text-muted-foreground">
        Enter the 6-digit code we sent{email ? <> to <span className="text-white font-medium">{email}</span></> : " to your email"}.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (otp.length === 6) void submit(otp);
        }}
        className="space-y-5"
      >
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={handleChange}
          disabled={isVerifying}
          containerClassName="justify-center"
          data-testid="input-otp"
        >
          <InputOTPGroup className="gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className="h-12 w-11 rounded-lg border border-white/15 bg-white/3 text-lg text-white first:rounded-l-lg last:rounded-r-lg"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>

        <button
          type="submit"
          disabled={isVerifying || otp.length !== 6}
          data-testid="button-verify-otp"
          className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 0 20px hsl(188 86% 53% / 0.2)" }}
        >
          {isVerifying ? (
            <span className="font-mono text-xs tracking-wider animate-pulse">Verifying…</span>
          ) : (
            <>
              {submitLabel}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {onResend && (
        <p className="text-center text-sm text-muted-foreground">
          Didn't get it?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0}
            data-testid="button-resend-otp"
            className="text-primary hover:text-primary/80 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </button>
        </p>
      )}
    </div>
  );
}
