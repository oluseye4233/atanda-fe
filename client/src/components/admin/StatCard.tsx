import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value?: React.ReactNode;
  icon: LucideIcon;
  subtext?: string;
  isLoading?: boolean;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, subtext, isLoading, className }: StatCardProps) {
  return (
    <Card className={cn("glass-card border-primary/20", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="h-4 w-4 text-primary/70" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold text-white">{value ?? "—"}</div>
        )}
        {subtext && <p className="text-xs text-muted-foreground mt-1 font-mono">{subtext}</p>}
      </CardContent>
    </Card>
  );
}
