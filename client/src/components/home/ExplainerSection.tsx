import { Upload, BarChart3, Compass } from "lucide-react";

const steps = [
  {
    n: "01",
    icon: Upload,
    title: "Upload your CV",
    body: "Drop a PDF or DOCX, or paste your text. It takes about ten seconds — no forms to fill in.",
  },
  {
    n: "02",
    icon: BarChart3,
    title: "Get your JST score",
    body: "We read your experience as career capital and benchmark it against live labor-market data.",
  },
  {
    n: "03",
    icon: Compass,
    title: "See your next move",
    body: "Get pivot paths and upskilling moves ranked by return on effort, so you know where to aim.",
  },
];

export function ExplainerSection() {
  return (
    <section
      id="how-it-works"
      className="relative bg-[#0d1117] px-6 sm:px-10 py-24"
      data-testid="section-how-it-works"
    >
      {/* Subtle section divider glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, hsl(188 86% 53% / 0.3), transparent)",
        }}
      />

      <div className="max-w-4xl mx-auto">
        {/* Explainer copy */}
        <div className="mb-16">
          <h2 className="font-sans font-bold text-2xl sm:text-3xl text-white mb-6 tracking-tight max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/3 px-3 py-1 text-[11px] font-mono tracking-widest text-muted-foreground uppercase mb-5">
              How it works
            </span> <br />
            From a CV to a career strategy in under a minute
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed text-sm md:text-base max-w-2xl mx-auto">
            <p>
              ARK reads your CV the way a sharp career strategist would — not as
              a list of past jobs, but as a portfolio of skills, each with its
              own market value and shelf life. In seconds it benchmarks you
              against live labor-market data to show what you're worth right
              now, and flags the parts of your work most exposed to automation.
            </p>
            <p>
              From there it does the part most tools skip: it maps where you can
              go next. Every pivot and upskilling move is scored by return on
              effort, so you're never guessing which skill to learn or which
              role to chase — you can see the smartest next move before you
              commit to it.
            </p>
          </div>
        </div>

        {/* Horizontal timeline */}
        <div className="relative">
          {/* Connector line, desktop only */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-8 left-[16.6%] right-[16.6%] h-px bg-linear-to-r from-white/10 via-primary/40 to-white/10 z-0"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-8 relative z-10">
            {steps.map(({ n, icon: Icon, title, body }) => (
              <div
                key={n}
                className="group flex flex-col items-center text-center"
                data-testid={`landing-step-${n}`}
              >
                {/* Node */}
                <div className="relative mb-6">
                  <div className="h-16 w-16 rounded-full bg-white/3 border border-white/15 grid place-items-center backdrop-blur-sm transition-all duration-300 group-hover:border-primary group-hover:shadow-[0_6px_24px_hsl(188_86%_53%/0.3)]">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-primary text-primary-foreground text-[10px] font-mono font-semibold grid place-items-center">
                    {n}
                  </span>
                </div>

                <h3 className="font-sans font-semibold text-white text-base mb-2">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px]">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
