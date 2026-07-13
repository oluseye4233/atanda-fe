import { Link } from "react-router-dom";
import { Upload, LogIn } from "lucide-react";

export function CtaSection() {
  return (
    <section
      className="bg-[#0d1117] px-6 sm:px-10 py-24"
      data-testid="section-cta"
    >
      <div className="max-w-lg mx-auto text-center flex flex-col items-center gap-5">
        <h2 className="font-sans font-bold text-2xl sm:text-3xl text-white tracking-tight">
          Ready to know where you stand?
        </h2>
        <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
          It's free to start. Upload your CV and get your full career
          intelligence report in under a minute.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <Link
            to="/signup"
            data-testid="button-cta-upload"
            className="group inline-flex items-center gap-2 h-11 px-7 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200"
            style={{
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.15), 0 0 20px hsl(188 86% 53% / 0.2)",
            }}
          >
            <Upload className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
            Get Started Free
          </Link>
          <Link
            to="/login"
            data-testid="button-cta-login"
            className="group inline-flex items-center gap-2 h-11 px-7 rounded-md border border-white/15 text-muted-foreground text-sm hover:border-white/30 hover:text-foreground hover:bg-white/4 transition-all duration-200"
          >
            <LogIn className="h-4 w-4" />
            Already have an account
          </Link>
        </div>
      </div>
    </section>
  );
}
