import { Link } from "react-router-dom";
import { FileText, History, Upload as UploadIcon } from "lucide-react";

interface DashboardHeaderProps {
  name: string;
  role: string;
}

const actionClass =
  "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg border font-mono text-xs uppercase tracking-widest transition-colors focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none";

/** Intelligence Hub title bar + quick actions. */
export function DashboardHeader({ name, role }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white uppercase tracking-wider">
          Intelligence Hub
        </h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">
          SUBJECT: <span className="text-primary">{name}</span> · ROLE: {role}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <Link
          to="/ark/history"
          data-testid="link-ark-history"
          className={`${actionClass} border-white/15 text-muted-foreground hover:border-white/30 hover:text-white`}
        >
          <History className="w-4 h-4" /> History
        </Link>
        <Link
          to="/report"
          data-testid="link-report"
          className={`${actionClass} border-primary/40 text-primary hover:bg-primary/10`}
        >
          <FileText className="w-4 h-4" /> Report
        </Link>
        <Link
          to="/upload"
          data-testid="link-upload-new"
          className={`${actionClass} border-transparent bg-primary text-primary-foreground hover:bg-primary/90`}
        >
          <UploadIcon className="w-4 h-4" /> Upload CV
        </Link>
      </div>
    </div>
  );
}
