import { useEffect, useRef } from "react";
import { router } from "expo-router";
import { useShareIntent } from "expo-share-intent";

export const useShareListener = () => {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();
  const lastHandledRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hasShareIntent || !shareIntent) return;

    const serialized = JSON.stringify(shareIntent);
    if (serialized === lastHandledRef.current) return;

    lastHandledRef.current = serialized;
    const encoded = encodeURIComponent(serialized);
    router.push(`/import?shared=${encoded}`);

    resetShareIntent();
  }, [hasShareIntent, shareIntent, resetShareIntent]);

  useEffect(() => {
    if (!hasShareIntent) {
      lastHandledRef.current = null;
    }
  }, [hasShareIntent]);
};
