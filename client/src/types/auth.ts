// ── Primitives ────────────────────────────────────────────────────────────────

export type UserRole = "user" | "admin" | "staff";
export type UserType = "free" | "premium";

// ── Subscription payload nested inside whoami ─────────────────────────

export interface WhoamiSubscriptionPlan {
  planId: string;
  title: string;
}

export interface WhoamiSubscription {
  id: string;
  userId: string;
  status: string;
  stripeSubscriptionId: string | null;
  startDate: string | null;
  endDate: string | null;
  duration: number | null;
  createdAt: string;
  updatedAt: string;
  plan: WhoamiSubscriptionPlan;
}

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
  stripeCustomerId: string | null;
  lastLogin: string | null;
  isActive: boolean | null;
  isVerified: boolean | null;
  createdAt: string;
  updatedAt: string;

  /** Nested subscription payload available in whoami (absent for free users). */
  subscription?: WhoamiSubscription | null;

  /** Plan UUID from subscription (if any). Used to match against Plan objects from /v1/plans/public. */
  planId: string | null;

  // App-layer fields — not returned by /auth/* but used across the UI.
  // Populated from other endpoints and merged into the auth cache via updateUser().
  username?: string | null;
  department?: string | null;
  seniority?: string | null;
  location?: string | null;
  institution?: string | null;
  contextCraftCertLevel?: string | null;

  /** Derived subscription-plan key (e.g. "INDIVIDUAL_FREE", "INSTITUTION").
   *  Populated from the nested `subscription.plan.title` in AuthContext. */
  subscriptionPlan?: string | null;
  /** Derived subscription status (e.g. "active", "inactive").
   *  Populated from the nested `subscription.status` in AuthContext. */
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
