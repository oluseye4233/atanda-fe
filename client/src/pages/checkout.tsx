import { useState, useEffect } from "react";
import { useMatch, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/useAuth";
import { getApiErrorMessage } from "@/lib/apiError";
import { billingService, type CheckoutSession } from "@/services/billing.service";
import { plansService } from "@/services/plans.service";
import type { Plan } from "@/types/plans";
import { CreditCard, Lock, X, CheckCircle2, AlertTriangle, Loader2, ArrowRight } from "lucide-react";

type Step = "loading" | "form" | "processing" | "complete" | "failed" | "error";

export default function CheckoutPage() {
  const match = useMatch("/checkout/:id");
  const params = match?.params as { id: string } | undefined;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [step, setStep] = useState<Step>("form");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cardNum, setCardNum] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("123");

  const sessionIdFromUrl = searchParams.get("session_id");
  const isReturnFromStripe = !!sessionIdFromUrl;

  const checkoutQuery = useQuery({
    queryKey: ["/v1/billing/checkout", params?.id],
    queryFn: async (): Promise<CheckoutSession | null> => {
      if (!params?.id) return null;
      try {
        const response = await billingService.getCheckoutSession(params.id);
        return response.data;
      } catch {
        return null;
      }
    },
    enabled: !!params?.id && !isReturnFromStripe,
    retry: false,
  });

  const session = checkoutQuery.data ?? null;
  const initialStep: Step = isReturnFromStripe
    ? "processing"
    : checkoutQuery.isPending
      ? "loading"
      : !session
        ? "error"
        : session.status === "completed"
          ? "complete"
          : session.status === "failed" || session.status === "canceled"
            ? "failed"
            : "form";

  const displayStep = step === "form" ? initialStep : step;
  const checkoutError = checkoutQuery.isPending || session
    ? errorMsg
    : errorMsg ?? "Could not load checkout session. Please check your connection and try again.";

  const submit = async (success: boolean) => {
    if (!session) return;
    setStep("processing");
    setErrorMsg(null);
    await new Promise((resolve) => setTimeout(resolve, success ? 1400 : 700));

    try {
      const response = await billingService.completeCheckout(session.id, success);
      if (response.data.ok) {
        await billingService.completeCheckout(session.id, true);
        updateUser({
          subscriptionPlan: session.plan,
          subscriptionStatus: "active",
          ...(session.institution ? { institution: session.institution } : {}),
        });
        setStep("complete");
        setTimeout(() => navigate("/subscription"), 1600);
      } else {
        setStep("failed");
      }
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Couldn't complete checkout. Please try again.");
      if (message.toLowerCase().includes("payment failed")) {
        setStep("failed");
      } else {
        setErrorMsg(message);
        setStep("error");
      }
    }
  };

  useEffect(() => {
    if (isReturnFromStripe && sessionIdFromUrl) {
      const completeCheckout = async () => {
        setStep("processing");
        try {
          const response = await billingService.completeCheckout(sessionIdFromUrl, true);
          if (response.data.ok) {
            const sessionResponse = await billingService.getCheckoutSession(sessionIdFromUrl);
            const sessionData = sessionResponse.data;
            updateUser({
              subscriptionPlan: sessionData.plan,
              subscriptionStatus: "active",
              ...(sessionData.institution ? { institution: sessionData.institution } : {}),
            });
            setStep("complete");
            setTimeout(() => navigate("/subscription"), 1600);
          } else {
            setStep("failed");
          }
        } catch {
          setStep("failed");
        }
      };
      completeCheckout();
    }
  }, [isReturnFromStripe, sessionIdFromUrl, navigate, updateUser]);

  const { data: publicPlans } = useQuery<Plan[]>({
    queryKey: ["/v1/plans/public"],
    queryFn: async () => {
      try {
        return (await plansService.getPublic()).data;
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const matchedPlan = publicPlans && session?.plan
    ? publicPlans.find((p) => {
        if (p.id === session.plan) return true;
        const normalize = (s: string) => s.toLowerCase().replace(/[_-]/g, " ");
        return normalize(p.title) === normalize(session.plan);
      })
    : null;

  const planLabel = matchedPlan?.title ?? session?.plan ?? "Subscription";
  const dollars = session ? (session.amountCents / 100).toFixed(2) : "0.00";

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card rounded-2xl w-full max-w-md overflow-hidden"
        data-testid="page-checkout"
      >
        {displayStep === "loading" && (
          <div className="p-12 flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest">Loading checkout</p>
          </div>
        )}

        {displayStep === "error" && (
          <div className="p-8 space-y-4 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
            <p className="font-display font-bold text-white uppercase tracking-wide" data-testid="text-checkout-error">{checkoutError}</p>
            <button
              onClick={() => navigate("/subscription")}
              className="px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wide border border-white/20 text-white hover:bg-white/10"
              data-testid="button-back-to-plans"
            >
              Back to Plans
            </button>
          </div>
        )}

        {displayStep === "form" && session && (
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-primary" />
                <h3 className="font-display font-bold text-xl text-white uppercase tracking-wider" data-testid="text-checkout-title">Checkout</h3>
              </div>
              <button onClick={() => navigate("/subscription")} className="text-muted-foreground hover:text-white" data-testid="button-close-checkout">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center" data-testid="card-checkout-summary">
              <div>
                <p className="font-display font-bold text-white" data-testid="text-checkout-plan">{planLabel}</p>
                <p className="text-xs text-muted-foreground font-mono mt-1">Subscription plan · Test mode</p>
                {session.externalSessionId && (
                  <p className="text-[10px] text-muted-foreground/70 font-mono mt-1" data-testid="text-checkout-session-id">{session.externalSessionId}</p>
                )}
              </div>
              <p className="text-2xl font-display font-black text-white" data-testid="text-checkout-amount">
                ${dollars}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-mono text-muted-foreground tracking-widest block mb-2">Card Number</label>
                <input
                  data-testid="input-card-number"
                  type="text"
                  value={cardNum}
                  onChange={(e) => setCardNum(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-primary/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-mono text-muted-foreground tracking-widest block mb-2">Expiry</label>
                  <input
                    data-testid="input-card-expiry"
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="12/28"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono text-muted-foreground tracking-widest block mb-2">CVC</label>
                  <input
                    data-testid="input-card-cvc"
                    type="text"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    placeholder="123"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  if (session.redirectUrl) {
                    window.location.href = session.redirectUrl;
                  } else {
                    submit(true);
                  }
                }}
                className="w-full py-4 rounded-xl font-mono text-sm uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                data-testid="button-pay"
              >
                <Lock className="h-4 w-4" />
                Pay ${dollars}
              </button>
              <button
                onClick={() => submit(false)}
                className="w-full py-2 rounded-xl font-mono text-[11px] uppercase tracking-widest border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                data-testid="button-simulate-failure"
              >
                Simulate Payment Failure
              </button>
            </div>

            <p className="text-center text-[10px] text-muted-foreground font-mono">
              STUB CHECKOUT · No real charges · Stripe integration pending
            </p>
          </div>
        )}

        {displayStep === "processing" && (
          <div className="p-12 flex flex-col items-center justify-center space-y-4" data-testid="state-processing">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-2 border-primary/20 rounded-full" />
              <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="font-display font-bold text-white text-lg uppercase tracking-widest">Processing Payment</p>
            <p className="text-xs font-mono text-muted-foreground">Contacting payment processor...</p>
          </div>
        )}

        {displayStep === "complete" && (
          <div className="p-12 flex flex-col items-center justify-center space-y-4" data-testid="state-complete">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-16 h-16 rounded-full bg-secondary/20 border-2 border-secondary flex items-center justify-center"
            >
              <CheckCircle2 className="h-8 w-8 text-secondary" />
            </motion.div>
            <p className="font-display font-bold text-white text-lg uppercase tracking-widest">Payment Successful</p>
            <p className="text-xs font-mono text-muted-foreground">Activating your plan...</p>
          </div>
        )}

        {displayStep === "failed" && (
          <div className="p-12 flex flex-col items-center justify-center space-y-4" data-testid="state-failed">
            <div className="w-16 h-16 rounded-full bg-destructive/20 border-2 border-destructive flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <p className="font-display font-bold text-white text-lg uppercase tracking-widest">Payment Failed</p>
            <p className="text-xs font-mono text-muted-foreground">Your card was declined (simulated).</p>
            <button
              onClick={() => navigate("/subscription")}
              className="mt-2 px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wide border border-white/20 text-white hover:bg-white/10"
              data-testid="button-back-after-failure"
            >
              Back to Plans
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}