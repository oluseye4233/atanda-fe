import { useQuery } from "@tanstack/react-query";
import { arkService } from "@/services/ark.service";
import { resumeService } from "@/services/resume.service";
import { useAuth } from "@/contexts/AuthContext";
import type { ArkIdentity, LhcsSignal, FlywheelCta } from "@/types/ark";
import type { Assessment } from "@/types/resume";

type Light = "green" | "amber" | "red";

function toLight(v: string | null): Light {
  if (v === "green" || v === "amber" || v === "red") return v;
  return "red";
}

/**
 * Single data source for the Intelligence Hub. Fetches ARK identity, the
 * latest assessment, the readiness (LHCS) signal, and the next-best-action
 * (flywheel) in parallel. Every query fails soft — a standalone client with
 * no backend simply renders empty states rather than crashing.
 */
export function useArkDashboard() {
  const { user } = useAuth();
  const userId = user?.id;

  const identity = useQuery({
    queryKey: ["ark", "identity"],
    queryFn: async (): Promise<ArkIdentity | null> => {
      try {
        return (await arkService.getIdentity()).data;
      } catch {
        return null;
      }
    },
    enabled: !!userId,
  });

  const assessment = useQuery({
    queryKey: ["assessment", "latest", userId],
    queryFn: async (): Promise<Assessment | null> => {
      if (!userId) return null;
      try {
        return (await resumeService.getLatest(userId)).data;
      } catch {
        return null;
      }
    },
    enabled: !!userId,
  });

  const lhcs = useQuery({
    queryKey: ["ark", "lhcs"],
    queryFn: async (): Promise<LhcsSignal | null> => {
      try {
        return (await arkService.getLhcs()).data;
      } catch {
        return null;
      }
    },
    enabled: !!userId,
  });

  const flywheel = useQuery({
    queryKey: ["ark", "flywheel"],
    queryFn: async (): Promise<FlywheelCta | null> => {
      try {
        return (await arkService.getFlywheelCta()).data;
      } catch {
        return null;
      }
    },
    enabled: !!userId,
  });

  // ── Map service payloads → widget-ready props ──
  const id = identity.data;

  const identityCard = id
    ? {
        arkScore: id.arkScore,
        jstIndex: id.jstIndex,
        ccmi: id.ccmi,
        ccmiTier: id.ccmiTier ?? "",
        vmstLevel: id.vmstLevel ?? "",
        typology: id.typology,
        arkIdString: id.arkIdString,
        resumeReplacementPct: id.resumeReplacementPct,
      }
    : null;

  const pillars = id
    ? {
        ...id.ccmiPillars,
        composite: id.ccmi,
        tier: id.ccmiTier ?? "",
        multiplier: 1,
      }
    : null;

  const lhcsData = lhcs.data
    ? {
        cprScore: lhcs.data.cprScore,
        mpsScore: lhcs.data.mpsScore,
        lcisScore: lhcs.data.lcisScore,
        cprLight: toLight(lhcs.data.cprLight),
        mpsLight: toLight(lhcs.data.mpsLight),
        lcisLight: toLight(lhcs.data.lcisLight),
        status: toLight(lhcs.data.status),
        readinessPct: lhcs.data.readinessPct,
      }
    : null;

  return {
    isLoading: identity.isLoading || assessment.isLoading,
    identity: id,
    identityCard,
    pillars,
    assessment: assessment.data,
    lhcs: lhcsData,
    flywheel: flywheel.data,
    hasData: !!id || !!assessment.data,
  };
}
