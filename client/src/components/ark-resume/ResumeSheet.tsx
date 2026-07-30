import { forwardRef } from "react";
import { ATANDA, BRAND_BAR, Bar } from "@/lib/arkReportTheme";
import { StatusBadge } from "./StatusBadge";
import { TierChip } from "./TierChip";
import { Section } from "./Section";
import { standardsLabels } from "./helpers";
import { certMatches } from "@shared/claimMatch";
import atandaLogo from "@assets/WEB_LEARNING_SYSTEMS_(1920_x_1280_px)_(2)_1779729580194.png";
import type { ArkResume, ArkResumeConfirmation } from "@/services/ark-resume.service";

export interface ResumeSheetProps {
  data: ArkResume;
}

export const ResumeSheet = forwardRef<HTMLDivElement, ResumeSheetProps>(
  function ResumeSheet({ data }, ref) {
    const headshot = (data.user.headshotDataUrl as string | null) ?? null;

    // SKILL confirmations match on the stable CODEC card id, so they index by an
    // exact lowercased key. CERTIFICATION confirmations match tolerantly (the SAME
    // comparison the server uses) so a badge issued against a reasonable variant of
    // a certification label still renders instead of silently orphaning. Missing →
    // rendered as "Unverified".
    const allConfs = data.confirmations ?? [];
    const skillByKey = new Map<string, ArkResumeConfirmation>();
    const certConfs: ArkResumeConfirmation[] = [];
    for (const c of allConfs) {
      if (c.type === "SKILL") skillByKey.set(String(c.targetRef).toLowerCase(), c);
      else if (c.type === "CERTIFICATION") certConfs.push(c);
    }
    const skillConf = (cardId: string) => skillByKey.get(cardId.toLowerCase()) ?? null;
    const certConf = (label: string) =>
      certConfs.find((c) => certMatches(label, String(c.targetRef))) ?? null;

    return (
      <div
        ref={ref}
        data-testid="ark-resume-sheet"
        style={{
          background: "#fff",
          color: ATANDA.ink,
          fontFamily: "Arial, Helvetica, sans-serif",
          padding: 0,
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 8px 40px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ height: 6, background: BRAND_BAR }} />
        <div style={{ padding: "28px 36px 36px" }}>
          {/* Header: identity (left) + JST block (TOP-RIGHT, prominent) */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              {headshot && (
                <img
                  src={headshot}
                  alt={data.user.name}
                  style={{ width: 76, height: 76, borderRadius: 8, objectFit: "cover", border: `1px solid ${ATANDA.line}` }}
                />
              )}
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.05 }} data-testid="text-resume-name">
                  {data.user.name}
                </div>
                {(data.identity.currentRole || data.identity.currentEmployer) && (
                  <div style={{ fontSize: 14, color: ATANDA.sub, marginTop: 4 }}>
                    {[data.identity.currentRole, data.identity.currentEmployer].filter(Boolean).join(" @ ")}
                  </div>
                )}
                <div style={{ fontSize: 11, color: ATANDA.ink, marginTop: 8, lineHeight: 1.5 }}>
                  {[data.identity.contactEmail, data.identity.contactPhone, data.identity.location].filter(Boolean).join("  •  ")}
                </div>
                <div style={{ fontSize: 11, color: ATANDA.blue, marginTop: 2, lineHeight: 1.5 }}>
                  {[data.identity.linkLinkedin, data.identity.linkGithub, data.identity.linkPortfolio].filter(Boolean).join("  •  ")}
                </div>
              </div>
            </div>

            {/* JST — the headline metric, deliberately top-right */}
            <div
              style={{ background: ATANDA.blue, color: "#fff", borderRadius: 10, padding: "12px 16px", textAlign: "center", minWidth: 130 }}
              data-testid="block-jst-top-right"
            >
              <div style={{ fontSize: 9, letterSpacing: 2, opacity: 0.85 }}>JST INDEX</div>
              <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1 }}>{data.jst.total}</div>
              <div style={{ fontSize: 9, opacity: 0.85, marginTop: 2 }}>/ 300</div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 6, marginTop: 8, fontSize: 9 }}>
                <span>J {data.jst.jobs}</span>
                <span>S {data.jst.skills}</span>
                <span>T {data.jst.talent}</span>
              </div>
            </div>
          </div>

          {/* ATS + ARK strip */}
          <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 220, border: `1px solid ${ATANDA.line}`, borderRadius: 8, padding: "10px 14px" }} data-testid="block-ats-score">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: ATANDA.sub, letterSpacing: 1 }}>ATS READINESS</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: ATANDA.blue }}>
                  {data.ats.score}<span style={{ fontSize: 12, color: ATANDA.sub }}>/100</span>
                </span>
              </div>
              <div style={{ marginTop: 6 }}>
                <Bar value={data.ats.score} max={100} color={ATANDA.blue} />
              </div>
              <div style={{ fontSize: 10, color: ATANDA.sub, marginTop: 4 }}>{data.ats.band}</div>
            </div>
            <div style={{ width: 150, border: `1px solid ${ATANDA.line}`, borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: ATANDA.sub, letterSpacing: 1 }}>ARK SCORE</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: ATANDA.ink }}>
                {data.user.arkScore}<span style={{ fontSize: 11, color: ATANDA.sub }}>/600</span>
              </div>
              {data.user.arkIdString && (
                <div style={{ fontSize: 8.5, color: ATANDA.sub, marginTop: 2, wordBreak: "break-all" }}>{data.user.arkIdString}</div>
              )}
            </div>
          </div>

          {/* ATS breakdown */}
          {data.ats.items && data.ats.items.length > 0 && (
            <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "4px 24px" }} data-testid="block-ats-breakdown">
              {data.ats.items.map((it) => (
                <div key={it.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: ATANDA.sub }}>
                  <span>{it.label}</span>
                  <span style={{ fontWeight: 700, color: ATANDA.ink }}>{it.points}/{it.max}</span>
                </div>
              ))}
            </div>
          )}

          {/* Verified Skills & Roles — global deck */}
          {data.verifiedDeck.length > 0 && (
            <Section title="Verified Skills & Roles">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }} data-testid="block-verified-deck">
                {data.verifiedDeck.map((c) => {
                  const skillConfirmation = skillConf(c.cardId);
                  const standards = standardsLabels(c.mappings);
                  return (
                    <div
                      key={c.cardId}
                      style={{ display: "flex", alignItems: "center", gap: 6, border: `1px solid ${ATANDA.line}`, borderRadius: 8, padding: "6px 10px" }}
                      data-testid={`card-verified-${c.cardId}`}
                    >
                      <span style={{ fontSize: 16 }}>{c.emoji}</span>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700 }}>{c.name}</div>
                        <div style={{ fontSize: 9, color: ATANDA.sub }}>{c.category}</div>
                        {standards.length > 0 && (
                          <div style={{ fontSize: 8.5, color: ATANDA.sub, marginTop: 1 }} data-testid={`text-standards-${c.cardId}`}>
                            {standards.join(" · ")}
                          </div>
                        )}
                      </div>
                      <TierChip tier={c.tier} />
                      {skillConfirmation && (
                        <StatusBadge status={skillConfirmation.status} org={skillConfirmation.confirmerOrg} logoUrl={skillConfirmation.confirmerLogoUrl} />
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Experience — with per-company AI-mapped cards + confirmation */}
          {data.workHistory.length > 0 && (
            <Section title="Experience">
              {data.workHistory.map((w, i) => (
                <div key={i} style={{ marginBottom: 14 }} data-testid={`block-work-${i}`}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>
                      {[w.role, w.company].filter(Boolean).join(" — ") || w.company}
                    </div>
                    <div style={{ fontSize: 10, color: ATANDA.sub, whiteSpace: "nowrap" }}>
                      {[w.startDate, w.endDate].filter(Boolean).join(" – ")}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                    {w.location && <span style={{ fontSize: 10, color: ATANDA.sub }}>{w.location}</span>}
                    {w.company && (
                      <StatusBadge
                        status={w.confirmation?.status ?? "UNVERIFIED"}
                        org={w.confirmation?.confirmerOrg}
                        logoUrl={w.confirmation?.confirmerLogoUrl}
                      />
                    )}
                  </div>
                  {w.highlights && w.highlights.length > 0 && (
                    <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
                      {w.highlights.map((h, hi) => (
                        <li key={hi} style={{ fontSize: 11, lineHeight: 1.5, color: ATANDA.ink }}>{h}</li>
                      ))}
                    </ul>
                  )}
                  {w.mappedCards.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }} data-testid={`block-work-cards-${i}`}>
                      {w.mappedCards.map((c) => {
                        const standard = standardsLabels(c.mappings, 1)[0];
                        return (
                          <span
                            key={c.cardId}
                            title={standardsLabels(c.mappings, 6).join(" · ")}
                            style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 600, color: ATANDA.blue, background: ATANDA.panel, border: `1px solid ${ATANDA.line}`, borderRadius: 999, padding: "1px 8px" }}
                          >
                            {c.emoji} {c.name}
                            {standard && <span style={{ fontSize: 8.5, fontWeight: 500, color: ATANDA.sub }}>{standard}</span>}
                            <TierChip tier={c.tier} />
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </Section>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <Section title="Education">
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {data.education.map((e: string, i: number) => (
                  <li key={i} style={{ fontSize: 11.5, lineHeight: 1.6 }}>{e}</li>
                ))}
              </ul>
            </Section>
          )}

          {/* Certifications */}
          {data.certifications.length > 0 && (
            <Section title="Certifications">
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {data.certifications.map((c: string, i: number) => {
                  const confirmation = certConf(c);
                  return (
                    <li key={i} style={{ fontSize: 11.5, lineHeight: 1.6 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        {c}
                        <StatusBadge status={confirmation?.status ?? "UNVERIFIED"} org={confirmation?.confirmerOrg} logoUrl={confirmation?.confirmerLogoUrl} />
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Section>
          )}

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24, paddingTop: 12, borderTop: `1px solid ${ATANDA.line}` }}>
            <img src={atandaLogo} alt="ATANDA" style={{ height: 22, objectFit: "contain" }} />
            <span style={{ fontSize: 9, color: ATANDA.sub }}>
              Generated by ARK · Verified skills mapped to O*NET / WEF / SFIA standards
            </span>
          </div>
        </div>
      </div>
    );
  },
);
