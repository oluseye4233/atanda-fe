/**
 * services/api.ts
 *
 * Axios instance — base URL, credentials, and 401 interceptor with retry.
 * Nothing else lives here. Each module has its own service file.
 *
 * 401 behaviour:
 *  1. Ping /auth/whoami (sliding-expiry session check).
 *  2. If alive, flush the queue and retry all held requests.
 *  3. If dead, dispatch "ark:session-expired" so AuthContext can clear state
 *     and redirect to /login — no circular imports needed.
 */

import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

export const BASE_URL = "https://api.atanda.ai/v1";

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

// ── 401 interceptor ───────────────────────────────────────────────────────────

// Augment Axios config with our private retry flags
declare module "axios" {
  interface InternalAxiosRequestConfig {
    _skipRetry?: boolean;
    _retried?: boolean;
  }
}

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function flushQueue(err: unknown | null) {
  refreshQueue.forEach(({ resolve, reject }) =>
    err ? reject(err) : resolve(null),
  );
  refreshQueue = [];
}

async function pingSession(): Promise<boolean> {
  try {
    await apiClient.get("/auth/whoami", {
      _skipRetry: true,
    } as InternalAxiosRequestConfig);
    return true;
  } catch {
    return false;
  }
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const original = error.config as InternalAxiosRequestConfig;
    const status: number | undefined = error.response?.status;

    if (status !== 401 || original._retried || original._skipRetry) {
      return Promise.reject(error);
    }

    original._retried = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then(() => apiClient(original));
    }

    isRefreshing = true;
    const alive = await pingSession();
    isRefreshing = false;

    if (alive) {
      flushQueue(null);
      return apiClient(original);
    }

    flushQueue(new Error("Session expired"));
    window.dispatchEvent(new CustomEvent("ark:session-expired"));
    return Promise.reject(error);
  },
);
