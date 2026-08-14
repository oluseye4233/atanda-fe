import { cn } from "@/lib/utils";
import {
  Gauge,
  Gamepad2,
  Store,
  Compass,
  Building2,
  BookOpen,
  FileText,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export interface StepInfo {
  id: string;
  num: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  href: string;
  isSkipped?: boolean;
}

export const DEMO_STEPS: StepInfo[] = [
  {
    id: "jst",
    num: 1,
    icon: Gauge,
    title: "JST Index",
    subtitle: "Jobs · Skills · Talent — your single AI-readiness score",
    href: "/demo-tour",
  },
  {
    id: "skill-games",
    num: 2,
    icon: Gamepad2,
    title: "Skill Games",
    subtitle: "The CCGE Arena — learn prompt engineering by playing",
    href: "/demo-tour/skill-games",
  },
  {
    id: "marketplace",
    num: 3,
    icon: Store,
    title: "SPHINX Marketplace",
    subtitle: "Super Prompt Cards — bought and sold by experts",
    href: "/demo-tour/marketplace",
  },
  {
    id: "mobility",
    num: 4,
    icon: Compass,
    title: "Career Mobility",
    subtitle: "12-vector transferability, pivots, and upskilling",
    href: "/demo-tour/career-mobility",
  },
  {
    id: "workforce",
    num: 5,
    icon: Building2,
    title: "Workforce Intelligence",
    subtitle: "Enterprise analytics & org-wide AI vulnerability",
    href: "/demo-tour/workforce",
    isSkipped: true,
  },
  {
    id: "book",
    num: 6,
    icon: BookOpen,
    title: "Book Companion",
    subtitle: "Verify book learning chapters and earn ARK credits",
    href: "/demo-tour/book",
  },
  {
    id: "plan-walkthroughs",
    num: 7,
    icon: FileText,
    title: "Plan Walkthroughs",
    subtitle: "ATS-optimized verified skill resume & timeline",
    href: "/demo-tour/plan-walkthroughs",
  },
];

interface DemoStepIndicatorProps {
  currentStepId: string;
}

export function DemoStepIndicator({ currentStepId }: DemoStepIndicatorProps) {
  const currentStep = DEMO_STEPS.find((s) => s.id === currentStepId) || DEMO_STEPS[0];

  return (
    <div className="w-full space-y-4 mb-8" data-testid="demo-tour-header">
      {/* Guided Tour Banner */}
      <div className="bg-gradient-to-r from-primary/20 via-fuchsia-500/10 to-primary/20 border border-primary/25 rounded-lg px-4 py-3 flex items-center justify-between gap-4 flex-wrap shadow-[0_0_20px_rgba(var(--primary-color),0.05)]">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-primary font-bold">Guided Tour</span>
          <span className="text-muted-foreground/40 font-light">|</span>
          <span className="text-muted-foreground">Step {currentStep.num} of 7</span>
          <span className="text-muted-foreground/40 font-light">|</span>
          <span className="text-secondary/80 font-semibold">No Login Required</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest">
          <span className="text-muted-foreground/70">Classic Demo</span>
          <Link
            to="/signup"
            className="text-primary hover:text-primary/80 transition-all font-semibold flex items-center gap-1 hover:translate-x-0.5 duration-200"
          >
            Try with your resume <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Grid of Steps */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3" data-testid="step-rail">
        {DEMO_STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = step.id === currentStepId;
          const isSkipped = step.isSkipped;

          return (
            <Link
              key={step.id}
              to={step.href}
              className={cn(
                "rounded-xl border p-3 flex items-start gap-2.5 transition-all duration-300 relative group overflow-hidden text-left",
                isActive
                  ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(68,136,255,0.25)]"
                  : isSkipped
                  ? "border-white/5 bg-white/2 opacity-40 hover:opacity-50"
                  : "border-white/10 bg-white/3 hover:border-primary/40 hover:bg-white/5"
              )}
            >
              {/* Box number */}
              <div
                className={cn(
                  "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 font-display font-black text-xs transition-colors",
                  isActive
                    ? "bg-primary text-background"
                    : isSkipped
                    ? "bg-white/5 text-muted-foreground/60"
                    : "bg-white/10 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                )}
              >
                {step.num}
              </div>

              {/* Text metadata */}
              <div className="min-w-0 flex-1">
                <div
                  className={cn(
                    "text-[9px] font-mono uppercase tracking-widest flex items-center gap-1 leading-none mb-1",
                    isActive ? "text-primary font-bold" : "text-muted-foreground/70"
                  )}
                >
                  <Icon className="h-3 w-3 shrink-0" />
                  <span>
                    Step {step.num} {isSkipped && "(Skipped)"}
                  </span>
                </div>
                <div
                  className={cn(
                    "font-display text-xs font-bold leading-tight truncate transition-colors",
                    isActive ? "text-white" : "text-muted-foreground group-hover:text-white/90"
                  )}
                >
                  {step.title}
                </div>
              </div>

              {/* Glow underline for active */}
              {isActive && (
                <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
