import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Upload, Sparkles, ExternalLink } from "lucide-react";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      navigate("/");
    }
  }, [sessionId, navigate]);

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-6 py-24" data-testid="page-payment-success">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-secondary/20 border-2 border-secondary flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-secondary" />
        </div>

        <h1 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4 tracking-tight">
          Payment Successful
        </h1>

        <p className="text-muted-foreground text-base mb-8 leading-relaxed">
          Your subscription is now active. You have full access to ARK's career
          intelligence engine — JST scoring, vulnerability analysis, and ROI-ranked
          pivot pathways.
        </p>

        <div className="space-y-3">
          <Link
            to="/dashboard"
            className="group inline-flex items-center justify-center gap-2 w-full h-12 px-6 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200"
            style={{
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 0 20px hsl(188 86% 53% / 0.25)",
            }}
            data-testid="button-go-to-dashboard"
          >
            <Upload className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
            Go to Dashboard
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>

          <Link
            to="/subscription"
            className="inline-flex items-center justify-center gap-2 w-full h-12 px-6 rounded-lg border border-white/15 text-muted-foreground text-sm hover:border-white/30 hover:text-foreground hover:bg-white/4 transition-all duration-200"
            data-testid="button-view-plan"
          >
            View My Plan
          </Link>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10">
          <p className="text-[11px] font-mono text-muted-foreground/60 uppercase tracking-widest mb-4">
            What's next?
          </p>
          <div className="grid grid-cols-3 gap-4 text-left">
            <Link
              to="/upload"
              className="bg-white/3 p-4 rounded-xl border border-white/5 hover:border-primary/30 hover:bg-white/5 transition-all"
            >
              <Sparkles className="h-5 w-5 text-primary mb-2" />
              <p className="font-mono text-xs text-white">Upload CV</p>
              <p className="text-[10px] text-muted-foreground mt-1">Get your JST score in 60s</p>
            </Link>
            <Link
              to="/pathways"
              className="bg-white/3 p-4 rounded-xl border border-white/5 hover:border-secondary/30 hover:bg-white/5 transition-all"
            >
              <Sparkles className="h-5 w-5 text-secondary mb-2" />
              <p className="font-mono text-xs text-white">See Pathways</p>
              <p className="text-[10px] text-muted-foreground mt-1">ROI-ranked career moves</p>
            </Link>
            <Link
              to="/dashboard"
              className="bg-white/3 p-4 rounded-xl border border-white/5 hover:border-destructive/30 hover:bg-white/5 transition-all"
            >
              <Sparkles className="h-5 w-5 text-destructive/80 mb-2" />
              <p className="font-mono text-xs text-white">Check Risk</p>
              <p className="text-[10px] text-muted-foreground mt-1">AI vulnerability readout</p>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}