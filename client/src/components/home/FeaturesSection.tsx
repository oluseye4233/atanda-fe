import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { Zap, ShieldAlert, Target, Compass } from "lucide-react";

function FeatureCard({
  className = "",
  children,
  testid,
}: {
  className?: string;
  children: ReactNode;
  testid: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative rounded-2xl border border-white/7 bg-white/3 backdrop-blur-xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-white/14 hover:bg-white/5 ${className}`}
      style={{
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.06), 0 1px 3px rgba(0,0,0,0.4)",
      }}
      data-testid={testid}
    >
      {children}
    </motion.div>
  );
}

export function FeaturesSection() {
  return (
    <section
      className="bg-[#0d1117] px-6 sm:px-10 py-24"
      data-testid="section-features"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/3 px-3 py-1 text-[11px] font-mono tracking-widest text-muted-foreground uppercase mb-4">
            The Intelligence Layers
          </span>
          <h2 className="font-sans font-bold text-3xl sm:text-4xl lg:text-5xl text-white mb-4 tracking-tight">
            What ARK gives you
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Three intelligence layers most career tools miss entirely.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-fr">
          {/* JST Valuation — wide tile */}
          <FeatureCard
            className="md:col-span-2 hover:shadow-[0_16px_40px_rgba(0,0,0,0.5),0_0_0_1px_hsl(188_86%_53%/0.25)]"
            testid="feature-jst"
          >
            <div className="flex items-start justify-between gap-6 h-full">
              <div className="flex flex-col">
                <div className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 text-primary mb-4 transition-transform duration-300 group-hover:scale-110">
                  <Zap className="h-4 w-4" />
                </div>
                <h3 className="font-sans font-semibold text-white text-lg mb-1.5">
                  JST Index Valuation
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                  Computes a tri-dimensional career capital score calibrated
                  against live labor market data.
                </p>
              </div>
              {/* mini gauge */}
              <div className="hidden sm:grid shrink-0 place-items-center self-center">
                <div
                  className="relative h-24 w-24 rounded-full grid place-items-center"
                  style={{
                    background:
                      "conic-gradient(hsl(188 86% 53%) 0% 78%, rgba(255,255,255,0.06) 78% 100%)",
                  }}
                >
                  <div className="h-[76px] w-[76px] rounded-full bg-[#0d1117] grid place-items-center">
                    <span className="font-mono font-bold text-xl text-white leading-none">
                      78
                    </span>
                    <span className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase mt-0.5">
                      Index
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </FeatureCard>

          {/* AI Vulnerability */}
          <FeatureCard
            className="hover:shadow-[0_16px_40px_rgba(0,0,0,0.5),0_0_0_1px_hsl(346_87%_43%/0.25)]"
            testid="feature-vulnerability"
          >
            <div className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-destructive/10 text-destructive mb-4 transition-transform duration-300 group-hover:scale-110">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <h3 className="font-sans font-semibold text-white text-base mb-1.5">
              AI Vulnerability
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              5-level vulnerability classification with task-level automation
              risk scoring.
            </p>
            {/* 5-level risk meter */}
            <div className="mt-auto flex items-center gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-1.5 flex-1 rounded-full"
                  style={{
                    background:
                      i < 2 ? "hsl(346 87% 43%)" : "rgba(255,255,255,0.08)",
                  }}
                />
              ))}
              <span className="ml-1 text-[10px] font-mono text-destructive">
                L2
              </span>
            </div>
          </FeatureCard>

          {/* 12-Vector Mobility */}
          <FeatureCard
            className="hover:shadow-[0_16px_40px_rgba(0,0,0,0.5),0_0_0_1px_hsl(152_69%_31%/0.3)]"
            testid="feature-mobility"
          >
            <div className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-secondary/10 text-secondary mb-4 transition-transform duration-300 group-hover:scale-110">
              <Target className="h-4 w-4" />
            </div>
            <h3 className="font-sans font-semibold text-white text-base mb-1.5">
              12-Vector Mobility
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Maps career mobility across 12 orthogonal dimensions to generate
              optimal pivot pathways.
            </p>
            <div className="mt-auto grid grid-cols-6 gap-1.5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-full"
                  style={{
                    background: `hsl(152 69% 31% / ${0.25 + (i % 6) * 0.12})`,
                  }}
                />
              ))}
            </div>
          </FeatureCard>

          {/* ROI pivot pathways — wide tile */}
          <FeatureCard
            className="md:col-span-2 hover:shadow-[0_16px_40px_rgba(0,0,0,0.5),0_0_0_1px_hsl(188_86%_53%/0.2)]"
            testid="feature-pathways"
          >
            <div className="flex items-center gap-5 h-full">
              <div className="inline-flex items-center justify-center h-9 w-9 shrink-0 rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                <Compass className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <h3 className="font-sans font-semibold text-white text-base mb-1">
                  ROI-ranked pivot pathways
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every recommendation ordered by return on effort — so you
                  spend energy where it moves the needle most.
                </p>
              </div>
              <div className="hidden sm:flex items-end gap-1.5 h-12 shrink-0">
                {[40, 60, 100].map((h, i) => (
                  <div
                    key={i}
                    className="w-3 rounded-sm"
                    style={{
                      height: `${h}%`,
                      background: `hsl(188 86% 53% / ${0.35 + i * 0.25})`,
                    }}
                  />
                ))}
              </div>
            </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}