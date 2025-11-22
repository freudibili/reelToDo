import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@config/supabase";
import i18next from "@common/i18n/i18n";

type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  session: null,
  user: null,
  loading: false,
  error: null,
};

export const signInWithPassword = createAsyncThunk(
  "auth/signInWithPassword",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });
    if (error) return rejectWithValue(error.message);
    return data;
  }
);

export const signUpWithPassword = createAsyncThunk(
  "auth/signUpWithPassword",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
    });
    if (error) return rejectWithValue(error.message);

    if (data.session) {
      return data;
    }

    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: payload.email,
        password: payload.password,
      });
    if (signInError) return rejectWithValue(signInError.message);
    return signInData;
  }
);

export const signOut = createAsyncThunk("auth/signOut", async () => {
  await supabase.auth.signOut();
  return;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession: (
      state,
      action: PayloadAction<{ session: Session | null; user: User | null }>
    ) => {
      state.session = action.payload.session;
      state.user = action.payload.user;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signInWithPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInWithPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.session = action.payload.session;
        state.user = action.payload.user ?? null;
      })
      .addCase(signInWithPassword.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ?? i18next.t("auth:errors.signIn");
      })
      .addCase(signUpWithPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUpWithPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.session = action.payload.session;
        state.user = action.payload.user ?? null;
      })
      .addCase(signUpWithPassword.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) ?? i18next.t("auth:errors.signUp");
      })
      .addCase(signOut.pending, (state) => {
        state.loading = true;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.loading = false;
        state.session = null;
        state.user = null;
      })
      .addCase(signOut.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setSession, clearError } = authSlice.actions;
export default authSlice.reducer;
