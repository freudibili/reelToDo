import { useEffect } from "react";
import { router } from "expo-router";
import { useShareIntent } from "expo-share-intent";

export const useShareListener = () => {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();

  useEffect(() => {
    if (!hasShareIntent || !shareIntent) return;

    const encoded = encodeURIComponent(JSON.stringify(shareIntent));
    router.push(`/import?shared=${encoded}`);

    resetShareIntent();
  }, [hasShareIntent, shareIntent, resetShareIntent]);
};
