import * as Linking from "expo-linking";
import { supabase } from "@config/supabase";
import type {
  Session,
  User,
  VerifyOtpParams,
  Provider,
} from "@supabase/supabase-js";

export type AuthResult = {
  session: Session | null;
  user: User | null;
};

export type EmailOtpType = Extract<
  VerifyOtpParams["type"],
  "email" | "magiclink" | "signup" | "recovery"
>;

const toAuthResult = (data: {
  session: Session | null;
  user: User | null;
}): AuthResult => ({
  session: data.session,
  user: data.user,
});

const createRedirectUrl = (path = "auth") =>
  Linking.createURL(path.startsWith("/") ? path.slice(1) : path);

export const authService = {
  async signInWithPassword(payload: { email: string; password: string }) {
    const { data, error } = await supabase.auth.signInWithPassword(payload);
    if (error) throw new Error(error.message);
    return toAuthResult(data);
  },

  async signUpWithPassword(payload: { email: string; password: string }) {
    const { data, error } = await supabase.auth.signUp(payload);
    if (error) throw new Error(error.message);
    return toAuthResult(data);
  },

  async sendMagicLink(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: createRedirectUrl("auth/magic-link"),
        shouldCreateUser: true,
      },
    });
    if (error) throw new Error(error.message);
  },

  async verifyEmailOtp(params: {
    email: string;
    token: string;
    type: EmailOtpType;
  }) {
    const { data, error } = await supabase.auth.verifyOtp({
      email: params.email,
      token: params.token,
      type: params.type,
    });
    if (error) throw new Error(error.message);
    return toAuthResult(data);
  },

  async requestPasswordReset(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: createRedirectUrl("auth/reset-password"),
    });
    if (error) throw new Error(error.message);
  },

  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(error.message);
    const { data: sessionData } = await supabase.auth.getSession();
    return toAuthResult({
      session: sessionData.session ?? null,
      user: data.user ?? null,
    });
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  async signInWithProvider(
    provider: Extract<Provider, "google" | "apple" | "facebook">
  ) {
    const redirectTo = createRedirectUrl("auth");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    });
    if (error) throw new Error(error.message);
    return data;
  },
};
