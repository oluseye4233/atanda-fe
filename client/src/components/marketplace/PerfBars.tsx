import { motion } from "framer-motion";
import { Zap, Gauge, Brain, ShieldCheck } from "lucide-react";
import { derivePerfBars } from "@/lib/sphinx";
import type { SpcListing } from "@/types/sphinx";

function PerfBar({
  label,
  value,
  icon: Icon,
  color,
  testId,
}: {
  label: string;
  value: number;
  icon: typeof Zap;
  color: string;
  testId: string;
}) {
  return (
    <div data-testid={testId}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-widest text-muted-foreground">
          <Icon className="h-3 w-3" style={{ color }} /> {label}
        </span>
        <span className="font-mono text-xs font-bold" style={{ color }}>
          {value}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function PerfBars({
  listing,
}: {
  listing: SpcListing & { bodyLength?: number };
}) {
  const bodyLength = listing.bodyLength ?? (listing as any).body?.length ?? 0;
  const bars = derivePerfBars({
    hiveScore: listing.hiveScore,
    kcseScore: listing.kcseScore,
    bodyLength,
  });
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      data-testid="grid-perf-bars"
    >
      <PerfBar
        label="Speed"
        value={bars.speed}
        icon={Zap}
        color="#FFC857"
        testId="bar-perf-speed"
      />
      <PerfBar
        label="Efficiency"
        value={bars.efficiency}
        icon={Gauge}
        color="#44AAFF"
        testId="bar-perf-efficiency"
      />
      <PerfBar
        label="Innovation"
        value={bars.innovation}
        icon={Brain}
        color="#AA44FF"
        testId="bar-perf-innovation"
      />
      <PerfBar
        label="Reliability"
        value={bars.reliability}
        icon={ShieldCheck}
        color="#44AA77"
        testId="bar-perf-reliability"
      />
    </div>
  );
}
