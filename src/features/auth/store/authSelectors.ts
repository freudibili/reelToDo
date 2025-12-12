import type { RootState } from "@core/store";
import type { EmailOtpType } from "../types";

export const selectAuthSession = (state: RootState) => state.auth.session;
export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthError = (state: RootState) => state.auth.error;

export const selectAuthRequestStatus =
  (request: keyof RootState["auth"]["requests"]) => (state: RootState) =>
    state.auth.requests[request];

export const selectAuthLoading = (state: RootState) =>
  Object.values(state.auth.requests).some((status) => status === "pending");

export const selectIsAuthenticated = (state: RootState) =>
  Boolean(state.auth.session);

export const selectPendingEmail = (state: RootState) => state.auth.pendingEmail;
export const selectPendingOtpType = (state: RootState): EmailOtpType | null =>
  state.auth.pendingOtpType;

export const selectRequiresPasswordChange = (state: RootState) =>
  state.auth.requiresPasswordChange;

export const selectSessionExpired = (state: RootState) =>
  state.auth.sessionExpired;
