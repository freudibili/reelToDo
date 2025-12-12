import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@core/store";

export type AppToastType = "info" | "success" | "error";

export type AppToastAction = {
  label: string;
  href?: string;
};

type ToastState = {
  message: string | null;
  type: AppToastType;
  action?: AppToastAction | null;
};

type AppState = {
  toast: ToastState;
};

const initialState: AppState = {
  toast: {
    message: null,
    type: "info",
    action: null,
  },
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    showToast: (
      state,
      action: PayloadAction<{
        message: string;
        type?: AppToastType;
        action?: AppToastAction | null;
      }>,
    ) => {
      state.toast.message = action.payload.message;
      state.toast.type = action.payload.type ?? "info";
      state.toast.action = action.payload.action ?? null;
    },
    hideToast: (state) => {
      state.toast.message = null;
      state.toast.action = null;
    },
    resetApp: () => initialState,
  },
});

export const selectToast = (state: RootState) => state.app.toast;
export const { showToast, hideToast, resetApp } = appSlice.actions;
export default appSlice.reducer;
