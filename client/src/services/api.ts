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

const appKey = import.meta.env.VITE_APP_KEY;

// Dev MUST go through the Vite proxy (`/v1`) so requests are same-origin and
// the backend's session cookie is preserved. A direct cross-origin call to
// the API would drop the cookie and every authenticated request would 401.
// VITE_API_URL is therefore only used for production builds.
export const BASE_URL = import.meta.env.DEV
  ? "/v1"
  : (import.meta.env.VITE_API_URL?.trim() || "https://api.atanda.ai/v1");

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    appKey: appKey ?? "",
  },
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
