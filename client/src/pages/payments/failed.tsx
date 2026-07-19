import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, RefreshCw, Sparkles, CreditCard, Banknote, Shield } from "lucide-react";

export default function PaymentFailedPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      navigate("/");
    }
  }, [sessionId, navigate]);

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-6 py-24" data-testid="page-payment-failed">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-destructive/20 border-2 border-destructive flex items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>

        <h1 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4 tracking-tight">
          Payment Failed
        </h1>

        <p className="text-muted-foreground text-base mb-8 leading-relaxed">
          We couldn't process your payment. This might be due to insufficient funds,
          an expired card, or a temporary issue with your bank.
        </p>

        <div className="space-y-3">
          <Link
            to="/subscription"
            className="group inline-flex items-center justify-center gap-2 w-full h-12 px-6 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200"
            style={{
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 0 20px hsl(188 86% 53% / 0.25)",
            }}
            data-testid="button-try-again"
          >
            <RefreshCw className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
            Try Again
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 w-full h-12 px-6 rounded-lg border border-white/15 text-muted-foreground text-sm hover:border-white/30 hover:text-foreground hover:bg-white/4 transition-all duration-200"
            data-testid="button-back-home"
          >
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}