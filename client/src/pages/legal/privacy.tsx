import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, Trash2, Download } from "lucide-react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-white/6 pt-8 pb-2">
      <h2 className="font-sans font-semibold text-white text-lg mb-4 tracking-tight">
        {title}
      </h2>
      <div className="text-muted-foreground text-sm leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  const rights = [
    { icon: Eye, label: "Access", desc: "Request a full JSON export of your data via the Profile page." },
    { icon: Trash2, label: "Deletion", desc: "Request permanent account deletion — cascades across all records." },
    { icon: Download, label: "Portability", desc: "Your export is structured JSON suitable for migration." },
    { icon: Lock, label: "Correction", desc: "Edit your profile fields directly at any time." },
  ];

  return (
    <div className="min-h-screen bg-[#0d1117]" data-testid="page-privacy">
      {/* Top ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, hsl(188 86% 53% / 0.07), transparent 65%)",
        }}
      />

      {/* Sticky nav bar */}
      <header className="sticky top-0 z-10 border-b border-white/6 bg-[#0d1117]/90 backdrop-blur-xl px-6 sm:px-10 h-14 flex items-center justify-between">
        <Link
          to="/"
          data-testid="link-home"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-sm font-mono"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to ARK
        </Link>
        <span className="font-display font-bold text-primary text-sm tracking-widest">ARK</span>
      </header>

      <div className="relative z-10 max-w-3xl mx-auto px-6 sm:px-10 py-14">
        {/* Hero block */}
        <div className="flex items-start gap-5 mb-12">
          <div className="shrink-0 h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">ARK Platform</p>
            <h1 className="font-sans font-bold text-3xl sm:text-4xl text-white tracking-tight mb-2">Privacy Policy</h1>
            <p className="text-xs font-mono text-muted-foreground/50 uppercase tracking-widest">
              Last updated: May 3, 2026
            </p>
          </div>
        </div>

        {/* Lead paragraph */}
        <p className="text-muted-foreground text-base leading-relaxed mb-10 border-l-2 border-primary/40 pl-5">
          ARK is a career intelligence tool. We collect only what we need to run
          the platform, never sell your data, and give you full control over
          your information.
        </p>

        {/* Rights cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
          {rights.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="rounded-xl border border-white/7 bg-white/3 p-4 flex flex-col gap-2"
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs font-mono font-semibold text-white uppercase tracking-wider">{label}</span>
              <span className="text-[11px] text-muted-foreground/70 leading-relaxed">{desc}</span>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-2">
          <Section title="1. What We Collect">
            <p>
              When you create an ARK account we store your email, display name,
              role, department, seniority, location, and a hashed password.
              When you upload a resume we extract structured fields (skills,
              titles, dates, employers) and store them alongside your account.
            </p>
            <p>
              When you play CCGE sessions, complete assessments, or interact
              with SPHINX listings we record those events to power your ARK
              Score and Flywheel feed.
            </p>
          </Section>

          <Section title="2. How We Use It">
            <ul className="list-none space-y-2">
              {[
                "Generate your KCSE, CCMI, JST, and ARK Score signals.",
                "Power your personalized dashboard, pathways, and report.",
                "Process subscription billing and surface relevant SPHINX content.",
                "Detect abuse and enforce per-tier usage budgets (e.g., AI token limits).",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="3. AI Processing">
            <p>
              Resume narrative generation and certain CCGE scoring paths invoke
              Anthropic Claude. Inputs are sent to Anthropic under their
              data-processing terms; we do not train models on your data and we
              do not retain prompts beyond a 24-hour cache used to deduplicate
              identical requests.
            </p>
          </Section>

          <Section title="4. Sharing">
            <p>
              We do not sell your data. We share data only with sub-processors
              required to operate the service: our database host (Replit
              Postgres), our payment processor (Stripe — once enabled), and
              Anthropic for AI features.
            </p>
            <p>
              Public profile data on{" "}
              <code className="font-mono text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                /u/:username
              </code>{" "}
              is only shown if you opt into a public GUIN+ identity.
            </p>
          </Section>

          <Section title="5. Your Rights (GDPR / CCPA)">
            <p>
              You can request access, correction, deletion, or portability of
              your data at any time from the Profile page. Deletion is
              irreversible and cascades across assessments, game sessions,
              billing history, ARK events, and AI usage logs.
            </p>
          </Section>

          <Section title="6. Retention">
            <p>
              We retain account data while your account is active and for 30
              days after deletion to satisfy billing reconciliation. Anonymized
              aggregate analytics may be retained indefinitely.
            </p>
          </Section>

          <Section title="7. Security">
            <p>
              Sessions are HttpOnly + SameSite=Lax cookies signed with a
              server-side secret. Passwords are hashed with bcrypt. Mutating
              endpoints are rate-limited and protected by helmet security
              headers. Production traffic terminates over TLS 1.2+.
            </p>
          </Section>

          <Section title="8. Contact">
            <p>
              Questions or requests:{" "}
              <a
                href="mailto:privacy@arkplatform.example"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                privacy@arkplatform.example
              </a>
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
