import type { LucideIcon } from "lucide-react";
import { ShieldCheck, Clock, ShieldX, HelpCircle } from "lucide-react";
import { ATANDA } from "@/lib/arkReportTheme";

const STATUS_META: Record<string, { label: string; color: string; Icon: LucideIcon }> = {
  CONFIRMED: { label: "Confirmed", color: ATANDA.green, Icon: ShieldCheck },
  PENDING: { label: "Pending", color: ATANDA.yellow, Icon: Clock },
  REJECTED: { label: "Rejected", color: ATANDA.red, Icon: ShieldX },
  UNVERIFIED: { label: "Unverified", color: ATANDA.sub, Icon: HelpCircle },
};

interface StatusBadgeProps {
  status: string;
  org?: string | null;
  logoUrl?: string | null;
}

export function StatusBadge({ status, org, logoUrl }: StatusBadgeProps) {
  const meta = STATUS_META[status] ?? STATUS_META.UNVERIFIED;
  const Icon = meta.Icon;
  return (
    <span
      data-testid={`badge-confirmation-${status.toLowerCase()}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 10,
        fontWeight: 700,
        color: meta.color,
        border: `1px solid ${meta.color}`,
        borderRadius: 999,
        padding: "1px 8px",
        whiteSpace: "nowrap",
      }}
    >
      <Icon style={{ width: 11, height: 11 }} />
      {meta.label}
      {org ? (
        <>
          {" · "}
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              style={{ width: 12, height: 12, borderRadius: 2, objectFit: "contain" }}
            />
          ) : null}
          {org}
        </>
      ) : null}
    </span>
  );
}
