import { Mail, Send, X, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ATANDA } from "@/lib/arkReportTheme";
import type { ArkResume, ArkResumeConfirmation, ConfirmationClaimType, ConfirmationInvite } from "@/services/ark-resume.service";

const CONF_STATUS_META: Record<string, { label: string; color: string }> = {
  CONFIRMED: { label: "Confirmed", color: ATANDA.green },
  PENDING: { label: "Pending", color: ATANDA.yellow },
  REJECTED: { label: "Rejected", color: ATANDA.red },
  UNVERIFIED: { label: "Unverified", color: ATANDA.sub },
};

const INVITE_STATUS_META: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Awaiting response", color: ATANDA.yellow },
  APPROVED: { label: "Approved", color: ATANDA.green },
  REJECTED: { label: "Declined", color: ATANDA.red },
  EXPIRED: { label: "Expired", color: ATANDA.sub },
};

type ClaimRow = {
  type: "EMPLOYMENT" | "CERTIFICATION" | "SKILL";
  targetRef: string;
  targetLabel: string;
  group: string;
};

interface ConfirmationRequestsProps {
  data: ArkResume;
  invites: ConfirmationInvite[];
  onRequest: (claim: { type: ConfirmationClaimType; targetRef: string; targetLabel: string }) => void;
  onRevoke: (id: string) => void;
  onResend: (id: string) => void;
  actioningId: string | null;
  resentLinks: Record<string, string>;
  copiedResentId: string | null;
  onCopyResent: (id: string) => void;
}

export function ConfirmationRequests({
  data,
  invites,
  onRequest,
  onRevoke,
  onResend,
  actioningId,
  resentLinks,
  copiedResentId,
  onCopyResent,
}: ConfirmationRequestsProps) {
  const claims: ClaimRow[] = [];
  for (const w of data.workHistory ?? []) {
    if (!w.company) continue;
    claims.push({
      type: "EMPLOYMENT",
      targetRef: w.company,
      targetLabel: [w.role, w.company].filter(Boolean).join(" — ") || w.company,
      group: "Employment",
    });
  }
  for (const c of data.certifications ?? []) {
    claims.push({ type: "CERTIFICATION", targetRef: c, targetLabel: c, group: "Certifications" });
  }
  for (const c of data.verifiedDeck ?? []) {
    claims.push({ type: "SKILL", targetRef: c.cardId, targetLabel: c.name, group: "Verified Skills" });
  }

  const allConfs = data.confirmations ?? [];
  const confByKey = new Map<string, ArkResumeConfirmation>();
  for (const c of allConfs) {
    confByKey.set(`${c.type}:${String(c.targetRef).toLowerCase()}`, c);
  }

  const statusOf = (claim: ClaimRow): string => {
    const conf = confByKey.get(`${claim.type}:${String(claim.targetRef).toLowerCase()}`);
    return conf?.status ?? "UNVERIFIED";
  };

  return (
    <div className="mt-8 glass-card rounded-lg p-5" data-testid="block-confirmation-requests">
      <div className="flex items-center gap-2 mb-1">
        <Mail className="w-4 h-4 text-primary" />
        <h2 className="text-lg font-display font-bold text-white">Request Confirmations</h2>
      </div>
      <p className="font-mono text-xs text-muted-foreground mb-4">
        Invite a former manager, registrar, or institution to verify a claim by email. They confirm with a no-login link — no ARK account needed.
      </p>

      {claims.length === 0 ? (
        <p className="text-sm text-muted-foreground">No claims available to confirm yet.</p>
      ) : (
        <div className="space-y-2">
          {claims.map((claim, i) => {
            const status = statusOf(claim);
            const meta = CONF_STATUS_META[status] ?? CONF_STATUS_META.UNVERIFIED;
            return (
              <div
                key={`${claim.type}-${claim.targetRef}-${i}`}
                className="flex items-center justify-between gap-3 border border-border rounded-md px-3 py-2"
                data-testid={`row-claim-${claim.type.toLowerCase()}-${i}`}
              >
                <div className="min-w-0">
                  <div className="text-xs font-mono uppercase tracking-wide text-muted-foreground">{claim.group}</div>
                  <div className="text-sm text-white truncate">{claim.targetLabel}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold" style={{ color: meta.color }} data-testid={`text-claim-status-${i}`}>
                    {meta.label}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRequest({ type: claim.type, targetRef: claim.targetRef, targetLabel: claim.targetLabel })}
                    data-testid={`button-request-confirmation-${i}`}
                  >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    Request
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {invites.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm font-bold text-white mb-2">Sent Requests</h3>
          <div className="space-y-2.5">
            {invites.map((inv) => {
              const meta = INVITE_STATUS_META[inv.status] ?? INVITE_STATUS_META.PENDING;
              const busy = actioningId === inv.id;
              const canRevoke = inv.status === "PENDING";
              const canResend = inv.status === "PENDING" || inv.status === "EXPIRED";
              const resentLink = resentLinks[inv.id];
              return (
                <div key={inv.id} className="text-xs border-b border-border/50 pb-2" data-testid={`row-invite-${inv.id}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-white truncate">{inv.targetLabel ?? inv.targetRef}</span>
                      <span className="text-muted-foreground"> → {inv.recipientEmail}</span>
                    </div>
                    <span className="font-bold shrink-0" style={{ color: meta.color }} data-testid={`text-invite-status-${inv.id}`}>
                      {meta.label}
                    </span>
                  </div>
                  {(canRevoke || canResend) && (
                    <div className="flex items-center gap-2 mt-1.5">
                      {canResend && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          disabled={busy}
                          onClick={() => onResend(inv.id)}
                          data-testid={`button-resend-invite-${inv.id}`}
                        >
                          <RotateCw className="w-3 h-3 mr-1" />
                          {inv.status === "EXPIRED" ? "Resend link" : "New link"}
                        </Button>
                      )}
                      {canRevoke && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                          disabled={busy}
                          onClick={() => onRevoke(inv.id)}
                          data-testid={`button-revoke-invite-${inv.id}`}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Revoke
                        </Button>
                      )}
                    </div>
                  )}
                  {resentLink && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <input
                        readOnly
                        value={resentLink}
                        className="flex-1 min-w-0 bg-background/60 border border-border rounded px-2 py-1 font-mono text-[11px] text-muted-foreground"
                        data-testid={`input-resent-link-${inv.id}`}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs shrink-0"
                        onClick={() => onCopyResent(inv.id)}
                        data-testid={`button-copy-resent-${inv.id}`}
                      >
                        {copiedResentId === inv.id ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
