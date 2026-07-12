// ── Auth Types — derived from LL_UI_INTEGERATION.md ──────────────────────────

export type UserRole = "user" | "admin" | "staff";
export type UserType = "free" | "premium";

/** Canonical user object returned by login / whoami / PATCH me */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  type: UserType;
  role: UserRole;
  planId: string | null;
  stripeCustomerId: string | null;
  lastLogin: string | null;
  isActive: boolean | null;
  isVerified: boolean | null;
  createdAt: string;
  updatedAt: string;

  // ── App-layer fields ──────────────────────────────────────────────────────
  // These are not part of the backend /auth/* responses but are used
  // throughout the UI (profile, subscription, school, marketplace).
  // They are populated from other endpoints (assessments, subscriptions)
  // and merged into the auth cache via updateUser().
  username?: string | null;
  department?: string | null;
  seniority?: string | null;
  location?: string | null;
  institution?: string | null;
  contextCraftCertLevel?: string | null;
  subscriptionPlan?: string | null;
  subscriptionStatus?: string | null;
}

// ── Request bodies ────────────────────────────────────────────────────────────

export interface SignupBody {
  name: string;
  email: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface VerifyAccountBody {
  otp: string;
}

export interface ResendCodeBody {
  // intentionally empty — body is none; type kept for completeness
}

export interface RequestResetBody {
  email: string;
}

export interface VerifyResetBody {
  otp: string;
}

export interface ResetPasswordBody {
  password: string;
}

export interface UpdateMeBody {
  name?: string;
  email?: string;
}

// ── Response shapes ───────────────────────────────────────────────────────────

export interface SignupResponse {
  message: string;
  expiresInSeconds: number;
}

export interface VerifyAccountResponse {
  verified: boolean;
  message: string;
}

export interface ResendCodeResponse {
  message: string;
  expiresInSeconds: number;
}

export interface RequestResetResponse {
  message: string;
  expiresInSeconds: number;
}

export interface VerifyResetResponse {
  verified: boolean;
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface LogoutResponse {
  message: string;
}
