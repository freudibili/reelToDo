import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@core/store";

export type AppToastType = "info" | "success" | "error";

type ToastState = {
  message: string | null;
  type: AppToastType;
};

type AppState = {
  toast: ToastState;
};

const initialState: AppState = {
  toast: {
    message: null,
    type: "info",
  },
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    showToast: (
      state,
      action: PayloadAction<{ message: string; type?: AppToastType }>,
    ) => {
      state.toast.message = action.payload.message;
      state.toast.type = action.payload.type ?? "info";
    },
    hideToast: (state) => {
      state.toast.message = null;
    },
    resetApp: () => initialState,
  },
});

export const selectToast = (state: RootState) => state.app.toast;
export const { showToast, hideToast, resetApp } = appSlice.actions;
export default appSlice.reducer;

