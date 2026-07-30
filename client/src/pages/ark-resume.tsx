import { useEffect, useRef, useState, useCallback } from "react";
import {
  Loader2,
  Lock,
  Upload as UploadIcon,
  X,
  FileText,
  FileImage,
  FileType2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/useAuth";
import { useSubscription } from "@/lib/useSubscription";
import { getApiErrorMessage } from "@/lib/apiError";
import {
  arkResumeService,
  type ArkResume,
  type ConfirmationClaimType,
  type ConfirmationInvite,
} from "@/services/ark-resume.service";
import { resumeService } from "@/services/resume.service";
import { Link } from "react-router-dom";
import { resumeFileStamp, exportResumePdf, exportResumeImage } from "@/lib/arkResumeExport";
import {
  ResumeSheet,
  ConfirmationRequests,
  InviteModal,
  ArkResumeEmptyState,
  toExportData,
} from "@/components/ark-resume";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export default function ArkResumePage() {
  const { user } = useAuth();
  const { canAccessArkResume } = useSubscription();

  const [resume, setResume] = useState<{
    data: ArkResume | null;
    loading: boolean;
    error: string | null;
  }>({ data: null, loading: true, error: null });
  const [exporting, setExporting] = useState<null | "pdf" | "png" | "jpeg">(null);
  const [uploadingHeadshot, setUploadingHeadshot] = useState(false);
  const [hasCv, setHasCv] = useState<boolean | null>(null);
  const [invites, setInvites] = useState<ConfirmationInvite[]>([]);

  const [inviteClaim, setInviteClaim] = useState<null | {
    type: ConfirmationClaimType;
    targetRef: string;
    targetLabel: string;
  }>(null);
  const [inviteDraft, setInviteDraft] = useState({
    email: "",
    name: "",
    org: "",
    message: "",
  });
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{
    link: string | null;
    emailSent: boolean;
    emailWarning: string | null;
    copied: boolean;
  }>({ link: null, emailSent: false, emailWarning: null, copied: false });
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteActions, setInviteActions] = useState<{
    actionId: string | null;
    resentLinks: Record<string, string>;
    copiedResentId: string | null;
  }>({ actionId: null, resentLinks: {}, copiedResentId: null });

  const sheetRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setResume((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { data: arkResume } = await arkResumeService.getResume();
      setResume({ data: arkResume, loading: false, error: null });
    } catch (err: unknown) {
      setResume({
        data: null,
        loading: false,
        error: getApiErrorMessage(err, "Unable to load your ARK Resume."),
      });
    }
  }, []);

  const loadInvites = useCallback(async () => {
    try {
      const { data: rows } = await arkResumeService.listConfirmationInvites();
      setInvites(rows);
    } catch {
      setInvites([]);
    }
  }, []);

  const checkCv = useCallback(async () => {
    try {
      const { data: count } = await resumeService.getMyCount();
      setHasCv(((count?.count ?? 0) + (count?.total ?? 0)) > 0);
    } catch {
      setHasCv(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    load();
    loadInvites();
    checkCv();
  }, [user, load, loadInvites, checkCv]);

  const openInvite = (claim: {
    type: ConfirmationClaimType;
    targetRef: string;
    targetLabel: string;
  }) => {
    setInviteClaim(claim);
    setInviteDraft({ email: "", name: "", org: "", message: "" });
    setInviteResult({ link: null, emailSent: false, emailWarning: null, copied: false });
    setInviteError(null);
  };

  const submitInvite = async () => {
    if (!inviteClaim) return;
    setInviteSubmitting(true);
    setInviteError(null);
    try {
      const { data: res } = await arkResumeService.createConfirmationInvite({
        type: inviteClaim.type,
        targetRef: inviteClaim.targetRef,
        targetLabel: inviteClaim.targetLabel,
        recipientEmail: inviteDraft.email.trim(),
        recipientName: inviteDraft.name.trim() || undefined,
        recipientOrg: inviteDraft.org.trim() || undefined,
        note: inviteDraft.message.trim() || undefined,
      });
      setInviteResult({
        link: res.link || `${window.location.origin}${res.path}`,
        emailSent: !!res.emailSent,
        emailWarning: res.emailSent ? null : res.emailError || null,
        copied: false,
      });
      await loadInvites();
    } catch (err: unknown) {
      setInviteError(getApiErrorMessage(err, "Could not create the invite."));
    } finally {
      setInviteSubmitting(false);
    }
  };

  const revokeInvite = async (id: string) => {
    setInviteActions((prev) => ({ ...prev, actionId: id }));
    try {
      await arkResumeService.revokeConfirmationInvite(id);
      await loadInvites();
    } catch {
      /* surfaced via reload; row stays as-is on failure */
    } finally {
      setInviteActions((prev) => ({ ...prev, actionId: null }));
    }
  };

  const resendInvite = async (id: string) => {
    setInviteActions((prev) => ({ ...prev, actionId: id }));
    try {
      const { data: res } = await arkResumeService.resendConfirmationInvite(id);
      setInviteActions((prev) => ({
        ...prev,
        resentLinks: { ...prev.resentLinks, [id]: `${window.location.origin}${res.path}` },
      }));
      await loadInvites();
    } catch {
      /* surfaced via reload; row stays as-is on failure */
    } finally {
      setInviteActions((prev) => ({ ...prev, actionId: null }));
    }
  };

  const copyResentLink = async (id: string) => {
    const link = inviteActions.resentLinks[id];
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setInviteActions((prev) => ({ ...prev, copiedResentId: id }));
      setTimeout(
        () => setInviteActions((prev) => ({ ...prev, copiedResentId: null })),
        2000,
      );
    } catch {
      /* clipboard unavailable — the link is still selectable in the field */
    }
  };

  const copyLink = async () => {
    if (!inviteResult.link) return;
    try {
      await navigator.clipboard.writeText(inviteResult.link);
      setInviteResult((prev) => ({ ...prev, copied: true }));
      setTimeout(() => setInviteResult((prev) => ({ ...prev, copied: false })), 2000);
    } catch {
      /* clipboard unavailable — the link is still selectable in the field */
    }
  };

  const handleExportPdf = async () => {
    if (!resume.data) return;
    setExporting("pdf");
    try {
      await exportResumePdf(toExportData(resume.data), resumeFileStamp(resume.data.user.name));
    } catch (err: unknown) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(null);
    }
  };

  const handleExportImage = async (type: "png" | "jpeg") => {
    const el = sheetRef.current;
    if (!el || !resume.data) return;
    setExporting(type);
    try {
      await exportResumeImage(el, type, resumeFileStamp(resume.data.user.name));
    } catch (err: unknown) {
      console.error("Image export failed:", err);
    } finally {
      setExporting(null);
    }
  };

  const handleHeadshotFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500_000) {
      setResume((prev) => ({ ...prev, error: "Headshot must be under 500KB." }));
      return;
    }
    setUploadingHeadshot(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      await arkResumeService.setHeadshot(dataUrl);
      await load();
    } catch (err: unknown) {
      setResume((prev) => ({
        ...prev,
        error: getApiErrorMessage(err, "Couldn't update your headshot. Please try again."),
      }));
    } finally {
      setUploadingHeadshot(false);
    }
  };

  const handleRemoveHeadshot = async () => {
    setUploadingHeadshot(true);
    try {
      await arkResumeService.deleteHeadshot();
      await load();
    } catch (err: unknown) {
      setResume((prev) => ({
        ...prev,
        error: getApiErrorMessage(err, "Couldn't remove your headshot. Please try again."),
      }));
    } finally {
      setUploadingHeadshot(false);
    }
  };

  if (resume.loading) {
    return (
      <div className="w-full max-w-4xl mx-auto min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="font-mono text-sm text-muted-foreground uppercase">
          Compiling ARK Resume...
        </p>
      </div>
    );
  }

  if (resume.error || !resume.data) {
    if (!canAccessArkResume) {
      return (
        <div
          className="w-full max-w-2xl mx-auto min-h-[60vh] flex flex-col items-center justify-center text-center px-6"
          data-testid="ark-resume-locked"
        >
          <Lock className="w-12 h-12 text-primary mb-4" />
          <h2 className="text-2xl font-display font-bold text-white mb-2">
            ARK RESUME is locked
          </h2>
          <p className="font-mono text-sm text-muted-foreground mb-6 max-w-lg">
            Upgrade to Pro (or higher) to unlock your ARK Resume.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/subscription"
              className="inline-flex items-center justify-center bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest h-10 px-4 rounded-md"
              data-testid="link-upgrade"
            >
              Upgrade Plan
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center border border-primary/50 text-primary hover:bg-primary/10 font-mono text-xs uppercase tracking-widest h-10 px-4 rounded-md"
              data-testid="link-verify-cards"
            >
              Verify a Primitive Card
            </Link>
          </div>
        </div>
      );
    }

    return <ArkResumeEmptyState error={resume.error} hasCv={hasCv} onRetry={load} />;
  }

  const headshot = (resume.data.user.headshotDataUrl as string | null) ?? null;

  return (
    <>
      <div className="w-full max-w-5xl mx-auto pb-16">
        {/* Action bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">ARK RESUME</h1>
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
              ATS-optimized · verified-skill resume
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleHeadshotFile}
              data-testid="input-headshot"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingHeadshot}
              data-testid="button-upload-headshot"
            >
              {uploadingHeadshot ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UploadIcon className="w-4 h-4 mr-1" />
              )}
              {headshot ? "Replace Photo" : "Add Photo"}
            </Button>
            {headshot && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveHeadshot}
                disabled={uploadingHeadshot}
                data-testid="button-remove-headshot"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleExportPdf}
              disabled={!!exporting}
              data-testid="button-export-pdf"
            >
              {exporting === "pdf" ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <FileText className="w-4 h-4 mr-1" />
              )}
              PDF (text)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportImage("png")}
              disabled={!!exporting}
              data-testid="button-export-png"
            >
              {exporting === "png" ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <FileImage className="w-4 h-4 mr-1" />
              )}
              PNG
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportImage("jpeg")}
              disabled={!!exporting}
              data-testid="button-export-jpeg"
            >
              {exporting === "jpeg" ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <FileType2 className="w-4 h-4 mr-1" />
              )}
              JPEG
            </Button>
          </div>
        </div>

        <ResumeSheet ref={sheetRef} data={resume.data} />

        <ConfirmationRequests
          data={resume.data}
          invites={invites}
          onRequest={openInvite}
          onRevoke={revokeInvite}
          onResend={resendInvite}
          actioningId={inviteActions.actionId}
          resentLinks={inviteActions.resentLinks}
          copiedResentId={inviteActions.copiedResentId}
          onCopyResent={copyResentLink}
        />
      </div>

      {inviteClaim && (
        <InviteModal
          claim={inviteClaim}
          email={inviteDraft.email}
          setEmail={(email) => setInviteDraft((prev) => ({ ...prev, email }))}
          name={inviteDraft.name}
          setName={(name) => setInviteDraft((prev) => ({ ...prev, name }))}
          org={inviteDraft.org}
          setOrg={(org) => setInviteDraft((prev) => ({ ...prev, org }))}
          message={inviteDraft.message}
          setMessage={(message) => setInviteDraft((prev) => ({ ...prev, message }))}
          submitting={inviteSubmitting}
          errorMsg={inviteError}
          link={inviteResult.link}
          emailSent={inviteResult.emailSent}
          emailWarning={inviteResult.emailWarning}
          copied={inviteResult.copied}
          onCopy={copyLink}
          onSubmit={submitInvite}
          onClose={() => setInviteClaim(null)}
        />
      )}
    </>
  );
}