import { Loader2, X, Send, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InviteModalProps {
  claim: { type: string; targetRef: string; targetLabel: string };
  email: string;
  setEmail: (v: string) => void;
  name: string;
  setName: (v: string) => void;
  org: string;
  setOrg: (v: string) => void;
  message: string;
  setMessage: (v: string) => void;
  submitting: boolean;
  errorMsg: string | null;
  link: string | null;
  emailSent: boolean;
  emailWarning: string | null;
  copied: boolean;
  onCopy: () => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function InviteModal({
  claim,
  email,
  setEmail,
  name,
  setName,
  org,
  setOrg,
  message,
  setMessage,
  submitting,
  errorMsg,
  link,
  emailSent,
  emailWarning,
  copied,
  onCopy,
  onSubmit,
  onClose,
}: InviteModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      data-testid="modal-invite"
    >
      <div className="w-full max-w-md glass-card rounded-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-display font-bold text-white">Request confirmation</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{claim.targetLabel}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-white" data-testid="button-close-invite">
            <X className="w-5 h-5" />
          </button>
        </div>

        {link ? (
          <div data-testid="block-invite-success">
            {emailSent ? (
              <p className="text-sm text-white mb-3" data-testid="text-invite-emailed">
                Invite emailed to your confirmer. The no-login link expires in 14 days — keep a copy below if you&apos;d like to resend it.
              </p>
            ) : (
              <p className="text-sm text-amber-400 mb-3" data-testid="text-invite-email-warning">
                {emailWarning || "Invite created, but the email could not be sent. Copy the no-login link below and send it to your confirmer — it expires in 14 days."}
              </p>
            )}
            <div className="flex items-center gap-2 mb-4">
              <input
                readOnly
                value={link}
                className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-xs text-white font-mono"
                data-testid="input-invite-link"
                onFocus={(e) => e.currentTarget.select()}
              />
              <Button variant="outline" size="sm" onClick={onCopy} data-testid="button-copy-link">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <Button className="w-full" onClick={onClose} data-testid="button-invite-done">
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono uppercase text-muted-foreground">Recipient email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@company.com"
                  className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-sm text-white"
                  data-testid="input-recipient-email"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono uppercase text-muted-foreground">Their name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Optional"
                    className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-sm text-white"
                    data-testid="input-recipient-name"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono uppercase text-muted-foreground">Their org</label>
                  <input
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    placeholder="Optional"
                    className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-sm text-white"
                    data-testid="input-recipient-org"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-mono uppercase text-muted-foreground">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Optional note to the recipient"
                  rows={2}
                  className="w-full mt-1 bg-background border border-border rounded-md px-3 py-2 text-sm text-white resize-y"
                  data-testid="input-invite-message"
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-destructive mt-3" data-testid="text-invite-error">
                {errorMsg}
              </p>
            )}

            <Button
              className="w-full mt-4"
              onClick={onSubmit}
              disabled={submitting || !email.trim()}
              data-testid="button-send-invite"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1" />}
              Send invite
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
