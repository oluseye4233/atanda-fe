import { apiClient } from "./api";
import type {
  AuthUser,
  SignupBody,
  SignupResponse,
  LoginBody,
  VerifyOtpBody,
  VerifyAccountResponse,
  ResendCodeResponse,
  RequestResetBody,
  RequestResetResponse,
  VerifyResetResponse,
  ResetPasswordBody,
  ResetPasswordResponse,
  LogoutResponse,
  UpdateMeBody,
} from "@/types/auth";

export const authService = {
  signup: (body: SignupBody) =>
    apiClient.post<SignupResponse>("/auth/signup", body),

  verifyAccount: (body: VerifyOtpBody) =>
    apiClient.post<VerifyAccountResponse>("/auth/verify-account", body),

  resendCode: () =>
    apiClient.post<ResendCodeResponse>("/auth/resend-code"),

  login: (body: LoginBody) =>
    apiClient.post<AuthUser>("/auth/login", body),

  logout: () =>
    apiClient.post<LogoutResponse>("/auth/logout"),

  whoami: () =>
    apiClient.get<AuthUser>("/auth/whoami"),

  updateMe: (body: UpdateMeBody) =>
    apiClient.patch<AuthUser>("/auth/me", body),

  requestReset: (body: RequestResetBody) =>
    apiClient.post<RequestResetResponse>("/auth/request-reset", body),

  verifyRequestReset: (body: VerifyOtpBody) =>
    apiClient.post<VerifyResetResponse>("/auth/verify-request-reset", body),

  resetPassword: (body: ResetPasswordBody) =>
    apiClient.post<ResetPasswordResponse>("/auth/reset-password", body),
};
