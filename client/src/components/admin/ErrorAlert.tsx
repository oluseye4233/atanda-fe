import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorAlertProps {
  title?: string;
  message?: string | null;
}

export function ErrorAlert({ title = "Failed to load", message }: ErrorAlertProps) {
  if (!message) return null;
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="font-mono text-xs">{message}</AlertDescription>
    </Alert>
  );
}
