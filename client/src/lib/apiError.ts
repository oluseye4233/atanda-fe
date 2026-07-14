import { isAxiosError } from "axios";

const STATUS_MESSAGES: Record<number, string> = {
  400: "We couldn't process that request. Check the details and try again.",
  401: "Please sign in again, then try once more.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you requested.",
  405: "That action isn't available right now. Please try again later.",
  408: "The request timed out. Check your connection and try again.",
  409: "That action conflicts with the current account state. Refresh and try again.",
  413: "That submission is too large. Try a smaller file or shorter response.",
  415: "That file or format isn't supported.",
  422: "Some information needs attention. Review it and try again.",
  429: "Too many requests. Please wait a moment before trying again.",
};

function getResponseMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;

  const response = data as { message?: unknown; error?: unknown };
  for (const candidate of [response.message, response.error]) {
    if (typeof candidate === "string" && candidate.trim()) return candidate;
  }
  return null;
}

function getStatusMessage(status: number, fallback: string): string {
  if (STATUS_MESSAGES[status]) return STATUS_MESSAGES[status];
  if (status >= 500) return "Our service is temporarily unavailable. Please try again shortly.";
  return fallback;
}

/**
 * Normalizes unknown API failures into actionable, user-facing messages.
 * A specific backend `{ message }` or `{ error }` wins; otherwise Axios status,
 * timeout, and network failures receive safe fallbacks for every consumer.
 */
export function getApiErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (isAxiosError(err)) {
    if (err.response) {
      return getResponseMessage(err.response.data) ?? getStatusMessage(err.response.status, fallback);
    }
    if (err.code === "ECONNABORTED") {
      return "The request timed out. Check your connection and try again.";
    }
    return "Couldn't reach the server. Check your connection and try again.";
  }

  if (err instanceof Error && err.message.trim()) return err.message;
  return fallback;
}
