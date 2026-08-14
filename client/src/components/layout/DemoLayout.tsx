import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Activity, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DemoSidebar } from "./DemoSidebar";
import { DemoStepIndicator } from "./DemoStepIndicator";

interface DemoLayoutProps {
  children: React.ReactNode;
  activeStepId: string;
}

export function DemoLayout({ children, activeStepId }: DemoLayoutProps) {
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col sm:flex-row bg-background overflow-hidden font-sans">
      {/* Mobile top bar (< sm): hamburger drawer */}
      <header className="sm:hidden sticky top-0 z-30 flex items-center justify-between pb-3 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[calc(0.75rem+env(safe-area-inset-top))] border-b border-primary/20 bg-background/90 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary animate-pulse" />
          <span className="font-sans font-bold text-primary tracking-tight text-sm">ARK DEMO</span>
        </div>
        <div className="flex items-center gap-2">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                data-testid="button-open-mobile-nav"
                aria-label="Open navigation"
                className="p-2 rounded-md border border-primary/30 text-primary"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px] glass border-primary/20">
              <DemoSidebar activeStepId={activeStepId} />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Desktop sidebar (>= sm) */}
      <aside className="hidden sm:flex sm:w-72 glass border-r border-primary/20 shrink-0 z-10 sticky top-0 h-screen">
        <DemoSidebar activeStepId={activeStepId} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-y-auto overflow-x-hidden min-h-0 h-full">
        {/* Subtle background decorative element glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-destructive/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="relative z-10 p-4 sm:p-6 md:p-10 flex-1">
          {/* Top Step Indicator Bar */}
          <DemoStepIndicator currentStepId={activeStepId} />

          {/* Page Content */}
          {children}
        </div>

        <footer className="relative z-10 border-t border-primary/10 px-4 sm:px-6 md:px-10 py-4 mt-auto shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono uppercase tracking-widest text-muted-foreground/70">
            <span>© 2026 ARK Platform • Guided Tour Mode</span>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
