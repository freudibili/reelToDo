import type { Session, User, VerifyOtpParams } from "@supabase/supabase-js";

export type RequestStatus = "idle" | "pending" | "succeeded" | "failed";

export type AuthRequestKey =
  | "signIn"
  | "signUp"
  | "magicLink"
  | "verifyOtp"
  | "passwordReset"
  | "updatePassword"
  | "signOut";

export type EmailOtpType = Extract<
  VerifyOtpParams["type"],
  "email" | "magiclink" | "signup" | "recovery"
>;

export type AuthState = {
  session: Session | null;
  user: User | null;
  error: string | null;
  pendingEmail: string | null;
  pendingOtpType: EmailOtpType | null;
  requiresPasswordChange: boolean;
  sessionExpired: boolean;
  requests: Record<AuthRequestKey, RequestStatus>;
};
