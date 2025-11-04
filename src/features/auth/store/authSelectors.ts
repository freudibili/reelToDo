import type { RootState } from "@core/store";

export const selectAuthSession = (state: RootState) => state.auth.session;
export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectIsAuthenticated = (state: RootState) =>
  Boolean(state.auth.session);
