import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { Session, User } from "@supabase/supabase-js";

import i18next from "@common/i18n/i18n";

import { authService, type AuthResult } from "../services/authService";
import type {
  RequestStatus,
  AuthRequestKey,
  EmailOtpType,
  AuthState,
} from "../types";

// Auth-related types are defined in ../types

const initialRequestState: Record<AuthRequestKey, RequestStatus> = {
  signIn: "idle",
  signUp: "idle",
  magicLink: "idle",
  verifyOtp: "idle",
  passwordReset: "idle",
  updatePassword: "idle",
  signOut: "idle",
};

const initialState: AuthState = {
  session: null,
  user: null,
  error: null,
  pendingEmail: null,
  pendingOtpType: null,
  requiresPasswordChange: false,
  sessionExpired: false,
  requests: { ...initialRequestState },
};

const setRequestStatus = (
  state: AuthState,
  key: AuthRequestKey,
  status: RequestStatus
) => {
  state.requests[key] = status;
  if (status !== "failed") {
    state.error = null;
  }
};

const toError = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const signInWithPassword = createAsyncThunk<
  AuthResult,
  { email: string; password: string },
  { rejectValue: string }
>("auth/signInWithPassword", async (payload, { rejectWithValue }) => {
  try {
    return await authService.signInWithPassword(payload);
  } catch (error) {
    return rejectWithValue(toError(error));
  }
});

export const signUpWithPassword = createAsyncThunk<
  AuthResult,
  { email: string; password: string },
  { rejectValue: string }
>("auth/signUpWithPassword", async (payload, { rejectWithValue }) => {
  try {
    return await authService.signUpWithPassword(payload);
  } catch (error) {
    return rejectWithValue(toError(error));
  }
});

export const requestMagicLink = createAsyncThunk<
  void,
  { email: string },
  { rejectValue: string }
>("auth/requestMagicLink", async ({ email }, { rejectWithValue }) => {
  try {
    await authService.sendMagicLink(email);
  } catch (error) {
    return rejectWithValue(toError(error));
  }
});

export const verifyEmailOtp = createAsyncThunk<
  AuthResult,
  { email: string; token: string; type: EmailOtpType },
  { rejectValue: string }
>("auth/verifyEmailOtp", async (payload, { rejectWithValue }) => {
  try {
    return await authService.verifyEmailOtp(payload);
  } catch (error) {
    return rejectWithValue(toError(error));
  }
});

export const requestPasswordReset = createAsyncThunk<
  void,
  { email: string },
  { rejectValue: string }
>("auth/requestPasswordReset", async ({ email }, { rejectWithValue }) => {
  try {
    await authService.requestPasswordReset(email);
  } catch (error) {
    return rejectWithValue(toError(error));
  }
});

export const updatePassword = createAsyncThunk<
  AuthResult,
  { password: string },
  { rejectValue: string }
>("auth/updatePassword", async ({ password }, { rejectWithValue }) => {
  try {
    return await authService.updatePassword(password);
  } catch (error) {
    return rejectWithValue(toError(error));
  }
});

export const signOut = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/signOut",
  async (_payload, { rejectWithValue }) => {
    try {
      await authService.signOut();
    } catch (error) {
      return rejectWithValue(toError(error));
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession: (
      state,
      action: PayloadAction<{ session: Session | null; user: User | null }>
    ) => {
      const hadSession = Boolean(state.session);
      state.session = action.payload.session;
      state.user = action.payload.user;
      if (hadSession && !action.payload.session) {
        state.sessionExpired = true;
      }
      if (action.payload.session) {
        state.sessionExpired = false;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    acknowledgeSessionExpiry: (state) => {
      state.sessionExpired = false;
    },
    setPendingEmail: (state, action: PayloadAction<string | null>) => {
      state.pendingEmail = action.payload;
    },
    setPendingOtpType: (state, action: PayloadAction<EmailOtpType | null>) => {
      state.pendingOtpType = action.payload;
    },
    setPasswordResetRequired: (state, action: PayloadAction<boolean>) => {
      state.requiresPasswordChange = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signInWithPassword.pending, (state) => {
        setRequestStatus(state, "signIn", "pending");
      })
      .addCase(signInWithPassword.fulfilled, (state, action) => {
        setRequestStatus(state, "signIn", "succeeded");
        state.session = action.payload.session;
        state.user = action.payload.user;
        state.pendingEmail = null;
        state.pendingOtpType = null;
        state.sessionExpired = false;
        state.requiresPasswordChange = false;
      })
      .addCase(signInWithPassword.rejected, (state, action) => {
        setRequestStatus(state, "signIn", "failed");
        state.error =
          (action.payload as string) ?? i18next.t("auth:errors.signIn");
      })
      .addCase(signUpWithPassword.pending, (state) => {
        setRequestStatus(state, "signUp", "pending");
      })
      .addCase(signUpWithPassword.fulfilled, (state, action) => {
        setRequestStatus(state, "signUp", "succeeded");
        state.session = action.payload.session;
        state.user = action.payload.user;
        state.sessionExpired = false;
        state.requiresPasswordChange = false;

        if (!action.payload.session) {
          state.pendingEmail = action.meta.arg.email;
          state.pendingOtpType = "signup";
        } else {
          state.pendingEmail = null;
          state.pendingOtpType = null;
        }
      })
      .addCase(signUpWithPassword.rejected, (state, action) => {
        setRequestStatus(state, "signUp", "failed");
        state.error =
          (action.payload as string) ?? i18next.t("auth:errors.signUp");
      })
      .addCase(requestMagicLink.pending, (state) => {
        setRequestStatus(state, "magicLink", "pending");
      })
      .addCase(requestMagicLink.fulfilled, (state, action) => {
        setRequestStatus(state, "magicLink", "succeeded");
        state.pendingEmail = action.meta.arg.email;
        state.pendingOtpType = "magiclink";
      })
      .addCase(requestMagicLink.rejected, (state, action) => {
        setRequestStatus(state, "magicLink", "failed");
        state.error =
          (action.payload as string) ?? i18next.t("auth:errors.magicLink");
      })
      .addCase(verifyEmailOtp.pending, (state) => {
        setRequestStatus(state, "verifyOtp", "pending");
      })
      .addCase(verifyEmailOtp.fulfilled, (state, action) => {
        setRequestStatus(state, "verifyOtp", "succeeded");
        state.session = action.payload.session;
        state.user = action.payload.user;
        state.pendingEmail = action.meta.arg.email;
        state.pendingOtpType = action.meta.arg.type;
        state.sessionExpired = false;
        state.requiresPasswordChange = action.meta.arg.type === "recovery";
      })
      .addCase(verifyEmailOtp.rejected, (state, action) => {
        setRequestStatus(state, "verifyOtp", "failed");
        state.error =
          (action.payload as string) ?? i18next.t("auth:errors.verifyOtp");
      })
      .addCase(requestPasswordReset.pending, (state) => {
        setRequestStatus(state, "passwordReset", "pending");
      })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        setRequestStatus(state, "passwordReset", "succeeded");
        state.pendingEmail = action.meta.arg.email;
        state.pendingOtpType = "recovery";
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        setRequestStatus(state, "passwordReset", "failed");
        state.error =
          (action.payload as string) ?? i18next.t("auth:errors.reset");
      })
      .addCase(updatePassword.pending, (state) => {
        setRequestStatus(state, "updatePassword", "pending");
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        setRequestStatus(state, "updatePassword", "succeeded");
        state.session = action.payload.session;
        state.user = action.payload.user;
        state.requiresPasswordChange = false;
        state.pendingOtpType = null;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        setRequestStatus(state, "updatePassword", "failed");
        state.error =
          (action.payload as string) ?? i18next.t("auth:errors.updatePassword");
      })
      .addCase(signOut.pending, (state) => {
        setRequestStatus(state, "signOut", "pending");
      })
      .addCase(signOut.fulfilled, (state) => {
        setRequestStatus(state, "signOut", "succeeded");
        state.session = null;
        state.user = null;
        state.pendingEmail = null;
        state.pendingOtpType = null;
        state.sessionExpired = false;
        state.requiresPasswordChange = false;
      })
      .addCase(signOut.rejected, (state) => {
        setRequestStatus(state, "signOut", "failed");
      });
  },
});

export const {
  setSession,
  clearError,
  acknowledgeSessionExpiry,
  setPendingEmail,
  setPendingOtpType,
  setPasswordResetRequired,
} = authSlice.actions;

export default authSlice.reducer;
