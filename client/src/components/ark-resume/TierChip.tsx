import { ATANDA } from "@/lib/arkReportTheme";

const TIER_HEX: Record<string, string> = {
  Platinum: ATANDA.purple,
  Gold: ATANDA.yellow,
  Silver: ATANDA.teal,
  Bronze: ATANDA.orange,
};

interface TierChipProps {
  tier: string | null;
}

// Verification tier chip. Verified cards show their tier; matched-but-unverified
// cards render an explicit "Yet to verify" pill so the living layer is complete.
export function TierChip({ tier }: TierChipProps) {
  if (!tier) {
    return (
      <span
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: ATANDA.sub,
          background: ATANDA.panel,
          border: `1px dashed ${ATANDA.line}`,
          borderRadius: 4,
          padding: "1px 6px",
          whiteSpace: "nowrap",
        }}
      >
        Yet to verify
      </span>
    );
  }

  const color = TIER_HEX[tier] ?? ATANDA.sub;
  return (
    <span
      style={{
        fontSize: 9.5,
        fontWeight: 700,
        color: "#fff",
        background: color,
        borderRadius: 4,
        padding: "1px 6px",
      }}
    >
      {tier}
    </span>
  );
}
