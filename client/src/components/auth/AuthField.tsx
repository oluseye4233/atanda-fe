import { useState, type ComponentType, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Leading icon (lucide component) */
  icon: ComponentType<{ className?: string }>;
  /** When true, renders a show/hide password toggle */
  isPassword?: boolean;
}

/**
 * Labelled text input with a leading icon and optional password reveal —
 * the single field primitive shared across all auth forms.
 */
export function AuthField({ label, icon: Icon, isPassword, type, ...rest }: AuthFieldProps) {
  const [show, setShow] = useState(false);
  const resolvedType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-mono uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
        <input
          type={resolvedType}
          className={`w-full rounded-lg border border-white/10 bg-white/3 pl-10 ${
            isPassword ? "pr-11" : "pr-4"
          } py-3 text-sm text-white placeholder:text-muted-foreground/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus:border-primary/50 transition-all`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
