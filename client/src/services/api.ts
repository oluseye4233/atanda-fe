/**
 * services/api.ts
 *
 * Axios instance — base URL, credentials, and a 401 handler.
 * Nothing else lives here. Each module has its own service file.
 *
 * 401 behaviour:
 *  This backend uses cookie-based sessions with sliding expiration — there is
 *  no separate refresh token. A 401 means the session is genuinely invalid,
 *  so there is nothing to "refresh" or retry: re-pinging any endpoint with
 *  the same (bad) cookie will just 401 again. We therefore do NOT retry the
 *  request. We simply notify the app once (debounced) via a custom event so
 *  AuthContext can clear the cached user — it does not touch any other
 *  cached data, so a single flaky/expired request can't cascade into wiping
 *  and refetching everything else in the query cache.
 */

import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

// In dev, go through the Vite proxy (see vite.config.ts) so requests are
// same-origin (localhost:5173) and the backend's session cookie is kept by
// the browser. A direct cross-origin call to api.atanda.ai would require the
// cookie to be SameSite=None, which the browser drops for cross-site XHRs —
// login would appear to succeed but every following request would 401.
export const BASE_URL = import.meta.env.DEV ? "/v1" : "https://api.atanda.ai/v1";

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

// ── 401 handling ──────────────────────────────────────────────────────────────

// Endpoints that are reachable without a session — a 401 from one of these
// (e.g. a wrong password on login) is not a "session expired" event and must
// not clear any cached auth state.
const PUBLIC_AUTH_PATHS = [
  "/auth/signup",
  "/auth/verify-account",
  "/auth/resend-code",
  "/auth/login",
  "/auth/request-reset",
  "/auth/verify-request-reset",
  "/auth/reset-password",
];

function isPublicAuthRequest(url: string | undefined): boolean {
  if (!url) return false;
  return PUBLIC_AUTH_PATHS.some((p) => url.startsWith(p));
}

// Debounce so a burst of parallel requests that all 401 together (e.g. a
// page firing several queries at once) dispatches the event only once.
let lastDispatch = 0;
const DISPATCH_WINDOW_MS = 500;

function notifySessionExpired() {
  const now = Date.now();
  if (now - lastDispatch < DISPATCH_WINDOW_MS) return;
  lastDispatch = now;
  window.dispatchEvent(new CustomEvent("ark:session-expired"));
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const original = error.config as InternalAxiosRequestConfig | undefined;
    const status: number | undefined = error.response?.status;

    if (status === 401 && !isPublicAuthRequest(original?.url)) {
      notifySessionExpired();
    }

    return Promise.reject(error);
  },
);
