import { Link } from "wouter";
import { ArrowLeft, FileText } from "lucide-react";

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

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0d1117]" data-testid="page-terms">
      {/* Top ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, hsl(152 69% 31% / 0.06), transparent 65%)",
        }}
      />

      {/* Sticky nav bar */}
      <header className="sticky top-0 z-10 border-b border-white/6 bg-[#0d1117]/90 backdrop-blur-xl px-6 sm:px-10 h-14 flex items-center justify-between">
        <Link
          href="/"
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
          <div className="shrink-0 h-14 w-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
            <FileText className="h-7 w-7 text-secondary" />
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">ARK Platform</p>
            <h1 className="font-sans font-bold text-3xl sm:text-4xl text-white tracking-tight mb-2">Terms of Service</h1>
            <p className="text-xs font-mono text-muted-foreground/50 uppercase tracking-widest">
              Last updated: May 3, 2026
            </p>
          </div>
        </div>

        {/* Lead paragraph */}
        <p className="text-muted-foreground text-base leading-relaxed mb-10 border-l-2 border-secondary/40 pl-5">
          By using ARK you agree to these Terms. They're written to be readable
          — no legalese traps. Key points: you own your data, outputs are
          decision-support not advice, and you can cancel any time.
        </p>

        {/* Sections */}
        <div className="space-y-2">
          <Section title="1. Acceptance">
            <p>
              By creating an account or using ARK Platform you agree to these
              Terms and the linked Privacy Policy. If you do not agree, do not
              use the service.
            </p>
          </Section>

          <Section title="2. Account & Eligibility">
            <p>
              You must be 16+ (or 13+ with verified institutional supervision
              under a SCHOOL plan). You are responsible for safeguarding your
              credentials and for all activity under your account.
            </p>
          </Section>

          <Section title="3. Subscriptions & Billing">
            <p>
              Paid plans (Individual Pro, School / Student, Enterprise) renew
              monthly on the period anniversary. You may cancel at any time from{" "}
              <Link
                href="/subscription"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                /subscription
              </Link>
              ; cancellation takes effect at the end of the current billing
              period and is not pro-rated. ENTERPRISE plans are provisioned via
              a custom contract.
            </p>
          </Section>

          <Section title="4. Acceptable Use">
            <ul className="list-none space-y-2">
              {[
                "No scraping, automated mass-submission, or circumvention of per-tier budgets.",
                "No uploading content you do not have rights to (resumes, SPC bodies).",
                "No publishing SPHINX listings containing placeholder text, malware, or fraudulent claims.",
                "No attempting to access another user's data, sessions, or billing.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive/60 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>
              Violations may result in immediate suspension and forfeiture of
              in-app credits.
            </p>
          </Section>

          <Section title="5. SPHINX Marketplace">
            <p>
              Super Prompt Cards (SPCs) you publish remain your IP; you grant
              ARK a non-exclusive license to display, distribute, and process
              them on-platform. Purchases are denominated in in-app credits.
              Creator payouts in fiat will become available when Stripe Connect
              is enabled (Phase D.3).
            </p>
          </Section>

          <Section title="6. ARK Outputs Are Informational">
            <p>
              KCSE, CCMI, JST, ARK Score, narrative summaries, and pathway
              recommendations are decision-support signals, not employment,
              financial, legal, or medical advice. You bear responsibility for
              actions taken based on these outputs.
            </p>
          </Section>

          <Section title="7. AI & Content Disclaimers">
            <p>
              AI-generated narratives may contain inaccuracies. We do not
              guarantee the correctness of Claude-generated text or scenario
              content. Per-tier monthly token budgets apply; exceeding them
              returns HTTP 429.
            </p>
          </Section>

          <Section title="8. Termination">
            <p>
              You may delete your account at any time from the Profile page;
              deletion is irreversible and cascades across all associated
              records. We may terminate or suspend accounts for violations of
              these Terms with notice except in cases of fraud or abuse.
            </p>
          </Section>

          <Section title="9. Liability">
            <p>
              The service is provided "as is" without warranty. To the maximum
              extent permitted by law, ARK's aggregate liability is limited to
              the fees you paid in the 12 months preceding the claim.
            </p>
          </Section>

          <Section title="10. Changes">
            <p>
              We may update these Terms; material changes are announced via
              in-app banner at least 14 days before taking effect. Continued
              use after the effective date constitutes acceptance.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              Questions:{" "}
              <a
                href="mailto:legal@arkplatform.example"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                legal@arkplatform.example
              </a>
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
