import { RootState } from "@core/store";

export const selectImportLoading = (state: RootState) => state.import.loading;

export const selectImportError = (state: RootState) => state.import.error;

export const selectImportedActivity = (state: RootState) =>
  state.import.activity;
