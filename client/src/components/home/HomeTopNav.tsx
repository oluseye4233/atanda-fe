import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function HomeTopNav() {
  const { user, isLoading } = useAuth();

  return (
    <nav
      className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-6 sm:px-10 h-14 border-b border-white/7 bg-[#0d1117]/80 backdrop-blur-xl"
      data-testid="home-topnav"
    >
      <div className="flex items-center gap-3">
        <Link to="/" className="font-display font-bold text-primary text-base tracking-widest hover:text-primary/90 transition-colors">
          ARK
        </Link>
        <span className="hidden sm:block h-3.5 w-px bg-white/15" />
        <span className="hidden sm:block text-xs text-muted-foreground/60 font-mono">
          Career Intelligence
        </span>
      </div>

      <div className="flex items-center gap-1">
        <a
          href="/living-resume-oluseye-shay-amusa/"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="link-about-me"
          className="h-8 px-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-150 rounded-md"
        >
          About Me
        </a>
        {!isLoading && !user && (
          <>
            <Link
              to="/login"
              data-testid="button-landing-login"
              className="h-8 px-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-150 rounded-md"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              data-testid="button-landing-signup"
              className="h-8 px-4 inline-flex items-center rounded-md border border-white/15 text-sm text-foreground hover:border-white/30 hover:bg-white/6 hover:-translate-y-px transition-all duration-150"
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}
            >
              Sign up
            </Link>
          </>
        )}
        {!isLoading && user && (
          <Link
            to="/dashboard"
            data-testid="button-go-to-dashboard"
            className="h-8 px-4 inline-flex items-center rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 hover:-translate-y-px hover:shadow-[0_4px_16px_hsl(188_86%_53%/0.35)] transition-all duration-150"
            style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)" }}
          >
            Dashboard
          </Link>
        )}
      </div>
    </nav>
  );
}
