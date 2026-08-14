import { Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DemoHelperCalloutProps {
  stepLabel: string;
  title: string;
  subtitle: string;
  description: string;
  takeaways: string[];
  ctaLabel?: string;
  onCtaClick?: () => void;
}

export function DemoHelperCallout({
  stepLabel,
  title,
  subtitle,
  description,
  takeaways,
  ctaLabel,
  onCtaClick,
}: DemoHelperCalloutProps) {
  return (
    <div className="glass-card rounded-xl border border-primary/20 p-6 shadow-[0_0_30px_rgba(68,136,255,0.05)] bg-[#0d1117]/80 backdrop-blur-sm mb-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary font-bold mb-1">
            {stepLabel}
          </div>
          <h1 className="font-display text-3xl text-white font-extrabold tracking-wide uppercase">
            {title}
          </h1>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mt-1">
            {subtitle}
          </p>
        </div>

        {ctaLabel && onCtaClick && (
          <Button
            onClick={onCtaClick}
            variant="outline"
            className="border-primary/40 text-primary hover:bg-primary/10 transition-all font-mono text-xs uppercase tracking-widest flex items-center gap-1.5"
            data-testid={`button-open-${title.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {ctaLabel} <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <p className="text-sm sm:text-base text-foreground/90 leading-relaxed mt-5 max-w-4xl font-sans">
        {description}
      </p>

      <ul className="grid sm:grid-cols-3 gap-3 mt-6">
        {takeaways.map((t) => (
          <li
            key={t}
            className="text-xs text-muted-foreground bg-background/50 border border-white/5 rounded-lg p-3 flex gap-2.5 shadow-inner"
          >
            <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
