import { useCallback, useEffect } from "react";
import type { Router } from "expo-router";

export const useAuthBackNavigation = (router: Router) =>
  useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/auth");
    }
  }, [router]);

export const useRedirectIfAuthenticated = (
  isAuthenticated: boolean,
  router: Router
) => {
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);
};
