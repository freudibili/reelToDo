import { useEffect } from "react";
import { router } from "expo-router";
import { useShareIntent } from "expo-share-intent";

export const useShareListener = () => {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();

  useEffect(() => {
    if (!hasShareIntent || !shareIntent) return;

    const sourceUrl = shareIntent.webUrl || shareIntent.text || null;

    const payload = {
      sourceUrl,
      ...shareIntent,
    };

    const encoded = encodeURIComponent(JSON.stringify(payload));
    router.push(`/import?shared=${encoded}`);

    resetShareIntent();
  }, [hasShareIntent, shareIntent, resetShareIntent]);
};
