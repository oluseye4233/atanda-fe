import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string | boolean | null | undefined;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = typeof status === "boolean" ? (status ? "active" : "inactive") : String(status ?? "—").toLowerCase();

  const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",
    success: "default",
    true: "default",
    verified: "default",
    inactive: "secondary",
    pending: "secondary",
    free: "secondary",
    staff: "secondary",
    failed: "destructive",
    destructive: "destructive",
    cancelled: "destructive",
    false: "destructive",
  };

  const display = status === true ? "Active" : status === false ? "Inactive" : status ? String(status) : "—";

  return (
    <Badge variant={variantMap[normalized] ?? "outline"} className={cn("text-[10px] uppercase tracking-wider", className)}>
      {display}
    </Badge>
  );
}
