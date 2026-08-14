import { ResumeSheet } from "@/components/ark-resume";
import { DemoHelperCallout } from "@/components/demo/DemoHelperCallout";
import { Button } from "@/components/ui/button";
import { FileText, FileImage, FileType2 } from "lucide-react";
import type { ArkResume } from "@/services/ark-resume.service";

const MOCK_RESUME: ArkResume = {
  user: {
    name: "Sarah Chen",
    arkScore: 487,
    arkIdString: "ARK-CHEN-8291-ATLAS",
    headshotDataUrl: null,
  },
  identity: {
    currentRole: "Senior Product Manager",
    currentEmployer: "Atlas Logistics",
    contactEmail: "sarah.chen@atlaslogistics.io",
    contactPhone: "+1 (512) 555-0192",
    location: "Austin, TX · Remote-friendly",
    linkLinkedin: "linkedin.com/in/sarahchen-pm",
    linkGithub: "github.com/schen-orchestrator",
    linkPortfolio: "schen.pm",
  },
  jst: {
    total: 247,
    jobs: 79,
    skills: 88,
    talent: 80,
  },
  ats: {
    score: 92,
    band: "ATS Optimized - Ready for Enterprise Pipelines",
    items: [
      { label: "Keyword Density", points: 28, max: 30 },
      { label: "Structural Parsing", points: 30, max: 30 },
      { label: "Semantic Skill Coverage", points: 34, max: 40 },
    ],
  },
  verifiedDeck: [
    {
      cardId: "card-pm-1",
      emoji: "🚀",
      name: "Super Prompt Orchestration",
      category: "Product Management",
      mappings: { sfia: ["PROD-L5"] },
      tier: "Platinum",
    },
    {
      cardId: "card-pm-2",
      emoji: "📊",
      name: "AI-Assisted OKR Synthesis",
      category: "Product Operations",
      mappings: { wef: ["COG-SYS-1"] },
      tier: "Gold",
    },
  ],
  workHistory: [
    {
      role: "Senior Product Manager",
      company: "Atlas Logistics",
      startDate: "2022-04",
      endDate: "Present",
      location: "Austin, TX",
      highlights: [
        "Orchestrated B2B shipment pipeline scaling, saving 12% operational waste via AI routing scripts.",
        "Synthesized monthly stakeholder metrics reducing report preparation cycles from 3 days to 4 hours.",
      ],
      mappedCards: [
        {
          cardId: "card-pm-2",
          emoji: "📊",
          name: "AI-Assisted OKR Synthesis",
          category: "Product Operations",
          mappings: { wef: ["COG-SYS-1"] },
          tier: "Gold",
        },
      ],
      confirmation: {
        type: "EMPLOYMENT",
        targetRef: "card-pm-2",
        status: "CONFIRMED",
        confirmerOrg: "Atlas Logistics",
      },
    },
  ],
  education: ["M.S. in Management Science, Stanford University", "B.S. in Computer Science, UT Austin"],
  certifications: ["Context Craft Certified PM (CC-400)", "Agile Alliance Scrum Product Owner"],
  confirmations: [
    {
      type: "SKILL",
      targetRef: "card-pm-2",
      status: "CONFIRMED",
      confirmerOrg: "Atlas Logistics",
    },
  ],
};

function SectionExplanation({ text }: { text: string }) {
  return (
    <div className="p-3 bg-primary/5 border-l-2 border-primary text-xs text-muted-foreground font-mono leading-relaxed mt-3 rounded-r">
      <span className="text-primary font-bold uppercase tracking-wider">Guide · </span>{text}
    </div>
  );
}

export default function DemoPlanWalkthroughs() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Top Helper Callout */}
      <DemoHelperCallout
        stepLabel="Step 7 of 7 · Plan Walkthroughs / Verified Résumé"
        title="Plan Walkthroughs"
        subtitle="ATS-optimized verified skill resume & timeline"
        description="The final step is the ARK Resume. It is an ATS-optimized, machine-readable resume compiled from your verified skill primitives. Every skill card is mapped to global taxonomies (O*NET, WEF, SFIA) and backstopped by employer verification signatures to guarantee authenticity."
        takeaways={[
          "Generates verified credential packets shareable with a single link",
          "Translates CV statements into standard international competency codes",
          "Increases recruiter callback rates by bypassing semantic filters"
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">ARK RESUME</h1>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            ATS-optimized · verified-skill resume
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button disabled variant="outline" size="sm" className="cursor-not-allowed select-none text-muted-foreground/60">
            Add Photo
          </Button>
          <Button disabled size="sm" className="cursor-not-allowed select-none text-muted-foreground/60">
            <FileText className="w-4 h-4 mr-1" /> PDF (text)
          </Button>
          <Button disabled variant="outline" size="sm" className="cursor-not-allowed select-none text-muted-foreground/60">
            <FileImage className="w-4 h-4 mr-1" /> PNG
          </Button>
          <Button disabled variant="outline" size="sm" className="cursor-not-allowed select-none text-muted-foreground/60">
            <FileType2 className="w-4 h-4 mr-1" /> JPEG
          </Button>
        </div>
      </div>

      <div>
        <ResumeSheet data={MOCK_RESUME} />
        <SectionExplanation text="The printable Resume Sheet includes your verified JST index score prominently in the top right. Verified skills have a Confirmation badge showing employer or system trust audits." />
      </div>
    </div>
  );
}
