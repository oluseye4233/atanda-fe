import { AxiosError } from "axios";

/**
 * Normalizes an unknown thrown value into a user-facing message.
 * The backend returns either `{ message }` or `{ error }`; network/timeout
 * failures have no response. Falls back to a provided default.
 */
export function getApiErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (err instanceof AxiosError) {
    if (err.response) {
      const data = err.response.data as { message?: string; error?: string } | undefined;
      return data?.message || data?.error || fallback;
    }
    if (err.code === "ECONNABORTED") {
      return "The request timed out. Check your connection and try again.";
    }
    return "Couldn't reach the server. Check your connection and try again.";
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
