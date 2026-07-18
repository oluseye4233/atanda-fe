import { useRef, useState, useCallback } from "react";
import { UploadCloud, FileText, X } from "lucide-react";

const ACCEPTED = [".pdf", ".doc", ".docx", ".txt"];
const MAX_BYTES = 20 * 1024 * 1024; // 20 MB — matches the backend limit

interface ResumeDropzoneProps {
  file: File | null;
  onFile: (file: File | null) => void;
  disabled?: boolean;
}

function isAccepted(name: string): boolean {
  const lower = name.toLowerCase();
  return ACCEPTED.some((ext) => lower.endsWith(ext));
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Accessible drag-and-drop résumé picker with client-side validation. */
export function ResumeDropzone({ file, onFile, disabled }: ResumeDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndSet = useCallback(
    (f: File | undefined) => {
      if (!f) return;
      if (!isAccepted(f.name)) {
        setError("Unsupported file. Use PDF, DOC, DOCX, or TXT.");
        return;
      }
      if (f.size > MAX_BYTES) {
        setError("That file is over the 20 MB limit.");
        return;
      }
      setError(null);
      onFile(f);
    },
    [onFile],
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    validateAndSet(e.dataTransfer.files?.[0]);
  };

  if (file) {
    return (
      <div
        className="flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/5 px-4 py-4"
        data-testid="resume-selected"
      >
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-white font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground font-mono">{formatBytes(file.size)}</p>
        </div>
        <button
          type="button"
          onClick={() => onFile(null)}
          disabled={disabled}
          aria-label="Remove file"
          data-testid="button-remove-file"
          className="text-muted-foreground/60 hover:text-destructive transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary/50 rounded"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        disabled={disabled}
        data-testid="dropzone-resume"
        className={`w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 transition-all focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none ${
          dragging
            ? "border-primary bg-primary/10"
            : "border-white/15 bg-white/2 hover:border-primary/40 hover:bg-white/3"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
          <UploadCloud className="h-6 w-6 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm text-white font-medium">
            Drop your CV here, or <span className="text-primary">browse</span>
          </p>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            PDF, DOC, DOCX or TXT · max 20 MB
          </p>
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="sr-only"
        onChange={(e) => validateAndSet(e.target.files?.[0])}
        data-testid="input-resume-file"
      />

      {error && (
        <p className="mt-2 text-xs text-destructive font-mono" role="alert" data-testid="text-file-error">
          {error}
        </p>
      )}
    </div>
  );
}
