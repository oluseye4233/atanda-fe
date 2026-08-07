import { useState, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  Activity,
  LayoutDashboard,
  Users,
  CreditCard,
  Repeat,
  Sparkles,
  Gift,
  Flag,
  Database,
  LogOut,
  Menu,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Command Center",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard, hint: "Overview & stats" },
      { name: "Users", href: "/users", icon: Users, hint: "Manage platform users" },
      { name: "Plans", href: "/plans", icon: CreditCard, hint: "Pricing plans & entitlements" },
      { name: "Payments & Subscriptions", href: "/payments", icon: Repeat, hint: "Billing & subscriptions" },
      { name: "AI Tools", href: "/ai", icon: Sparkles, hint: "Budget, models & scenario gen" },
      { name: "F1000 Monitor", href: "/f1000", icon: Gift, hint: "Founding-member counters" },
      { name: "Feature Flags", href: "/feature-flags", icon: Flag, hint: "Live feature states" },
    ],
  },
  {
    label: "System",
    items: [
      { name: "CCGE Importer", href: "/ccge-import", icon: Database, hint: "Bulk-import compendium cards" },
    ],
  },
];

function isActiveHref(location: string, href: string): boolean {
  if (href === "/") return location === "/";
  return location === href || location.startsWith(href + "/");
}

function SidebarBody({
  location,
  onNavigate,
  onLogout,
}: {
  location: string;
  onNavigate?: () => void;
  onLogout?: () => void;
}) {
  const { user } = useAuth();

  return (
    <div className="flex h-full w-full flex-col">
      <Link
        to="/"
        onClick={onNavigate}
        className="flex w-full items-center gap-3 border-b border-primary/15 px-4 py-4 hover:bg-primary/5 transition-colors"
      >
        <Shield className="h-7 w-7 shrink-0 text-amber-400" />
        <div className="min-w-0">
          <p className="text-lg font-sans font-bold text-white tracking-tight leading-none">
            COMMAND CENTER
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-amber-400/70 font-mono">
            Admin operations
          </p>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="px-2 mb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/70">
              {group.label}
            </p>
            <ul className="space-y-1.5">
              {group.items.map((item) => {
                const isActive = isActiveHref(location, item.href);
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={onNavigate}
                      title={item.hint}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group font-mono text-xs uppercase tracking-wide border",
                        isActive
                          ? "bg-amber-400/10 text-amber-300 border-amber-400/30"
                          : "text-muted-foreground hover:bg-white/5 hover:text-amber-300 border-transparent"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isActive ? "text-amber-300" : "opacity-70 group-hover:opacity-100"
                        )}
                      />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-primary/15 bg-background/80 px-3 py-3">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="min-w-0">
            <p className="text-xs font-sans font-medium text-white truncate">{user?.name ?? "—"}</p>
            <p className="text-[10px] font-mono text-muted-foreground truncate">{user?.email ?? "—"}</p>
          </div>
          <span className="shrink-0 inline-flex items-center rounded border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-mono uppercase text-amber-300">
            {user?.role ?? "—"}
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onLogout}
          className="w-full gap-2 font-mono text-xs uppercase tracking-wide"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </Button>
      </div>
    </div>
  );
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/login");
  }, [logout, navigate]);

  const pathname = location.pathname;

  return (
    <div className="h-screen flex flex-col sm:flex-row bg-background overflow-hidden">
      {/* Mobile top bar */}
      <header className="sm:hidden sticky top-0 z-30 flex items-center justify-between pb-3 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[calc(0.75rem+env(safe-area-inset-top))] border-b border-primary/20 bg-background/90 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Activity className="h-6 w-6 text-amber-400" />
          <span className="font-sans font-bold text-white tracking-tight text-sm">COMMAND CENTER</span>
        </Link>
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <Button type="button" variant="outline" size="icon" aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px] glass border-primary/20">
            <SidebarBody
              location={pathname}
              onNavigate={() => setMobileNavOpen(false)}
              onLogout={handleLogout}
            />
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden sm:flex sm:w-60 glass border-r border-primary/20 shrink-0 z-10 sticky top-0 h-screen">
        <SidebarBody location={pathname} onLogout={handleLogout} />
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col relative overflow-y-auto overflow-x-hidden min-h-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-400/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-destructive/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="relative z-10 p-4 sm:p-6 md:p-8 flex-1">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>

        <footer className="relative z-10 border-t border-primary/10 px-4 sm:px-6 md:px-8 py-4 mt-auto shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono uppercase tracking-widest text-muted-foreground/70">
            <span>© 2026 ARK Command Center</span>
            <span className="text-amber-400/70">Authorized personnel only</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
