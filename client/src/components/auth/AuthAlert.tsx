import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface AuthAlertProps {
  message: string;
  variant?: "error" | "success";
}

/** Inline feedback banner for auth forms (validation, API errors, success). */
export function AuthAlert({ message, variant = "error" }: AuthAlertProps) {
  const isError = variant === "error";
  const Icon = isError ? AlertCircle : CheckCircle2;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      role={isError ? "alert" : "status"}
      className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm ${
        isError
          ? "border-destructive/30 bg-destructive/8 text-destructive"
          : "border-secondary/30 bg-secondary/8 text-secondary"
      }`}
      data-testid={isError ? "text-auth-error" : "text-auth-success"}
    >
      <Icon className="h-4 w-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </motion.div>
  );
}
