import type { ArkResume, ArkResumeStandardsMappings } from "@/services/ark-resume.service";
import type { ResumeExportData } from "@/lib/arkResumeExport";

// Concise O*NET / WEF / SFIA standards labels for a mapped Primitive Card. Takes
// the first label from each framework so the living layer is explicitly tied to
// recognized skill standards (a core ARK RESUME requirement).
export function standardsLabels(
  mappings: ArkResumeStandardsMappings | null | undefined,
  max = 3,
): string[] {
  if (!mappings) return [];
  const out: string[] = [];
  if (mappings.onet?.[0]) out.push(`O*NET: ${mappings.onet[0]}`);
  if (mappings.wef?.[0]) out.push(`WEF: ${mappings.wef[0]}`);
  if (mappings.sfia?.[0]) out.push(`SFIA: ${mappings.sfia[0]}`);
  return out.slice(0, max);
}

export function toExportData(resume: ArkResume): ResumeExportData {
  return {
    name: resume.user.name,
    currentRole: resume.identity.currentRole,
    currentEmployer: resume.identity.currentEmployer,
    contactEmail: resume.identity.contactEmail,
    contactPhone: resume.identity.contactPhone,
    location: resume.identity.location,
    linkLinkedin: resume.identity.linkLinkedin,
    linkGithub: resume.identity.linkGithub,
    linkPortfolio: resume.identity.linkPortfolio,
    arkScore: resume.user.arkScore,
    jst: resume.jst,
    ats: { score: resume.ats.score, band: resume.ats.band },
    verifiedDeck: resume.verifiedDeck.map((card) => ({
      name: card.name,
      tier: card.tier,
      category: card.category,
      standards: standardsLabels(card.mappings),
    })),
    workHistory: resume.workHistory.map((work) => ({
      company: work.company ?? "",
      role: work.role,
      startDate: work.startDate,
      endDate: work.endDate,
      location: work.location,
      highlights: work.highlights,
      mappedCards: work.mappedCards.map((card) => ({
        name: card.name,
        tier: card.tier,
        standards: standardsLabels(card.mappings),
      })),
      confirmation: work.confirmation
        ? { status: work.confirmation.status, confirmerOrg: work.confirmation.confirmerOrg }
        : null,
    })),
    education: resume.education,
    certifications: resume.certifications,
  };
}
