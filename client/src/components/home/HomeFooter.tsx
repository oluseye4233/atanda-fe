import { Link } from "react-router-dom";
import { FEATURES } from "@shared/featureFlags";

export function HomeFooter() {
  return (
    <footer
      className="bg-[#0a0d12] border-t border-white/6 px-6 sm:px-10 py-8"
      data-testid="home-footer"
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground/40">
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-primary/80 text-sm tracking-widest">
            ARK
          </span>
          <span className="text-muted-foreground/20">·</span>
          <span>Powered by Junglenomics</span>
        </div>
        <div className="flex items-center gap-5">
          <Link
            to="/privacy"
            className="hover:text-muted-foreground transition-colors duration-150"
          >
            Privacy
          </Link>
          <Link
            to="/terms"
            className="hover:text-muted-foreground transition-colors duration-150"
          >
            Terms
          </Link>
          {FEATURES.investorDemo && (
            <Link
              to="/demo"
              className="hover:text-muted-foreground transition-colors duration-150"
            >
              Demo
            </Link>
          )}
        </div>
        <span>© 2026 ARK Platform</span>
      </div>
    </footer>
  );
}
