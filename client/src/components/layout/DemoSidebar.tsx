import { Link } from "react-router-dom";
import atandaLogo from "@assets/WEB_LEARNING_SYSTEMS_(1920_x_1280_px)_(2)_1779729580194.png";
import {
  BarChart3,
  Upload,
  Activity,
  Map,
  CreditCard,
  User,
  Gamepad2,
  HelpCircle,
  FileText,
  BookOpen,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoSidebarProps {
  activeStepId: string;
}

interface NavItem {
  name: string;
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Analyze",
    items: [
      { name: "Intelligence Hub", id: "jst", icon: BarChart3, hint: "Your scores & insights" },
      { name: "Upload CV", id: "upload", icon: Upload, hint: "Run a new assessment" },
      { name: "ARK Resume", id: "plan-walkthroughs", icon: FileText, hint: "ATS-optimized verified resume" },
      { name: "Book Companion", id: "book", icon: BookOpen, hint: "Context Craft reading journey" },
    ],
  },
  {
    label: "Explore",
    items: [
      { name: "Skill Games", id: "skill-games", icon: Gamepad2, hint: "CCGE Arena — earn points" },
      { name: "Career Mobility", id: "mobility", icon: Map, hint: "Pivot opportunities" },
      { name: "Marketplace", id: "marketplace", icon: ShoppingBag, hint: "SPHINX listings" },
    ],
  },
];

const SECONDARY_LINKS = [
  { name: "Profile", icon: User, hint: "Account" },
  { name: "Subscription", icon: CreditCard, hint: "Plans & billing" },
];

export function DemoSidebar({ activeStepId }: DemoSidebarProps) {
  return (
    <div className="flex h-full w-full flex-col">
      <div
        className="flex w-full items-center gap-3 border-b border-primary/15 px-4 py-4"
      >
        <Activity className="h-7 w-7 shrink-0 text-primary animate-pulse" />
        <div className="min-w-0">
          <p className="text-lg font-sans font-bold text-primary tracking-tight leading-none">ARK</p>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Career intelligence</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 nav-scrollbar" aria-label="Primary">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="px-2 mb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/70">
              {group.label}
            </p>
            <ul className="space-y-1.5">
              {group.items.map((item) => {
                const isActive = item.id === activeStepId;
                return (
                  <li key={item.name}>
                    <div
                      title={`${item.hint} (Disabled in Demo)`}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2.5 rounded-md font-mono text-sm uppercase tracking-wide border cursor-not-allowed select-none transition-all duration-200",
                        isActive
                          ? "bg-primary/10 text-primary border-primary/30 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                          : "text-muted-foreground/50 border-transparent"
                      )}
                    >
                      <item.icon className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-primary" : "opacity-40"
                      )} />
                      <span className="truncate">{item.name}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div className="mb-5 border-t border-white/5 pt-4">
          <p className="px-2 mb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/70">
            Account
          </p>
          <ul className="space-y-1.5">
            {SECONDARY_LINKS.map((item) => (
              <li key={item.name}>
                <div
                  title={`${item.hint} (Disabled in Demo)`}
                  className="flex w-full items-center gap-3 px-3 py-2 rounded-md font-mono text-xs uppercase tracking-wide border border-transparent text-muted-foreground/50 cursor-not-allowed select-none"
                >
                  <item.icon className="h-4 w-4 shrink-0 opacity-40" />
                  <span className="truncate">{item.name}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Demo helper badge */}
      <div className="p-4 border-t border-primary/15 bg-primary/5">
        <div className="flex items-center gap-2 text-xs font-mono text-primary uppercase tracking-widest mb-1.5">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>Demo Tour Mode</span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          You are currently previewing the platform interface. Interactive elements are mocked with static data.
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-primary/15 bg-background/80 px-3 py-2.5 backdrop-blur-sm">
        <div className="flex min-w-0 items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          <span className="h-2 w-2 shrink-0 rounded-full bg-secondary animate-pulse" aria-hidden="true" />
          <span className="truncate">Demo Sandbox</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-1.5" title="Powered by Atanda">
            <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/60">By</span>
            <img
              src={atandaLogo}
              alt="Atanda"
              className="h-6 w-auto object-contain opacity-80"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
