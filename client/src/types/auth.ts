// ── Primitives ────────────────────────────────────────────────────────────────

export type UserRole = "user" | "admin" | "staff";
export type UserType = "free" | "premium";

// ── Shared response fragments ─────────────────────────────────────────────────

interface TimedMessageResponse {
  message: string;
  expiresInSeconds: number;
}

interface VerificationResponse {
  verified: boolean;
  message: string;
}

interface MessageResponse {
  message: string;
}

// ── User object ───────────────────────────────────────────────────────────────

/** Canonical shape returned by login / whoami / PATCH me */
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

  // App-layer fields — not returned by /auth/* but used across the UI.
  // Populated from other endpoints and merged into the auth cache via updateUser().
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

export interface VerifyOtpBody {
  otp: string;
}

export interface RequestResetBody {
  email: string;
}

export interface ResetPasswordBody {
  password: string;
}

export interface UpdateMeBody {
  name?: string;
  email?: string;
}

// ── Response shapes ───────────────────────────────────────────────────────────

export type SignupResponse       = TimedMessageResponse;
export type ResendCodeResponse   = TimedMessageResponse;
export type RequestResetResponse = TimedMessageResponse;

export type VerifyAccountResponse   = VerificationResponse;
export type VerifyResetResponse     = VerificationResponse;

export type ResetPasswordResponse = MessageResponse;
export type LogoutResponse        = MessageResponse;
